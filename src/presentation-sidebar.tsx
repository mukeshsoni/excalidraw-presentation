import type {
  AppState,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types/types';
import React from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { Cancel, DotsVertical } from '@planview/pv-icons';
import { CSS } from '@dnd-kit/utilities';
import type {
  ExcalidrawElement,
  ExcalidrawFrameElement,
} from '@excalidraw/excalidraw/types/element/types';
import { color, cursor, spacing } from '@planview/pv-utilities';
import {
  ButtonPrimary,
  ButtonEmpty,
  DropdownMenu,
  Tooltip,
  ListItem,
} from '@planview/pv-uikit';
import { ExcalidrawPreview } from './preview';
import type { Slide } from './excalidraw-presentation';

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

  function handleDragEnd(e: DragEndEvent) {
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
  }
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
            `Slides ${slides.length}`
            <div style={{ display: 'flex' }}>
              {slides.length > 0 ? (
                <DropdownMenu
                  label="Presentation actions"
                  alignRight
                  trigger={(props) => (
                    <Tooltip unwrapped text="Presentation actions">
                      <ButtonEmpty
                        {...props}
                        icon={<DotsVertical />}
                        activated={props['aria-expanded']}
                        aria-label="Presentation actions"
                      />
                    </Tooltip>
                  )}
                >
                  <ListItem
                    label="Download as PDF"
                    onActivate={onDownloadAsPdf}
                  ></ListItem>
                  <ListItem
                    label="Download as PPTX"
                    onActivate={onDownloadAsPptx}
                  ></ListItem>
                </DropdownMenu>
              ) : null}
              <ButtonEmpty onClick={onClose} icon={<Cancel />} />
            </div>
          </div>
          <div
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
          </div>
        </div>
      </DndContext>
      <div style={{ width: '100%' }}>
        <ButtonPrimary
          onClick={onPresentationStartClick}
          style={{ width: '100%' }}
          disabled={slides.length === 0}
        >
          Begin presentation
        </ButtonPrimary>
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
        marginBottom: spacing.medium,
        position: 'relative',
        borderRadius: spacing.medium,
        border: `1px solid ${color.gray200}`,
        padding: spacing.small,
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
          width: '101%',
          display: 'flex',
          alignItems: 'center',
          padding: spacing.small,
          backgroundColor: color.gray100,
          opacity: 0.9,
          borderRadius: `0 0 ${spacing.medium}px ${spacing.medium}px`,
          color: color.gray600,
        }}
      >
        {frame !== undefined ? frame.name : 'Untitled'}
      </div>
    </li>
  );
}
