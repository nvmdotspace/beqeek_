/**
 * Lexical Editor Configuration for Comments
 * Simplified configuration optimized for comment editing
 */

import { HeadingNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { commentEditorTheme } from './theme.js';

/**
 * Error handler for Lexical editor errors
 */
function onError(error: Error) {
  console.error('Comment Editor Error:', error);
}

/**
 * Creates initial editor configuration for comments
 */
export function createCommentEditorConfig(namespace = 'CommentEditor', editable = true): InitialConfigType {
  return {
    namespace,
    theme: commentEditorTheme,
    onError,
    editable,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, CodeNode],
  };
}
