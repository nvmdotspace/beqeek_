import { Comment, CommentUser, CommentChange } from '../types/index.js';

/**
 * Generate a random ID for comments
 */
export function generateCommentId(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Check if a user is the author of a comment
 */
export function isCommentAuthor(comment: Comment, user: CommentUser): boolean {
  return comment.user.id === user.id;
}

/**
 * Find a comment by ID in a flat comment list
 */
export function findCommentById(comments: Comment[], id: string): Comment | null {
  return comments.find((comment) => comment.id === id) || null;
}

/**
 * Count total comments (flat list - just return length)
 */
export function countComments(comments: Comment[]): number {
  return comments.length;
}

/**
 * Get comments that reply to a specific comment
 */
export function getRepliesTo(comments: Comment[], commentId: string): Comment[] {
  return comments.filter((c) => c.replyToIds?.includes(commentId));
}

/**
 * Get comments being replied to (parent comments)
 */
export function getReplyTargets(comments: Comment[], replyToIds: string[]): Comment[] {
  return comments.filter((c) => replyToIds.includes(c.id));
}

/**
 * Update a comment in a flat list
 */
export function updateCommentInList(comments: Comment[], id: string, updates: CommentChange): Comment[] {
  return comments.map((comment) => {
    if (comment.id === id) {
      return { ...comment, ...updates };
    }
    return comment;
  });
}

/**
 * Delete a comment from a flat list
 */
export function deleteCommentFromList(comments: Comment[], id: string): Comment[] {
  return comments.filter((comment) => comment.id !== id);
}

/**
 * Copy comment link to clipboard
 */
export function copyCommentLink(commentId: string): Promise<void> {
  const url = `${window.location.origin}${window.location.pathname}#comment-${commentId}`;
  return navigator.clipboard.writeText(url);
}

/**
 * Scroll to comment
 */
export function scrollToComment(commentId: string): void {
  const element = document.getElementById(`comment-${commentId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Get preview text from comment (truncated)
 */
export function getCommentPreview(comment: Comment, maxLength = 50): string {
  // Strip HTML tags for preview
  const plainText = comment.text.replace(/<[^>]*>/g, '').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}

/**
 * Check if comment has any replies
 */
export function hasReplies(comments: Comment[], commentId: string): boolean {
  return comments.some((c) => c.replyToIds?.includes(commentId));
}
