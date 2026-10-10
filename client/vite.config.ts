/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiPort = process.env.API_PORT ?? process.env.PORT ?? '3001';

export default defineConfig({
  plugins: [react()],
  build: {
    // Bundle is ~550 kB (MUI + Leaflet); silence Vite's default 500 kB warning.
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${apiPort}`,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
