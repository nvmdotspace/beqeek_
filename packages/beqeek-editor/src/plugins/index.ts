// Plugin configuration factories
export { getTypographyPlugins } from './typography.js';
export { getListPlugins } from './lists.js';
export { getStructuralPlugins } from './structural.js';
export { getMediaPlugins } from './media.js';
export { getCodePlugin } from './code.js';
export { getDefaultPlugins, getDefaultEditorConfig } from './default.js';

// Tools and marks configuration
export { getDefaultTools } from '../tools/index.js';
export { getDefaultMarks } from '../marks/index.js';

// Re-export tool and mark components for custom configurations
export {
  ActionMenu,
  Toolbar,
  LinkTool,
  DefaultActionMenuRender,
  DefaultToolbarRender,
  DefaultLinkToolRender,
} from '../tools/index.js';
export { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '../marks/index.js';
