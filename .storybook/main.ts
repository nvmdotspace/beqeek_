import type { StorybookConfig } from '@storybook/react-vite';
import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: [
    '../packages/**/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../packages/**/src/**/*.mdx',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Customize Vite config here
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@workspace/ui': join(__dirname, '../packages/ui/src'),
          '@workspace/active-tables-core': join(__dirname, '../packages/active-tables-core/src'),
          '@workspace/beqeek-shared': join(__dirname, '../packages/beqeek-shared/src'),
          '@workspace/encryption-core': join(__dirname, '../packages/encryption-core/src'),
        },
      },
    };
  },
};

export default config;
