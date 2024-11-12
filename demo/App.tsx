import React from 'react';
import ReactDOM from 'react-dom/client';
import { Excalidraw, Footer } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

import { ExcalidrawPresentation } from '../src/excalidraw-presentation';
import ComputerIcon from './computer-icon';
import EmptyButton from '../src/empty-button';

const demoExcalidrawData = {
  type: 'excalidraw',
  version: 2,
  elements: [
    {
      type: 'rectangle',
      version: 12,
      versionNonce: 2029767488,
      isDeleted: false,
      id: 'tPsOu15t31hU2s-m6hye-',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 700.85546875,
      y: 174.44921875,
      strokeColor: '#1e1e1e',
      backgroundColor: 'transparent',
      width: 273.7265625,
      height: 221.79296875,
      seed: 1468529649,
      groupIds: [],
      frameId: 'pIbp09zJiBjbRU4GA7bmk',
      roundness: {
        type: 3,
      },
      boundElements: [],
      updated: 1730795616785,
      link: null,
      locked: false,
    },
    {
      type: 'frame',
      version: 13,
      versionNonce: 1969500992,
      isDeleted: false,
      id: 'pIbp09zJiBjbRU4GA7bmk',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      angle: 0,
      x: 624.05859375,
      y: 111.20703125,
      strokeColor: '#bbb',
      backgroundColor: 'transparent',
      width: 517.59375,
      height: 361.921875,
      seed: 1396642624,
      groupIds: [],
      frameId: null,
      roundness: null,
      boundElements: [],
      updated: 1730795616785,
      link: null,
      locked: false,
      name: null,
    },
    {
      type: 'arrow',
      version: 16,
      versionNonce: 2091905856,
      isDeleted: false,
      id: 'gMSJWwECpR3Uy2L56d9Yt',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 1359.43359375,
      y: 146.7421875,
      strokeColor: '#1e1e1e',
      backgroundColor: 'transparent',
      width: 259.51171875,
      height: 266.6015625,
      seed: 976115904,
      groupIds: [],
      frameId: 'wE8KgPtH7xbpuGXok3wV5',
      roundness: {
        type: 2,
      },
      boundElements: [],
      updated: 1730795621643,
      link: null,
      locked: false,
      startBinding: null,
      endBinding: null,
      lastCommittedPoint: null,
      startArrowhead: null,
      endArrowhead: 'arrow',
      points: [
        [0, 0],
        [259.51171875, 266.6015625],
      ],
    },
    {
      type: 'frame',
      version: 21,
      versionNonce: 645749568,
      isDeleted: false,
      id: 'wE8KgPtH7xbpuGXok3wV5',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      angle: 0,
      x: 1299.94921875,
      y: 102.28125,
      strokeColor: '#bbb',
      backgroundColor: 'transparent',
      width: 459.9921875,
      height: 419.421875,
      seed: 1500740416,
      groupIds: [],
      frameId: null,
      roundness: null,
      boundElements: [],
      updated: 1730795621521,
      link: null,
      locked: false,
      name: null,
    },
  ],
  appState: {},
  files: {},
};
const App = () => {
  const height = window.innerHeight || 700;
  const [showPresentationSidebar, setShowPresentationSidebar] =
    React.useState(false);
  const editorRef = React.useRef<ExcalidrawImperativeAPI | null>(null);

  const handleSidebarClose = () => {
    setShowPresentationSidebar(false);
  };
  const handlePresentationStart = () => {
    setShowPresentationSidebar(false);
  };
  const togglePresentationSidebar = () => {
    setShowPresentationSidebar((prev) => !prev);
  };

  return (
    <div style={{ width: '100%', height }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          editorRef.current = api;
        }}
        initialData={demoExcalidrawData}
      >
        <Footer>
          <div style={{ width: 12 }} />
          <EmptyButton
            onClick={togglePresentationSidebar}
            style={{
              backgroundColor: `rgb(236, 236, 244)`,
              borderRadius: 5,
              width: 36,
              height: 36,
            }}
          >
            <ComputerIcon />
          </EmptyButton>
        </Footer>
      </Excalidraw>
      {editorRef.current ? (
        <ExcalidrawPresentation
          canvasId={'c1'}
          presName={'Presentation 1'}
          editorRef={editorRef}
          showPresentationSidebar={showPresentationSidebar}
          onPresentationStart={handlePresentationStart}
          onSidebarClose={handleSidebarClose}
        />
      ) : null}
    </div>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(<App />);
