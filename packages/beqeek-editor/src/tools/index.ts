import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import type { ToolsConfig } from '../types/tools.js';

/**
 * Get default tools configuration with Yoopta default renders
 *
 * Tools included:
 * - ActionMenu: Slash command interface for block insertion
 * - Toolbar: Floating formatting toolbar on text selection
 * - LinkTool: Link insertion/editing modal
 *
 * @returns {ToolsConfig} Configured tools object
 */
export function getDefaultTools(): ToolsConfig {
  return {
    ActionMenu: {
      render: DefaultActionMenuRender,
      tool: ActionMenu,
    },
    Toolbar: {
      render: DefaultToolbarRender,
      tool: Toolbar,
    },
    LinkTool: {
      render: DefaultLinkToolRender,
      tool: LinkTool,
    },
  };
}

/**
 * Re-export tool components for custom configurations
 */
export { ActionMenu, Toolbar, LinkTool };

/**
 * Re-export default renders for custom extensions
 */
export { DefaultActionMenuRender, DefaultToolbarRender, DefaultLinkToolRender };
