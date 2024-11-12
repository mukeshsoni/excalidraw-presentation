import type {
  AppState,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types/types';
import React from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  ExcalidrawElement,
  ExcalidrawFrameElement,
} from '@excalidraw/excalidraw/types/element/types';
import { ExcalidrawPreview } from './preview';
import type { Slide } from './excalidraw-presentation';
import EmptyButton from './empty-button';
import DropdownMenu, { Option } from './dropdownmenu';

export function getFrameElements(
  editorRef: React.RefObject<ExcalidrawImperativeAPI>,
  frameId: string,
) {
  if (editorRef.current) {
    const frameElement = editorRef.current
      .getSceneElements()
      .find((el) => el.id === frameId) as ExcalidrawFrameElement;
    return {
      appState: {
        frameRendering: {
          outline: false,
          name: false,
          enabled: true,
          clip: true,
        },
      },
      elements:
        editorRef.current
          ?.getSceneElements()
          .filter((el) => el.frameId === frameId)
          .concat(frameElement) || [],
    };
  } else {
    return { elements: [], appState: {} } as {
      elements: ExcalidrawElement[];
      appState: Partial<AppState>;
    };
  }
}

type Props = {
  editorRef: React.RefObject<ExcalidrawImperativeAPI>;
  slides: Array<Slide>;
  onPresentationStartClick: () => void;
  onSlideOrderChange: (frameIds: Array<string>) => void;
  onClose: () => void;
  onDownloadAsPdf: () => void;
  onDownloadAsPptx: () => void;
};
export function PresentationSidebar({
  editorRef,
  slides,
  onPresentationStartClick,
  onSlideOrderChange,
  onClose,
  onDownloadAsPdf,
  onDownloadAsPptx,
}: Props) {
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

  const handleDragEnd = (e: DragEndEvent) => {
    if (editorRef.current) {
      const { active, over } = e;
      if (!over) {
        return;
      }

      const oldIndex = slides.findIndex(
        (slide) => slide.frameId === (active.id as string),
      );
      const newIndex = slides.findIndex((slide) => slide.frameId === over.id);
      const newFrameIds = arrayMove(
        slides.map((slide) => slide.frameId),
        oldIndex,
        newIndex,
      );
      onSlideOrderChange(newFrameIds);
    }
  };
  const handleMenuOptionSelect = (option: Option) => {
    if (option.value === 'pdf') {
      onDownloadAsPdf();
    } else if (option.value === 'pptx') {
      onDownloadAsPptx();
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      <DndContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 10px',
              cursor: 'pointer',
              marginTop: 10,
            }}
          >
            Slides ({slides.length})
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {slides.length > 0 ? (
                <DropdownMenu
                  options={[
                    {
                      value: 'pdf',
                      label: 'Download as PDF',
                    },
                    {
                      value: 'pptx',
                      label: 'Download as PPTX',
                    },
                  ]}
                  onOptionSelect={handleMenuOptionSelect}
                />
              ) : null}
              <EmptyButton
                style={{
                  fontSize: 16,
                }}
                onClick={onClose}
              >
                ×
              </EmptyButton>
            </div>
          </div>
          <ul
            style={{
              overflowY: 'auto',
              padding: 10,
            }}
          >
            <SortableContext items={frames}>
              {slides.map((slide) => (
                <SlidePreview
                  editorRef={editorRef}
                  frameId={slide.frameId}
                  key={`slide_preview_${slide.frameId}`}
                />
              ))}
            </SortableContext>
          </ul>
        </div>
      </DndContext>
      <div style={{ width: '100%' }}>
        <button
          onClick={onPresentationStartClick}
          style={{
            width: '100%',
            border: 'none',
            padding: 10,
            cursor: 'pointer',
            backgroundColor: '#4a90e2',
            color: '#f5f5f5',
          }}
          disabled={slides.length === 0}
        >
          Begin presentation
        </button>
      </div>
    </div>
  );
}

type SlidePreviewProps = {
  editorRef: React.RefObject<ExcalidrawImperativeAPI>;
  frameId: string;
};

function SlidePreview({ editorRef, frameId }: SlidePreviewProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: frameId });
  const frame: ExcalidrawFrameElement | undefined = editorRef.current
    ?.getSceneElements()
    .find((el) => el.id === frameId) as ExcalidrawFrameElement | undefined;

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        marginBottom: 20,
        position: 'relative',
        borderRadius: 20,
        border: `1px solid #dddddd`,
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      <ExcalidrawPreview
        data={{
          ...getFrameElements(editorRef, frameId),
          files: editorRef.current?.getFiles(),
        }}
        width={280}
        height={170}
        withBackground={true}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '93%',
          display: 'flex',
          alignItems: 'center',
          padding: 10,
          backgroundColor: '#eeeeee',
          opacity: 0.9,
          borderRadius: `0 0 ${20}px ${20}px`,
          color: '#555555',
        }}
      >
        {frame !== undefined ? frame.name : 'Untitled'}
      </div>
    </li>
  );
}
