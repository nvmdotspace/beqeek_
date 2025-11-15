import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: path.resolve(__dirname, 'src/routes'),
      generatedRouteTree: path.resolve(__dirname, 'src/routeTree.gen.ts'),
      autoCodeSplitting: true,
    }) as any,
    react(),
    paraglideVitePlugin({
      project: path.resolve(__dirname, '../../project.inlang'),
      outdir: path.resolve(__dirname, 'src/paraglide/generated'),
      strategy: ['url', 'cookie', 'preferredLanguage', 'localStorage', 'baseLocale'],
    }) as any,
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as any,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, '../../..'), path.resolve(__dirname, '../../../messages')],
    },
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 2000, // Chấp nhận chunks lớn hơn vì gzip sizes tốt (~500-600 kB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core - tách React và React-DOM
            if (id.includes('react/') && !id.includes('react-dom') && !id.includes('react-hook-form')) {
              return 'react-core';
            }
            if (id.includes('react-dom')) return 'react-dom';

            // UI libraries - tách thành chunks riêng
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('lucide-react')) return 'lucide-icons';

            // TanStack ecosystem - tách từng package
            if (id.includes('@tanstack/react-query')) return 'tanstack-query';
            if (id.includes('@tanstack/react-router')) return 'tanstack-router';
            if (id.includes('@tanstack/react-table')) return 'tanstack-table';
            if (id.includes('@tanstack/react-form')) return 'tanstack-form';

            // DnD Kit - có thể lớn
            if (id.includes('@dnd-kit')) return 'dnd-kit';

            // Utilities
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('axios')) return 'axios';
            if (id.includes('crypto-js')) return 'crypto-js';
            if (id.includes('zustand')) return 'zustand';

            // Còn lại vào vendor (nên nhỏ hơn nhiều)
            return 'vendor';
          }
        },
      },
    },
  },
});
