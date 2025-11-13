import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './base.js';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
    },
  }),
);
