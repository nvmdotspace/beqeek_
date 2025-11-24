/**
 * CommentSection component
 * Displays a list of comments with reply functionality
 */

import { useState } from 'react';

import type { Comment } from '../types/comment.js';
import type { CommentUser } from '../types/user.js';
import type { MentionUser } from './editor/plugins/MentionsPlugin.js';

import { CommentCard } from './CommentCard.js';
import { CommentEditor } from './editor/CommentEditor.js';

export interface CommentSectionProps {
  value: Comment[];
  currentUser: CommentUser;
  onChange: (comments: Comment[]) => void;
  allowUpvote?: boolean;
  /** Show emoji reactions on comments (default: true) */
  showReactions?: boolean;
  /** Compact mode hides disabled toolbar features (default: false) */
  compactMode?: boolean;
  onVoteChange?: (commentId: string, upvoted: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
  mentionUsers?: MentionUser[];
  onMentionSearch?: (query: string) => Promise<MentionUser[]>;
  className?: string;
  /** Async callback when adding a new comment (for API integration) */
  onAddComment?: (text: string, parentId?: string) => Promise<void>;
  /** Async callback when updating a comment (for API integration) */
  onUpdateComment?: (commentId: string, text: string) => Promise<void>;
  /** Async callback when deleting a comment (for API integration) */
  onDeleteComment?: (commentId: string) => Promise<void>;
  /** Async callback to fetch fresh comment content before editing (for API integration) */
  onFetchComment?: (commentId: string) => Promise<string | null>;
  /** Callback when an error occurs (for displaying error messages) */
  onError?: (error: string) => void;
}

export function CommentSection({
  value,
  currentUser,
  onChange,
  allowUpvote,
  showReactions = true,
  compactMode = false,
  onVoteChange,
  onImageUpload,
  mentionUsers,
  onMentionSearch,
  className,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onFetchComment,
  onError,
}: CommentSectionProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  // Extract error message from API error
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      // Try to parse JSON error message
      try {
        const parsed = JSON.parse(error.message);
        // Handle 4xx errors - use message field
        if (parsed.message) return parsed.message;
        if (parsed['$']) return parsed['$'];
        if (parsed['*']) return parsed['*'];
        return error.message;
      } catch {
        return error.message;
      }
    }
    // 5xx or unknown errors
    return 'An unexpected error occurred. Please try again.';
  };

  const handleSubmitNewComment = async () => {
    if (!newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // If API callback provided, use it
      if (onAddComment) {
        await onAddComment(newCommentText);
        setNewCommentText('');
        setEditorKey((prev) => prev + 1); // Force editor remount to clear content
        return;
      }

      // Fallback to local state management
      const newComment: Comment = {
        id: Date.now().toString(),
        user: currentUser,
        text: newCommentText,
        createdAt: new Date(),
        replies: [],
        actions: {},
        selectedActions: [],
        allowUpvote,
      };

      onChange([...value, newComment]);
      setNewCommentText('');
      setEditorKey((prev) => prev + 1); // Force editor remount to clear content
    } catch (error) {
      const message = getErrorMessage(error);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string, replyText: string) => {
    try {
      // If API callback provided, use it
      if (onAddComment) {
        await onAddComment(replyText, commentId);
        return;
      }

      // Fallback to local state management
      const updatedComments = value.map((comment) => {
        if (comment.id === commentId) {
          const reply: Comment = {
            id: Date.now().toString(),
            user: currentUser,
            parentId: commentId,
            text: replyText,
            createdAt: new Date(),
            replies: [],
            actions: {},
            selectedActions: [],
            allowUpvote,
          };
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        return comment;
      });
      onChange(updatedComments);
    } catch (error) {
      const message = getErrorMessage(error);
      onError?.(message);
    }
  };

  const handleCommentChange = async (commentId: string, change: any) => {
    try {
      // If API callback provided and text is being updated, use it
      if (onUpdateComment && change.text !== undefined) {
        await onUpdateComment(commentId, change.text);
        return;
      }

      // Fallback to local state management
      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, ...change };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateComment(comment.replies),
            };
          }
          return comment;
        });
      };

      onChange(updateComment(value));
    } catch (error) {
      const message = getErrorMessage(error);
      onError?.(message);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      // If API callback provided, use it
      if (onDeleteComment) {
        await onDeleteComment(commentId);
        return;
      }

      // Fallback to local state management
      const deleteComment = (comments: Comment[]): Comment[] => {
        return comments
          .filter((comment) => comment.id !== commentId)
          .map((comment) => {
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: deleteComment(comment.replies),
              };
            }
            return comment;
          });
      };

      onChange(deleteComment(value));
    } catch (error) {
      const message = getErrorMessage(error);
      onError?.(message);
    }
  };

  return (
    <div className={`comment-section space-y-4 ${className || ''}`}>
      {/* New Comment Editor */}
      <CommentEditor
        key={editorKey}
        value={newCommentText}
        onChange={setNewCommentText}
        currentUser={currentUser}
        placeholder="Write a comment..."
        submitText="Comment"
        onSubmit={handleSubmitNewComment}
        onImageUpload={onImageUpload}
        mentionUsers={mentionUsers}
        onMentionSearch={onMentionSearch}
        compactMode={compactMode}
        isSubmitting={isSubmitting}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {value.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            allowUpvote={allowUpvote}
            showReactions={showReactions}
            onReply={(replyText) => handleReply(comment.id, replyText)}
            onChange={(change) => handleCommentChange(comment.id, change)}
            onDelete={() => handleCommentDelete(comment.id)}
            onVoteChange={(upvoted) => onVoteChange?.(comment.id, upvoted)}
            onImageUpload={onImageUpload}
            mentionUsers={mentionUsers}
            onMentionSearch={onMentionSearch}
            onFetchComment={onFetchComment}
          />
        ))}
      </div>

      {value.length === 0 && (
        <div className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</div>
      )}
    </div>
  );
}
