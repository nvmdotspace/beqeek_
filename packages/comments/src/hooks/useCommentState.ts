import { useState, useCallback } from 'react';
import { Comment, CommentUser, ACTIONS_TYPE, CommentChange } from '../types/index.js';
import { generateCommentId, updateCommentInTree, deleteCommentFromTree, addReplyToComment } from '../utils/index.js';

export interface UseCommentStateOptions {
  initialComments?: Comment[];
  onCommentsChange?: (comments: Comment[]) => void;
}

/**
 * Hook to manage comment state
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
   * Add a new root comment
   */
  const addComment = useCallback(
    (text: string, currentUser: CommentUser) => {
      const newComment: Comment = {
        id: generateCommentId(),
        user: currentUser,
        text,
        createdAt: new Date(),
        replies: [],
      };
      updateComments([newComment, ...comments]);
      return newComment;
    },
    [comments, updateComments],
  );

  /**
   * Add a reply to an existing comment
   */
  const addReply = useCallback(
    (parentId: string, text: string, currentUser: CommentUser) => {
      const reply: Comment = {
        id: generateCommentId(),
        user: currentUser,
        parentId,
        text,
        createdAt: new Date(),
        replies: [],
      };
      const updatedComments = addReplyToComment(comments, parentId, reply);
      updateComments(updatedComments);
      return reply;
    },
    [comments, updateComments],
  );

  /**
   * Update an existing comment
   */
  const updateComment = useCallback(
    (commentId: string, changes: CommentChange) => {
      const updatedComments = updateCommentInTree(comments, commentId, changes);
      updateComments(updatedComments);
    },
    [comments, updateComments],
  );

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    (commentId: string) => {
      const updatedComments = deleteCommentFromTree(comments, commentId);
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
