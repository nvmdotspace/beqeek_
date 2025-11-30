import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    // Brotli compression (better ratio)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: 'localhost',
    port: 4175,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, '../../..'), path.resolve(__dirname, '../../packages')],
    },
  },
  preview: {
    host: 'localhost',
    port: 4175,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    cssMinify: true,
  },
});
