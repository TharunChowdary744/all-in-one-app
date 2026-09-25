import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // BASE_PATH lets the app be served from a sub-path, e.g. /all-in-one-app/ on GitHub Pages.
  const env = loadEnv(mode, '.', '');
  return {
    base: env.BASE_PATH || '/',
    plugins: [react()],
    server: { port: 5173 },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 1500,
    },
  };
});
