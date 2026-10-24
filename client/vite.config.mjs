import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The staff console. It is served under /admin by the Node server, which runs
 * Vite in middleware mode during development, so the app keeps a single origin
 * and a single port (3000) for the SPA, the API and the public website.
 */
export default defineConfig({
  root: import.meta.dirname,
  base: '/admin/',
  plugins: [react()],
  server: {
    middlewareMode: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
