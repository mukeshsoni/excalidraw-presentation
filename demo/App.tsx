import React from 'react';
import ReactDOM from 'react-dom/client';
import MyComponent from '../src/excalidraw-presentation';

const App = () => {
  return React.createElement(MyComponent, { message: 'Hello, World!' });
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(<App />);
