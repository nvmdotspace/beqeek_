/**
 * Internationalization types for @workspace/comments
 * Allows consumers to provide translated strings
 */

export interface CommentI18n {
  // Common
  loading: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  clear: string;

  // Comment actions
  copyLink: string;
  reply: string;
  selected: string;
  upvote: string;
  comment: string;

  // Placeholders
  placeholder: string;
  editPlaceholder: string;

  // Messages
  loadMore: string;
  empty: string;
  errorUnexpected: string;

  // Delete dialog
  deleteTitle: string;
  deleteConfirmation: string;

  // Reply indicator
  replyingTo: string;
  replyingToCount: (count: number) => string;
  moreMessages: (count: number) => string;
  showMore: (count: number) => string;
  showLess: string;

  // Toolbar tooltips
  toolbar: {
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    bulletedList: string;
    insertLink: string;
    inlineCode: string;
    codeBlock: string;
    fontSize: string;
    textColor: string;
    textAlign: string;
    attachImage: string;
    mentionSomeone: string;
    insertEmoji: string;
    toggleFormatting: string;
  };

  // Link editor
  linkEditor: {
    confirm: string;
    cancel: string;
    editLink: string;
    removeLink: string;
  };
}

/**
 * Default English translations
 */
export const defaultI18n: CommentI18n = {
  // Common
  loading: 'Loading...',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  clear: 'Clear',

  // Comment actions
  copyLink: 'Copy link',
  reply: 'Reply',
  selected: 'Selected',
  upvote: 'Upvote',
  comment: 'Comment',

  // Placeholders
  placeholder: 'Write a comment...',
  editPlaceholder: 'Edit comment...',

  // Messages
  loadMore: 'Load more comments',
  empty: 'No comments yet. Be the first to comment!',
  errorUnexpected: 'An unexpected error occurred. Please try again.',

  // Delete dialog
  deleteTitle: 'Delete comment?',
  deleteConfirmation: 'Are you sure you want to delete this comment? This action cannot be undone.',

  // Reply indicator
  replyingTo: 'Replying to',
  replyingToCount: (count: number) => `Replying to ${count} message${count > 1 ? 's' : ''}`,
  moreMessages: (count: number) => `+${count} more message${count > 1 ? 's' : ''}`,
  showMore: (count: number) => `Show ${count} more`,
  showLess: 'Show less',

  // Toolbar tooltips
  toolbar: {
    bold: 'Bold (Ctrl+B)',
    italic: 'Italic (Ctrl+I)',
    underline: 'Underline (Ctrl+U)',
    strikethrough: 'Strikethrough',
    bulletedList: 'Bulleted list',
    insertLink: 'Insert link',
    inlineCode: 'Inline code',
    codeBlock: 'Code block',
    fontSize: 'Font size',
    textColor: 'Text color',
    textAlign: 'Text align',
    attachImage: 'Attach image',
    mentionSomeone: 'Mention someone (@)',
    insertEmoji: 'Insert emoji',
    toggleFormatting: 'Toggle formatting',
  },

  // Link editor
  linkEditor: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    editLink: 'Edit link',
    removeLink: 'Remove link',
  },
};
