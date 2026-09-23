import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  // Root .env lives two levels up from this app
  envDir: '../../',
  plugins: [
    react(),
    federation({
      name: 'pricing_mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './PricingApp': './src/App.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.2.8' },
        'react-dom': { singleton: true, requiredVersion: '^19.2.8' },
        '@fx-platform/rx-engine': { singleton: true },
        '@fx-platform/ui-components': { singleton: true },
      },
    }),
  ],
  server: {
    port: 3001,
    // Crucial for development: ensures the host app can cross-origin fetch assets from this port
    cors: true,
  },
  preview: {
    port: 3001, // 3001 for pricing-mfe
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
