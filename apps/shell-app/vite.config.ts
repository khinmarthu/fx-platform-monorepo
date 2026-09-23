import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig(({ mode }) => {
    // Root .env lives two levels up from this app
    const env = loadEnv(mode, '../../', 'VITE_');
    const pricingMfeUrl = env.VITE_PRICING_MFE_URL || 'http://localhost:3001';
    const blotterMfeUrl = env.VITE_BLOTTER_MFE_URL || 'http://localhost:3002';

    return {
        plugins: [
            react(),
            federation({
                name: 'shell_app',
                remotes: {
                    pricing_mfe: {
                        type: 'module',
                        name: 'pricing_mfe',
                        entry: `${pricingMfeUrl}/remoteEntry.js`,
                        entryGlobalName: 'pricing_mfe',
                        shareScope: 'default',
                    },
                    blotter_mfe: {
                        type: 'module',
                        name: 'blotter_mfe',
                        entry: `${blotterMfeUrl}/remoteEntry.js`,
                        entryGlobalName: 'blotter_mfe',
                        shareScope: 'default',
                    },
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
            port: 3000,
            // Ensures Vite fails immediately if 3000 is in use, preventing port collisions with MFEs
            strictPort: true,
        },
        build: {
            // Guarantees support for Top-Level await and ES Modules required by Federation 2.0
            target: 'es2022',
        },
    };
});
