import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/excalidraw-presentation.tsx', // Entry point for your component
      name: 'ExcalidrawPresentation', // Library name (your component name)
      fileName: 'excalidraw-presentation', // Output file name (e.g., my-component.esm.js)
      formats: ['es'], // Output as ESM only
    },
    rollupOptions: {
      // Externalize React and ReactDOM (so they are not bundled with your component)
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
