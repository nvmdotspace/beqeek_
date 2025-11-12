import { useState, useCallback } from 'react';

export interface CommentEditState {
  commentId: string | null;
  isEditing: boolean;
}

export interface CommentReplyState {
  commentId: string | null;
  isReplying: boolean;
}

/**
 * Hook to manage comment UI actions (editing, replying)
 */
export function useCommentActions() {
  const [editState, setEditState] = useState<CommentEditState>({
    commentId: null,
    isEditing: false,
  });

  const [replyState, setReplyState] = useState<CommentReplyState>({
    commentId: null,
    isReplying: false,
  });

  /**
   * Start editing a comment
   */
  const startEdit = useCallback((commentId: string) => {
    setEditState({ commentId, isEditing: true });
  }, []);

  /**
   * Cancel editing
   */
  const cancelEdit = useCallback(() => {
    setEditState({ commentId: null, isEditing: false });
  }, []);

  /**
   * Start replying to a comment
   */
  const startReply = useCallback((commentId: string) => {
    setReplyState({ commentId, isReplying: true });
  }, []);

  /**
   * Cancel replying
   */
  const cancelReply = useCallback(() => {
    setReplyState({ commentId: null, isReplying: false });
  }, []);

  /**
   * Check if a comment is being edited
   */
  const isEditing = useCallback(
    (commentId: string) => editState.isEditing && editState.commentId === commentId,
    [editState],
  );

  /**
   * Check if replying to a comment
   */
  const isReplying = useCallback(
    (commentId: string) => replyState.isReplying && replyState.commentId === commentId,
    [replyState],
  );

  return {
    editState,
    replyState,
    startEdit,
    cancelEdit,
    startReply,
    cancelReply,
    isEditing,
    isReplying,
  };
}
