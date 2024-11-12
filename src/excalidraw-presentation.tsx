import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Excalidraw as ExcalidrawComponent,
  exportToCanvas,
} from '@excalidraw/excalidraw';
import type {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types/types.js';
import type { ExcalidrawFrameElement } from '@excalidraw/excalidraw/types/element/types';
import jspdf from 'jspdf';
import pptxgen from 'pptxgenjs';
import { PresentationToolbar } from './presentation-toolbar';
import {
  PresentationSidebar,
  getFrameElements,
} from './presentation-sidebar.js';
import useLocalStorage from './uselocalstorage';

function getCanvasDimensions(width: number, height: number) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const widthScale = windowWidth / width;
  const heightScale = windowHeight / height;
  const scale = Math.min(widthScale, heightScale);
  // E.g. if window is 1920x1080 and frame is 800x600, scale is 1.6
  // if window is 1920x1080 and frame is 600x800, scale is 1.35
  // 200, 100
  // 10, 20
  // scale -> Math.min(20, 5) = 5
  // canvas dimensions -> 10*5, 20*5 = 50, 100
  // So the height fits perfectly, but width is small in this case
  // Same thing would happen if the height was disproportionately big
  return {
    width: width * scale,
    height: height * scale,
    scale,
  };
}
// Find the diffing frames between two lists
// Return { framesOnlyInCanvas: [], framesOnlyInSlides: [] }
function frameDiff(frameIdsInCanvas: Array<string>, slides: Array<Slide>) {
  const frameIdsInSlides = slides.map((slide) => slide.frameId);

  return {
    framesOnlyInCanvas: frameIdsInCanvas.filter(
      (frameId) => !frameIdsInSlides.includes(frameId),
    ),
    framesOnlyInSlides: slides.filter(
      (slide) => !frameIdsInCanvas.includes(slide.frameId),
    ),
  };
}

// We can store just the frameIds as strings
// Why create a structure for it?
// So that we can add more properties to it in the future
// E.g. slide number, slide name, hidden or not etc.
export type Slide = {
  frameId: string;
};
type Props = {
  canvasId: number | string; // To uniquely store slides in local storage
  presName: string;
  showPresentationSidebar: boolean;
  editorRef: React.RefObject<ExcalidrawImperativeAPI>;
  onPresentationStart: () => void;
  onSidebarClose: () => void;
};
export function Presentation({
  canvasId,
  presName,
  showPresentationSidebar,
  editorRef,
  onPresentationStart,
  onSidebarClose,
}: Props) {
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRefPres = useRef<ExcalidrawImperativeAPI | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slidesFromLocalStorage, setSlides] = useLocalStorage<Array<Slide>>(
    `presentation-${canvasId}-frame-ids`,
    [],
  );
  // We know that slides will not change if slidesFromLocalStorage does not change
  // eslint-disable-next-line
  const slides: Slide[] = slidesFromLocalStorage || [];
  let frameIdsInCanvas = [] as Array<string>;
  if (editorRef.current) {
    frameIdsInCanvas = editorRef.current
      .getSceneElements()
      .filter((el) => el.type === 'frame')
      .map((frame) => frame.id);
  }
  // compareFrameLists function can return the diffing frame between two lists
  // E.g. { framesOnlyInCanvas: [], framesOnlyInSlides: [] }
  const { framesOnlyInCanvas, framesOnlyInSlides } = frameDiff(
    frameIdsInCanvas,
    slides,
  );
  if (framesOnlyInCanvas.length > 0 || framesOnlyInSlides.length > 0) {
    // If a frame is only in canvas, we add it to our slides list
    // If a frame is only in our slides, it means user has deleted it from the canvas
    // So we remove it from our slides list
    const newSlides = slides
      .concat(
        framesOnlyInCanvas.map((frameId) => {
          return { frameId };
        }),
      )
      .filter((slide) => {
        return !framesOnlyInSlides.some(
          (frame) => frame.frameId === slide.frameId,
        );
      });
    setSlides(newSlides);
  }

  const goToSlide = useCallback(
    (slideIndex: number) => {
      if (editorRefPres.current) {
        const frames = editorRefPres.current
          .getSceneElements()
          .filter((element) => {
            return element.type === 'frame';
          });
        const frameId = slides[slideIndex].frameId;
        const frame = frames.find((f) => f.id === frameId);
        if (frameId) {
          editorRefPres.current.scrollToContent(frame, {
            fitToContent: true,
            // @ts-expect-error fitToViewport is not in the types
            fitToViewport: true,
            animate: true,
            // @ts-expect-error viewportZoomFactor is not in the types
            viewportZoomFactor: 1,
          });
        }
      }
      // TODO - this is not the right way to hide the menu and footer
      if (containerRef.current) {
        const appMenu = containerRef.current.querySelector('.App-menu');
        if (appMenu) {
          // @ts-expect-error nope, it's there
          // eslint-disable-next-line
          appMenu.style.display = 'none';
        }
        const footer = containerRef.current.querySelector('footer');
        if (footer) {
          footer.style.display = 'none';
        }
      }
    },
    [slides],
  );
  useEffect(() => {
    if (isPresentationMode) {
      setTimeout(() => {
        goToSlide(currentSlideIndex);
      }, 0);
    }
  }, [isPresentationMode, currentSlideIndex, goToSlide]);
  function handlePresentationStartClick() {
    console.log('onPresentationStart');
    setPresentationMode(true);
    onPresentationStart();
  }
  function handlePresentationEndClick() {
    setPresentationMode(false);
    if (isFullscreen && document.fullscreenElement) {
      try {
        document.exitFullscreen();
      } catch (e) {
        console.error('Error exiting full screen mode', e);
      }
    }
  }
  function getSlideCount(): number {
    return slides.length;
  }
  function handlePrevSlideClick() {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }
  function handleNextSlideClick() {
    const slideCount = getSlideCount();
    if (currentSlideIndex < slideCount - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }
  function handleSlideSelect(frameId: string) {
    const frameIndex = slides.findIndex((slide) => slide.frameId === frameId);
    if (frameIndex >= 0) {
      setCurrentSlideIndex(frameIndex);
    }
  }
  function handleSlideOrderChange(frameIds: Array<string>) {
    setSlides(
      frameIds.map((frameId) => {
        return { frameId };
      }),
    );
  }
  function getInitialData() {
    if (editorRef.current) {
      return {
        elements: editorRef.current.getSceneElements(),
        appState: {
          frameRendering: {
            outline: false,
            name: false,
            enabled: true,
            clip: true,
          },
        },
        files: editorRef.current.getFiles() as BinaryFiles,
      };
    } else {
      return { elements: [], appState: {} };
    }
  }
  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }
  // Creates previews of each slide in a canvas and adds them as image to pptxgen
  // pptxgenjs then saves it as a file too
  async function handleDownloadAsPpt() {
    if (editorRef.current) {
      const pres = new pptxgen();
      pres.defineLayout({ name: 'A3', width: 16.5, height: 11.7 });
      for (const slide of slides) {
        const frameId = slide.frameId;
        const excalidrawCanvas = getFrameElements(editorRef, frameId);
        const canvas = await exportToCanvas({
          ...excalidrawCanvas,
          getDimensions: getCanvasDimensions,
          files: getFiles() || null,
        });
        const frame = editorRef.current
          .getSceneElements()
          .find(
            (element) => element.id === frameId,
          ) as ExcalidrawFrameElement | null;

        const imgData = canvas?.toDataURL('image/png', 1.0);
        const newSlide = pres.addSlide(frame?.name || '');
        newSlide.background = { data: imgData };
      }
      pres
        .writeFile({
          fileName: `${presName}.pptx`,
        })
        .catch((e) => {
          console.error('Error saving pptx file', e);
          alert('Could not save pptx file. Please try again.');
        });
    }
  }
  // Creates previews of each slide in a canvas and adds them as image to jspdf
  // jspdf then saves it as a file too
  async function handleDownloadAsPdf() {
    if (editorRef.current) {
      const pdf = new jspdf('l', 'px', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let i = 0;
      for (const slide of slides) {
        const frameId = slide.frameId;
        const excalidrawCanvas = getFrameElements(editorRef, frameId);
        const canvas = await exportToCanvas({
          ...excalidrawCanvas,
          getDimensions: getCanvasDimensions,
          files: getFiles() || null,
        });
        const widthRatio = pageWidth / canvas.width;
        const heightRatio = pageHeight / canvas.height;
        const ratio = Math.min(widthRatio, heightRatio);
        const canvasWidth = canvas.width * ratio;
        const canvasHeight = canvas.height * ratio;
        const marginX = (pageWidth - canvasWidth) / 2;
        const marginY = (pageHeight - canvasHeight) / 2;

        const imgData = canvas?.toDataURL('image/png', 1.0);
        pdf.addImage(
          imgData,
          'PNG',
          marginX,
          marginY,
          canvasWidth,
          canvasHeight,
        );
        i += 1;
        if (i < slides.length) {
          pdf.addPage();
        }
      }
      pdf.save(`${presName}.pdf`, { returnPromise: true }).catch((e) => {
        console.error('Error saving pdf file', e);
        alert('Could not save pdf file. Please try again.');
      });
    }
  }
  function handleSidebarClose() {
    onSidebarClose();
  }
  function getFiles(): BinaryFiles | undefined {
    return editorRef.current?.getFiles();
  }
  const frames = slides
    .map((slide) => {
      const frameId = slide.frameId;
      const frame = editorRef.current
        ?.getSceneElements()
        .find((element) => element.id === frameId) as
        | ExcalidrawFrameElement
        | undefined;
      return frame;
    })
    .filter((frame) => frame !== undefined)
    .map((frame) => ({
      ...frame,
      elements: getFrameElements(editorRef, frame!.id).elements,
    }));

  console.log({ isPresentationMode });
  return (
    <div ref={containerRef} id="excalidraw-presentation">
      {isPresentationMode ? (
        <PresentationToolbar
          frames={frames}
          files={getFiles()}
          currentSlideIndex={currentSlideIndex}
          isFullscreen={isFullscreen}
          totalSlides={getSlideCount()}
          onPrevSlideClick={handlePrevSlideClick}
          onNextSlideClick={handleNextSlideClick}
          onSlideSelect={handleSlideSelect}
          onPresentationEndClick={handlePresentationEndClick}
          toggleFullscreen={toggleFullscreen}
          onDownloadAsPdf={handleDownloadAsPdf}
          onDownloadAsPpt={handleDownloadAsPpt}
        />
      ) : null}
      {showPresentationSidebar ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            zIndex: 100,
            position: 'absolute',
            boxShadow: '0 8px 20px 0 #00000033',
            top: 0,
            bottom: 0,
            width: 320,
            background: '#f5f5f5',
            right: 0,
          }}
        >
          <PresentationSidebar
            editorRef={editorRef}
            slides={slides}
            onPresentationStartClick={handlePresentationStartClick}
            onSlideOrderChange={handleSlideOrderChange}
            onClose={handleSidebarClose}
            onDownloadAsPdf={handleDownloadAsPdf}
            onDownloadAsPptx={handleDownloadAsPpt}
          />
        </div>
      ) : null}
      {isPresentationMode ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 100,
            // TODO
            // &.App-menu {
            //   display: 'none',
            // }
            // &footer {
            //   display: 'none',
            // }
          }}
        >
          <ExcalidrawComponent
            excalidrawAPI={(api) => {
              editorRefPres.current = api;
            }}
            viewModeEnabled={true}
            zenModeEnabled={true}
            name={''}
            initialData={getInitialData()}
            onChange={() => {}}
            langCode={'en'}
          />
        </div>
      ) : null}
    </div>
  );
}
