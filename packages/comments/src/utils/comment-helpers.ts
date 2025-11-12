import { Comment, CommentUser } from '../types/index.js';

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
 * Find a comment by ID in a nested comment tree
 */
export function findCommentById(comments: Comment[], id: string): Comment | null {
  for (const comment of comments) {
    if (comment.id === id) {
      return comment;
    }
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentById(comment.replies, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Count total comments including replies
 */
export function countComments(comments: Comment[]): number {
  let count = comments.length;
  for (const comment of comments) {
    if (comment.replies && comment.replies.length > 0) {
      count += countComments(comment.replies);
    }
  }
  return count;
}

/**
 * Flatten nested comments into a single array
 */
export function flattenComments(comments: Comment[]): Comment[] {
  const result: Comment[] = [];
  for (const comment of comments) {
    result.push(comment);
    if (comment.replies && comment.replies.length > 0) {
      result.push(...flattenComments(comment.replies));
    }
  }
  return result;
}

/**
 * Update a comment in a nested tree
 */
export function updateCommentInTree(comments: Comment[], id: string, updates: Partial<Comment>): Comment[] {
  return comments.map((comment) => {
    if (comment.id === id) {
      return { ...comment, ...updates };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, id, updates),
      };
    }
    return comment;
  });
}

/**
 * Delete a comment from a nested tree
 */
export function deleteCommentFromTree(comments: Comment[], id: string): Comment[] {
  return comments
    .filter((comment) => comment.id !== id)
    .map((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: deleteCommentFromTree(comment.replies, id),
        };
      }
      return comment;
    });
}

/**
 * Add a reply to a comment
 */
export function addReplyToComment(comments: Comment[], parentId: string, reply: Comment): Comment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [reply, ...(comment.replies || [])],
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentId, reply),
      };
    }
    return comment;
  });
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
