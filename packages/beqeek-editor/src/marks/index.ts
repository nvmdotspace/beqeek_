import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import type { MarksArray } from '../types/tools.js';

/**
 * Get default text formatting marks
 *
 * Marks included with keyboard shortcuts:
 * - Bold (Cmd+B / Ctrl+B)
 * - Italic (Cmd+I / Ctrl+I)
 * - Code (Cmd+E / Ctrl+E)
 * - Underline (Cmd+U / Ctrl+U)
 * - Strike (Cmd+Shift+X / Ctrl+Shift+X)
 * - Highlight (Cmd+Shift+H / Ctrl+Shift+H)
 *
 * @returns {MarksArray} Array of configured marks
 */
export function getDefaultMarks(): MarksArray {
  return [Bold, Italic, CodeMark, Underline, Strike, Highlight];
}

/**
 * Re-export individual marks for custom configurations
 */
export { Bold, Italic, CodeMark, Underline, Strike, Highlight };
