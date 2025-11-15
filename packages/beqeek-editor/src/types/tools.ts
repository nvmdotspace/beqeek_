import type { Tools } from '@yoopta/editor';
import type { YooptaMark } from '@yoopta/editor';

/**
 * Tools configuration for Yoopta Editor
 * Includes ActionMenu, Toolbar, and LinkTool
 */
export type ToolsConfig = Partial<Tools>;

/**
 * Marks array for text formatting
 * Includes Bold, Italic, Code, Underline, Strike, Highlight
 */
export type MarksArray = YooptaMark<unknown>[];

/**
 * Re-export Tools type from Yoopta for convenience
 */
export type { Tools } from '@yoopta/editor';
