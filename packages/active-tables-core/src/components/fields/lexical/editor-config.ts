/**
 * Lexical Editor Configuration
 * Initial configuration for the Lexical editor
 */

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { lexicalTheme } from './theme.js';

/**
 * Error handler for Lexical editor errors
 */
function onError(error: Error) {
  console.error('Lexical Editor Error:', error);
}

/**
 * Creates initial editor configuration
 */
export function createEditorConfig(namespace: string, editable = true): InitialConfigType {
  return {
    namespace,
    theme: lexicalTheme,
    onError,
    editable,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
  };
}
