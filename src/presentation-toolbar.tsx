/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
import React from 'react';
import { color, shadow, spacing } from '@planview/pv-utilities';
import {
  FilePdf,
  FilePowerpoint,
  FlowItemsAll,
  GoToNextHorizontal,
  GoToPreviousHorizontal,
  ResizeFull,
  ResizeSmall,
} from '@planview/pv-icons';
import { DropdownMenu, useListItem } from '@planview/pv-uikit';
import { ButtonDestructive, ButtonEmpty } from '@planview/pv-uikit/lib/button';
import {
  ExcalidrawElement,
  ExcalidrawFrameElement,
} from '@excalidraw/excalidraw/types/element/types';
import { ExcalidrawPreview } from './preview';
import { BinaryFiles } from '@excalidraw/excalidraw/types/types';

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
          <ButtonEmpty
            icon={<GoToPreviousHorizontal />}
            onClick={onPrevSlideClick}
            disabled={currentSlideIndex === 0}
          />
          <Space w={spacing.small} />
          <DropdownMenu
            label="Slide selector"
            trigger={(props) => (
              <ButtonEmpty {...props}>
                Slide {currentSlideIndex + 1} / {totalSlides}
              </ButtonEmpty>
            )}
            width={250}
          >
            {frames.map((frame) => (
              <SlideItem
                label={frame.name || 'Untitled'}
                onActivate={onSlideSelect.bind(null, frame.id)}
                key={`slide_selector_${frame.id}`}
                frame={frame}
                files={files}
              />
            ))}
          </DropdownMenu>
          <Space w={spacing.small} />
          <ButtonEmpty
            icon={<GoToNextHorizontal />}
            onClick={onNextSlideClick}
            disabled={currentSlideIndex === totalSlides - 1}
          />
          <Space w={spacing.small} />
          <ButtonEmpty
            icon={isFullscreen ? <ResizeSmall /> : <ResizeFull />}
            onClick={toggleFullscreen}
          />
          <Space w={spacing.small} />
          <ButtonEmpty icon={<FilePdf />} onClick={onDownloadAsPdf}>
            Pdf
          </ButtonEmpty>
          <Space w={spacing.small} />
          <ButtonEmpty icon={<FilePowerpoint />} onClick={onDownloadAsPpt}>
            Ppt
          </ButtonEmpty>
        </div>

        <ButtonDestructive
          icon={<FlowItemsAll />}
          onClick={onPresentationEndClick}
        >
          "End presentation"
        </ButtonDestructive>
      </div>
    </div>
  );
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
          opacity: getItemProps()['aria-disabled'] ? 0.5 : 1,
          backgroundColor: props.selected ? color.gray100 : 'unset',
          border: focused ? `1px solid blue` : `1px solid ${color.gray200}`,
          marginBottom: spacing.medium,
          position: 'relative',
          borderRadius: spacing.medium,
          padding: spacing.small,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: spacing.small,
          marginRight: spacing.small,
          marginLeft: spacing.small,
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
          padding: spacing.small,
          backgroundColor: color.gray100,
          opacity: 0.9,
          borderRadius: `0 0 ${spacing.medium}px ${spacing.medium}px`,
          color: color.gray600,
          marginRight: spacing.small,
          marginLeft: spacing.small,
        }}
      >
        {frame !== undefined ? frame.name : 'Untitled'}
      </div>
    </li>
  );
}
