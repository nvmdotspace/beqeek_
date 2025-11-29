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
            // IMPORTANT: Check specific packages BEFORE generic patterns
            // Order matters - more specific checks first!

            // TanStack ecosystem - check BEFORE 'react/' pattern
            if (id.includes('@tanstack/react-query')) return 'tanstack-query';
            if (id.includes('@tanstack/react-router')) return 'tanstack-router';
            if (id.includes('@tanstack/react-table')) return 'tanstack-table';
            if (id.includes('@tanstack/react-form')) return 'tanstack-form';

            // UI libraries - check BEFORE 'react/' pattern
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('lucide-react')) return 'lucide-icons';

            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) return 'react-hook-form';
            if (id.includes('zod')) return 'zod';

            // Flow chart library - large
            if (id.includes('@xyflow')) return 'xyflow';

            // DnD Kit
            if (id.includes('@dnd-kit')) return 'dnd-kit';

            // Monaco Editor - large
            if (id.includes('monaco-editor') || id.includes('monaco-yaml')) return 'monaco';

            // Utilities
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('axios')) return 'axios';
            if (id.includes('crypto-js')) return 'crypto-js';

            // React core - AFTER all specific checks
            // Use exact path matching to avoid false positives
            if (id.includes('/react-dom/')) return 'react-dom';
            if (id.match(/\/node_modules\/react\//) || id.includes('/scheduler/')) return 'react-core';

            // Remaining vendor packages
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml'],
  },
});
