import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.REACT_APP_F1_API_KEY || process.env.REACT_APP_F1_API_KEY || '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.REACT_APP_F1_API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/openf1': {
          target: 'https://api.openf1.org/v1',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/openf1/, ''),
        },
        '/api/f1': {
          target: 'https://api.openf1.org/v1',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/f1/, ''),
        },
      },
    },
  };
});
