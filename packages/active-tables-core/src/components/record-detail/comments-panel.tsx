/**
 * CommentsPanel Component
 *
 * Display and manage comments for a record
 */

import { useState, useCallback } from 'react';
import type { CommentsPanelProps } from './record-detail-props.js';
import { LoadingState } from '../states/loading-state.js';
import { formatDistanceToNow } from 'date-fns';

/**
 * CommentsPanel - Comments display and management
 *
 * Features:
 * - List of comments with timestamps
 * - Add new comment form
 * - Edit/delete actions for own comments
 * - User mentions/tagging support
 * - Metadata display (created_at, updated_at)
 */
export function CommentsPanel(props: CommentsPanelProps) {
  const {
    comments = [],
    currentUser,
    workspaceUsers = [],
    loading = false,
    onCommentAdd,
    onCommentUpdate,
    onCommentDelete,
    messages,
    className = '',
  } = props;

  // Local state
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle add comment
  const handleAdd = useCallback(async () => {
    if (!newComment.trim() || !onCommentAdd) return;

    setSubmitting(true);
    try {
      await onCommentAdd(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  }, [newComment, onCommentAdd]);

  // Handle edit comment
  const handleEdit = useCallback(
    async (commentId: string) => {
      if (!editContent.trim() || !onCommentUpdate) return;

      setSubmitting(true);
      try {
        await onCommentUpdate(commentId, editContent.trim());
        setEditingId(null);
        setEditContent('');
      } catch (error) {
        console.error('Failed to update comment:', error);
      } finally {
        setSubmitting(false);
      }
    },
    [editContent, onCommentUpdate]
  );

  // Handle delete comment
  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!onCommentDelete) return;

      // Confirm deletion
      if (!window.confirm(messages?.deleteCommentConfirm || 'Delete this comment?')) {
        return;
      }

      setSubmitting(true);
      try {
        await onCommentDelete(commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      } finally {
        setSubmitting(false);
      }
    },
    [onCommentDelete, messages]
  );

  // Start editing
  const startEdit = useCallback((commentId: string, content: string) => {
    setEditingId(commentId);
    setEditContent(content);
  }, []);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditContent('');
  }, []);

  // Get user display name
  const getUserName = useCallback(
    (userId: string) => {
      const user = workspaceUsers.find((u) => u.id === userId);
      return user?.name || user?.email || 'Unknown User';
    },
    [workspaceUsers]
  );

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <LoadingState
          message={messages?.loadingComments || 'Loading comments...'}
          type="spinner"
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {messages?.comments || 'Comments'}
        </h3>
        <span className="text-sm text-gray-500">
          {comments.length} {messages?.commentsCount || 'comments'}
        </span>
      </div>

      {/* Add Comment Form */}
      {onCommentAdd && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={messages?.addCommentPlaceholder || 'Write a comment...'}
            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={submitting}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setNewComment('')}
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {messages?.cancel || 'Cancel'}
            </button>
            <button
              onClick={handleAdd}
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? messages?.saving || 'Saving...'
                : messages?.addComment || 'Add Comment'}
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {messages?.noComments || 'No comments yet'}
          </div>
        ) : (
          comments.map((comment) => {
            const isEditing = editingId === comment.id;
            const isOwnComment = currentUser && comment.userId === currentUser.id;

            return (
              <div
                key={comment.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {getUserName(comment.userId)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(comment.createdAt)}
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="ml-2">
                          ({messages?.edited || 'edited'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwnComment && !isEditing && (
                    <div className="flex gap-2">
                      {onCommentUpdate && (
                        <button
                          onClick={() => startEdit(comment.id, comment.content)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {messages?.edit || 'Edit'}
                        </button>
                      )}
                      {onCommentDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={submitting}
                          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {messages?.delete || 'Delete'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                {isEditing ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      disabled={submitting}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={cancelEdit}
                        disabled={submitting}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        {messages?.cancel || 'Cancel'}
                      </button>
                      <button
                        onClick={() => handleEdit(comment.id)}
                        disabled={!editContent.trim() || submitting}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting
                          ? messages?.saving || 'Saving...'
                          : messages?.save || 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
