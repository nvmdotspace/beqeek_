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
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // ===== CORE FRAMEWORK =====
            // React core (smallest, most cacheable)
            if (id.includes('react/') && !id.includes('react-dom') && !id.includes('react-hook-form')) {
              return 'react-core';
            }
            if (id.includes('react-dom')) return 'react-dom';

            // ===== UI FRAMEWORK =====
            // Radix UI - split into logical groups for better caching
            if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-alert-dialog')) {
              return 'radix-dialogs'; // Dialog-like components together
            }
            if (
              id.includes('@radix-ui/react-dropdown-menu') ||
              id.includes('@radix-ui/react-select') ||
              id.includes('@radix-ui/react-popover')
            ) {
              return 'radix-menus'; // Menu/Select components together
            }
            if (id.includes('@radix-ui')) {
              return 'radix-ui'; // Rest of Radix UI
            }

            // Icons - Keep separate for tree-shaking
            if (id.includes('lucide-react')) return 'lucide-icons';

            // ===== STATE & DATA MANAGEMENT =====
            // TanStack ecosystem - split by usage frequency
            if (id.includes('@tanstack/react-query')) return 'tanstack-query'; // Used everywhere
            if (id.includes('@tanstack/react-router')) return 'tanstack-router'; // Used everywhere
            if (id.includes('@tanstack/react-table')) return 'tanstack-table'; // Only in table views
            if (id.includes('@tanstack/react-form')) return 'tanstack-form'; // Only in forms

            // Zustand + middleware - MUST stay in vendor to avoid circular deps
            // DON'T split: causes circular dependency issues with stores using persist/devtools middleware

            // ===== HEAVY UTILITIES =====
            // Encryption - only used in encrypted tables
            if (id.includes('crypto-js')) return 'crypto-js';

            // Date utilities - used in many places
            if (id.includes('date-fns')) return 'date-fns';

            // HTTP client - used everywhere
            if (id.includes('axios')) return 'axios';

            // ===== FEATURE-SPECIFIC =====
            // DnD - only used in kanban/table reordering
            if (id.includes('@dnd-kit')) return 'dnd-kit';

            // ===== VENDOR (Everything else) =====
            // Contains: zustand, small utils, validators, etc.
            // Keeping zustand here prevents circular dependency issues
            return 'vendor';
          }
        },
      },
    },
  },
});
