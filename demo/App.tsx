import React from 'react';
import ReactDOM from 'react-dom/client';
import { Excalidraw } from '@excalidraw/excalidraw';
import ExcalidrawPresentation from '../src/excalidraw-presentation';

const App = () => {
  return (
    <div style={{ width: 1000, height: 1000 }}>
      <Excalidraw />
    </div>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(<App />);
