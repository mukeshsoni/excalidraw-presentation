/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
import React from 'react';
import {
  ExcalidrawElement,
  ExcalidrawFrameElement,
} from '@excalidraw/excalidraw/types/element/types';
import { ExcalidrawPreview } from './preview';
import { BinaryFiles } from '@excalidraw/excalidraw/types/types';
import EmptyButton from './empty-button';

function Space({ h, w }: { h?: number; w?: number }) {
  return <div style={{ width: w, height: h }} />;
}

type Props = {
  frames: Array<
    ExcalidrawFrameElement & { elements: Array<ExcalidrawElement> }
  >;
  currentSlideIndex: number;
  totalSlides: number;
  isFullscreen: boolean;
  onPrevSlideClick: () => void;
  onNextSlideClick: () => void;
  onSlideSelect: (frameId: string) => void;
  onPresentationEndClick: () => void;
  toggleFullscreen: () => void;
  onDownloadAsPdf: () => void;
  onDownloadAsPpt: () => void;
  files: BinaryFiles | undefined;
};

export function PresentationToolbar({
  frames,
  files,
  currentSlideIndex,
  totalSlides,
  isFullscreen,
  onPrevSlideClick,
  onNextSlideClick,
  onPresentationEndClick,
  onSlideSelect,
  toggleFullscreen,
  onDownloadAsPdf,
  onDownloadAsPpt,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: '50px',
        zIndex: '1000',
        width: '100%',
      }}
    >
      <div
        style={{
          borderRadius: '10px',
          boxShadow: '0 8px 20px 0 #00000033',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '20px',
          }}
        >
          <button onClick={onPrevSlideClick} disabled={currentSlideIndex === 0}>
            {'<'}
          </button>
          <Space w={10} />
          <div style={{ display: 'none' }}>
            TODO: Slide selector
            {frames.map((frame) => (
              <SlideItem
                label={frame.name || 'Untitled'}
                onActivate={onSlideSelect.bind(null, frame.id)}
                key={`slide_selector_${frame.id}`}
                frame={frame}
                files={files}
              />
            ))}
          </div>
          <Space w={10} />
          <button
            onClick={onNextSlideClick}
            disabled={currentSlideIndex === totalSlides - 1}
          >
            {'>'}
          </button>
          <Space w={10} />
          <EmptyButton onClick={toggleFullscreen}>
            {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          </EmptyButton>
          <Space w={10} />
          <button onClick={onDownloadAsPdf}>Pdf</button>
          <Space w={10} />
          <button onClick={onDownloadAsPpt}>Ppt</button>
        </div>
        <button onClick={onPresentationEndClick}>End presentation</button>
      </div>
    </div>
  );
}

const color = {
  gray100: '#eeeeee',
  gray200: '#dddddd',
  gray600: '#555555',
};

function useListItem(props: any) {
  // TODO

  return {
    focused: false,
    onActivate: () => {},
    getItemProps: (props: { style: React.CSSProperties }) => ({
      'aria-disabled': false,
    }),
  };
}
// eslint-disable-next-line
type UseListItemProps = typeof useListItem extends (props: infer P) => any
  ? P
  : never;
function SlideItem({
  frame,
  files,
  ...props
}: UseListItemProps & {
  frame: ExcalidrawFrameElement & { elements: Array<ExcalidrawElement> };
  files: BinaryFiles | undefined;
}) {
  const { focused, onActivate, getItemProps } = useListItem(props);

  return (
    <li
      {...getItemProps({
        style: {
          cursor: 'pointer',
          // @ts-expect-error
          opacity: getItemProps()['aria-disabled'] ? 0.5 : 1,
          backgroundColor: props.selected ? '#eeeeee' : 'unset',
          border: focused ? `1px solid blue` : `1px solid ${color.gray200}`,
          marginBottom: 20,
          position: 'relative',
          borderRadius: 20,
          padding: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10,
          marginRight: 10,
          marginLeft: 10,
        },
      })}
      onClick={onActivate}
    >
      <ExcalidrawPreview
        data={{
          elements: frame.elements,
          appState: { viewBackgroundColor: '#fff' },
          files,
        }}
        width={180}
        height={120}
        withBackground={true}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '92%',
          display: 'flex',
          alignItems: 'center',
          padding: 10,
          backgroundColor: color.gray100,
          opacity: 0.9,
          borderRadius: `0 0 ${20}px ${20}px`,
          color: color.gray600,
          marginRight: 10,
          marginLeft: 10,
        }}
      >
        {frame !== undefined ? frame.name : 'Untitled'}
      </div>
    </li>
  );
}
