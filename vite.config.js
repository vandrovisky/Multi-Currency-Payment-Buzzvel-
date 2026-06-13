import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// Honour VITE_PORT so the dev server matches the port Sail forwards from the
// host. Falls back to Vite's default when unset.
const vitePort = process.env.VITE_PORT ? Number(process.env.VITE_PORT) : 5173;

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        port: vitePort,
        hmr: {
            host: 'localhost',
        },
    },
});
