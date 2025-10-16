// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // This proxy configuration bypasses the CORS issue during local development
    proxy: {
      '/api-products': {
        target: 'https://catalog-management-system-dev-ak3ogf6zeauc.a.run.app',
        changeOrigin: true,
        secure: false, // Use if needed, but often defaults to false for http
        rewrite: (path) => path.replace(/^\/api-products/, ''),
      },
    },
  },
});