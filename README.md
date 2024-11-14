# excalidraw-presentation

This is a library which you can use along with excalidraw library to add a presentation feature to excalidraw.

It is inspired from (excalidraw+)[https://plus.excalidraw.com/]

This component allows you to wrap elements in your Excalidraw canvas in frames and then present them as a slideshow.
It also allows you do download the presentation as a PDF or a Powerpoint file and share it with others.

## How to use it

### Install

Using `npm`

```bash
npm install --save excalidraw-presentation
```

Using `yarn`

```bash
yarn add excalidraw-presentation
```

Using `pnpm`

```bash
pnpm add excalidraw-presentation
```

### Usage

You can import `ExcalidrawPresentation` from `excalidraw-presentation` and use it as shown below:

```tsx
import { Excalidraw } from '@excalidraw/excalidraw';
import { ExcalidrawPresentation } from 'excalidraw-presentation';

function YourComponent() {
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
    <div style={{ width: 1000, height: 1000 }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          editorRef.current = api;
        }}
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
}
```

What we have done above is

- Added a button to Excalidraw footer. We will use that button to toggle the presentation sidebar.
- Added `ExcalidrawPresentation` component to the Excalidraw component.
- The `ExcalidrawPresentation` component is passed the `editorRef` which points to the Excalidraw editor instance.
- We also pass a prop `showPresentationSidebar` which is a boolean to show/hide the presentation sidebar.
- ExcalidrawPresentation will now detect all frames in the Excalidraw editor and show them in the sidebar.
- ExcalidrawPresentation can also show the frames as a standalone presentation by clicking on 'Start Presentation' button.

## Props

- `canvasId`: The id of the Excalidraw canvas. This is used to get the frames from the Excalidraw editor.
- `presName`: The name of the presentation.
- `editorRef`: The ref to the Excalidraw editor instance.
- `showPresentationSidebar`: A boolean to show/hide the presentation sidebar.
- `onPresentationStart`: A callback function which is called when the presentation is started. You can use that to hide the prsentation sidebar.
- `onSidebarClose`: A callback function which is called when the sidebar close button is clicked.

## Development

```bash
npm install
npm run dev
```

`npm run dev` will start a vite server. You should see the server address on the command line. Open that address in your browser to see the demo app.
