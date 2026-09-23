import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'blotter_mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './BlotterApp': './src/App.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.2.8' },
        'react-dom': { singleton: true, requiredVersion: '^19.2.8' },
        'react-redux': { singleton: true, requiredVersion: '^9.3.0' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.12.0' },
        '@fx-platform/rx-engine': { singleton: true },
        '@fx-platform/store': { singleton: true },
        '@fx-platform/ui-components': { singleton: true },
      },
    }),
  ],
  server: {
    port: 3002,
    // Crucial for development: ensures the host app can cross-origin fetch assets from this port
    cors: true,
  },
  preview: {
    port: 3002, // 3002 for blotter-mfe
    cors: true, // Enables CORS headers during `pnpm preview`
    strictPort: true,
  },
  build: {
    // Required for Module Federation 2.0 to support top-level await initialization
    target: 'es2022',
    // Optional but recommended for MFEs: ensures preloaded module strategies do not clash
    modulePreload: false,
  },
});
