import { useState, useCallback } from 'react';
import { Comment, CommentUser, ACTIONS_TYPE, CommentChange } from '../types/index.js';
import { generateCommentId, updateCommentInList, deleteCommentFromList } from '../utils/index.js';

export interface UseCommentStateOptions {
  initialComments?: Comment[];
  onCommentsChange?: (comments: Comment[]) => void;
}

/**
 * Hook to manage comment state (FLAT structure with multi-reply)
 */
export function useCommentState(options: UseCommentStateOptions = {}) {
  const { initialComments = [], onCommentsChange } = options;

  const [comments, setComments] = useState<Comment[]>(initialComments);

  const updateComments = useCallback(
    (newComments: Comment[]) => {
      setComments(newComments);
      onCommentsChange?.(newComments);
    },
    [onCommentsChange],
  );

  /**
   * Add a new comment (optionally replying to other comments)
   */
  const addComment = useCallback(
    (text: string, currentUser: CommentUser, replyToIds?: string[]) => {
      const newComment: Comment = {
        id: generateCommentId(),
        user: currentUser,
        text,
        createdAt: new Date(),
        replyToIds: replyToIds || [],
        parentId: replyToIds?.[0], // Backward compat
      };
      updateComments([...comments, newComment]);
      return newComment;
    },
    [comments, updateComments],
  );

  /**
   * Add a reply to an existing comment (single reply - backward compat)
   */
  const addReply = useCallback(
    (parentId: string, text: string, currentUser: CommentUser) => {
      return addComment(text, currentUser, [parentId]);
    },
    [addComment],
  );

  /**
   * Update an existing comment
   */
  const updateComment = useCallback(
    (commentId: string, changes: CommentChange) => {
      const updatedComments = updateCommentInList(comments, commentId, changes);
      updateComments(updatedComments);
    },
    [comments, updateComments],
  );

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    (commentId: string) => {
      const updatedComments = deleteCommentFromList(comments, commentId);
      updateComments(updatedComments);
    },
    [comments, updateComments],
  );

  /**
   * Toggle reaction on a comment
   */
  const toggleReaction = useCallback(
    (commentId: string, reactionType: ACTIONS_TYPE, currentlySelected: boolean) => {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const currentCount = (comment.actions || {})[reactionType] || 0;
      const selectedActions = comment.selectedActions || [];

      const changes: CommentChange = {
        selectedActions: currentlySelected
          ? selectedActions.filter((a) => a !== reactionType)
          : [...selectedActions, reactionType],
        actions: {
          ...(comment.actions || {}),
          [reactionType]: currentlySelected ? Math.max(0, currentCount - 1) : currentCount + 1,
        },
      };

      updateComment(commentId, changes);
    },
    [comments, updateComment],
  );

  return {
    comments,
    setComments: updateComments,
    addComment,
    addReply,
    updateComment,
    deleteComment,
    toggleReaction,
  };
}
