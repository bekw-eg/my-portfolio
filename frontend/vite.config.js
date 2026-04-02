import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      'lucide-react': fileURLToPath(new URL('./src/lib/lucide-react.jsx', import.meta.url)),
    },
  },
});
