/**
 * Lexical Editor Theme for Comments
 * Defines CSS classes for comment editor elements
 */

import type { EditorThemeClasses } from 'lexical';

export const commentEditorTheme: EditorThemeClasses = {
  paragraph: 'comment-editor-paragraph',
  quote: 'comment-editor-quote',
  heading: {
    h1: 'comment-editor-heading-h1',
    h2: 'comment-editor-heading-h2',
    h3: 'comment-editor-heading-h3',
    h4: 'comment-editor-heading-h4',
    h5: 'comment-editor-heading-h5',
    h6: 'comment-editor-heading-h6',
  },
  list: {
    nested: {
      listitem: 'comment-editor-nested-listitem',
    },
    ol: 'comment-editor-list-ol',
    ul: 'comment-editor-list-ul',
    listitem: 'comment-editor-listitem',
  },
  text: {
    bold: 'comment-editor-text-bold',
    italic: 'comment-editor-text-italic',
    underline: 'comment-editor-text-underline',
    strikethrough: 'comment-editor-text-strikethrough',
    code: 'comment-editor-text-code',
  },
  link: 'comment-editor-link',
  code: 'comment-editor-code',
  codeHighlight: {},
};
