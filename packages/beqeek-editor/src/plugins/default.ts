import { getTypographyPlugins } from './typography.js';
import { getListPlugins } from './lists.js';
import { getStructuralPlugins } from './structural.js';
import { getMediaPlugins } from './media.js';
import { getCodePlugin } from './code.js';
import { getDefaultTools } from '../tools/index.js';
import { getDefaultMarks } from '../marks/index.js';
import type { ToolsConfig, MarksArray } from '../types/tools.js';
import type { YooptaPlugin } from '@yoopta/editor';
import type { SlateElement } from '@yoopta/editor';

/**
 * Default plugin configuration with all 14 Yoopta plugins
 *
 * Plugin categories:
 * - Typography (6): Paragraph, H1, H2, H3, Blockquote, Link
 * - Lists (3): Numbered, Bulleted, Todo
 * - Structural (4): Accordion, Table, Divider, Callout
 * - Code (1): Code blocks with syntax highlighting
 * - Media (4): Embed, Image, Video, File
 *
 * Total: 18 plugin instances from 14 unique plugin types
 *
 * @returns Array of configured Yoopta plugins with shadcn/ui renders
 *
 * @example
 * ```tsx
 * import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
 * import { getDefaultPlugins } from '@workspace/beqeek-editor/plugins';
 * import { useMemo } from 'react';
 *
 * function MyDocument() {
 *   const editor = useMemo(() => createBeqeekEditor(), []);
 *   const plugins = useMemo(() => getDefaultPlugins(), []);
 *
 *   return <BeqeekEditor editor={editor} plugins={plugins} />;
 * }
 * ```
 */
export function getDefaultPlugins(): Readonly<YooptaPlugin<Record<string, SlateElement>>[]> {
  return [
    ...getTypographyPlugins(),
    ...getListPlugins(),
    ...getStructuralPlugins(),
    getCodePlugin(),
    ...getMediaPlugins(),
  ];
}

/**
 * Complete editor configuration with plugins, tools, and marks
 *
 * Includes:
 * - 18 plugin instances (Typography, Lists, Structural, Code, Media)
 * - 3 editing tools (ActionMenu, Toolbar, LinkTool)
 * - 6 text marks (Bold, Italic, Code, Underline, Strike, Highlight)
 *
 * @returns {Object} Object containing plugins, tools, and marks
 *
 * @example
 * ```tsx
 * import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
 * import { getDefaultEditorConfig } from '@workspace/beqeek-editor/plugins';
 * import { useMemo } from 'react';
 *
 * function MyDocument() {
 *   const editor = useMemo(() => createBeqeekEditor(), []);
 *   const { plugins, tools, marks } = useMemo(() => getDefaultEditorConfig(), []);
 *
 *   return (
 *     <BeqeekEditor
 *       editor={editor}
 *       plugins={plugins}
 *       tools={tools}
 *       marks={marks}
 *       placeholder="Start typing..."
 *       autoFocus
 *     />
 *   );
 * }
 * ```
 */
export function getDefaultEditorConfig(): {
  plugins: Readonly<YooptaPlugin<Record<string, SlateElement>>[]>;
  tools: ToolsConfig;
  marks: MarksArray;
} {
  return {
    plugins: getDefaultPlugins(),
    tools: getDefaultTools(),
    marks: getDefaultMarks(),
  };
}
