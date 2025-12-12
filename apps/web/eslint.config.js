import { config as reactInternalConfig } from '@workspace/eslint-config/react-internal';

const sharedConfig = Array.isArray(reactInternalConfig) ? reactInternalConfig : [reactInternalConfig];

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['src/paraglide/**', 'vite.config.ts', 'vite.config.*.ts', 'vitest.setup.ts'],
  },
  ...sharedConfig,
];
