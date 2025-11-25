/**
 * CommentSection component
 * Displays a flat list of comments with multi-reply functionality and pagination
 */

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';

import type { Comment } from '../types/comment.js';
import type { CommentUser } from '../types/user.js';
import type { MentionUser } from './editor/plugins/MentionsPlugin.js';

import { CommentCard } from './CommentCard.js';
import { CommentEditor } from './editor/CommentEditor.js';
import { ReplyIndicator } from './ReplyIndicator.js';

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
  /**
   * Async callback when adding a new comment (for API integration)
   * @param text - Comment content
   * @param replyToIds - Array of comment IDs being replied to (multi-reply support)
   */
  onAddComment?: (text: string, replyToIds?: string[]) => Promise<void>;
  /** Async callback when updating a comment (for API integration) */
  onUpdateComment?: (commentId: string, text: string) => Promise<void>;
  /** Async callback when deleting a comment (for API integration) */
  onDeleteComment?: (commentId: string) => Promise<void>;
  /** Async callback to fetch fresh comment content before editing (for API integration) */
  onFetchComment?: (commentId: string) => Promise<string | null>;
  /** Callback when an error occurs (for displaying error messages) */
  onError?: (error: string) => void;
  /** Callback when jumping to a comment reference */
  onJumpToComment?: (commentId: string) => void;
  // Pagination props
  /** Whether there are more comments to load */
  hasNextPage?: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage?: boolean;
  /** Callback to load more comments */
  onLoadMore?: () => void;
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
  onJumpToComment,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: CommentSectionProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  // Multi-reply state: IDs of comments being replied to
  const [replyingToIds, setReplyingToIds] = useState<string[]>([]);
  // Highlighted comment for jump-to animation
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Extract error message from API error
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.message) return parsed.message;
        if (parsed['$']) return parsed['$'];
        if (parsed['*']) return parsed['*'];
        return error.message;
      } catch {
        return error.message;
      }
    }
    return 'An unexpected error occurred. Please try again.';
  };

  // Toggle reply selection (multi-reply)
  const handleToggleReply = useCallback((commentId: string) => {
    setReplyingToIds((prev) => {
      if (prev.includes(commentId)) {
        // Already selected - remove it
        return prev.filter((id) => id !== commentId);
      }
      // Add to selection
      return [...prev, commentId];
    });
  }, []);

  // Remove single reply target
  const handleRemoveReplyTarget = useCallback((commentId: string) => {
    setReplyingToIds((prev) => prev.filter((id) => id !== commentId));
  }, []);

  // Clear all reply targets
  const handleClearReplyTargets = useCallback(() => {
    setReplyingToIds([]);
  }, []);

  // Jump to comment with highlight
  const handleJumpToComment = useCallback(
    (commentId: string) => {
      // Use external handler if provided
      if (onJumpToComment) {
        onJumpToComment(commentId);
        return;
      }

      // Default implementation
      setHighlightedId(commentId);
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setHighlightedId(null), 2000);
    },
    [onJumpToComment],
  );

  const handleSubmitNewComment = async () => {
    if (!newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onAddComment) {
        // Pass replyToIds array (multi-reply)
        await onAddComment(newCommentText, replyingToIds.length > 0 ? replyingToIds : undefined);
        setNewCommentText('');
        setReplyingToIds([]); // Clear reply targets
        setEditorKey((prev) => prev + 1);
        return;
      }

      // Fallback to local state management
      const newComment: Comment = {
        id: Date.now().toString(),
        user: currentUser,
        text: newCommentText,
        createdAt: new Date(),
        replyToIds: [...replyingToIds],
        parentId: replyingToIds[0], // Backward compat
        actions: {},
        selectedActions: [],
        allowUpvote,
      };

      onChange([...value, newComment]);
      setNewCommentText('');
      setReplyingToIds([]);
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      const message = getErrorMessage(error);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentChange = async (commentId: string, change: Record<string, unknown>) => {
    try {
      if (onUpdateComment && change.text !== undefined) {
        await onUpdateComment(commentId, change.text as string);
        return;
      }

      // Fallback to local state management (flat list - no nesting)
      onChange(value.map((comment) => (comment.id === commentId ? { ...comment, ...change } : comment)));
    } catch (error) {
      const message = getErrorMessage(error);
      onError?.(message);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      if (onDeleteComment) {
        await onDeleteComment(commentId);
        return;
      }

      // Fallback to local state (flat list)
      onChange(value.filter((comment) => comment.id !== commentId));
      // Also remove from reply targets if present
      setReplyingToIds((prev) => prev.filter((id) => id !== commentId));
    } catch (error) {
      const message = getErrorMessage(error);
      onError?.(message);
    }
  };

  // Placeholder text based on reply state
  const editorPlaceholder =
    replyingToIds.length > 0
      ? `Replying to ${replyingToIds.length} message${replyingToIds.length > 1 ? 's' : ''}...`
      : 'Write a comment...';

  return (
    <div className={`comment-section space-y-4 ${className || ''}`}>
      {/* Reply Indicator - shows selected comments above editor */}
      <ReplyIndicator
        replyingToIds={replyingToIds}
        comments={value}
        onRemove={handleRemoveReplyTarget}
        onClearAll={handleClearReplyTargets}
      />

      {/* New Comment Editor */}
      <CommentEditor
        key={editorKey}
        value={newCommentText}
        onChange={setNewCommentText}
        currentUser={currentUser}
        placeholder={editorPlaceholder}
        submitText={replyingToIds.length > 0 ? 'Reply' : 'Comment'}
        onSubmit={handleSubmitNewComment}
        onImageUpload={onImageUpload}
        mentionUsers={mentionUsers}
        onMentionSearch={onMentionSearch}
        compactMode={compactMode}
        isSubmitting={isSubmitting}
      />

      {/* Comments List - FLAT (no nesting) */}
      <div className="space-y-1">
        {value.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            allComments={value}
            currentUser={currentUser}
            allowUpvote={allowUpvote}
            showReactions={showReactions}
            isSelected={replyingToIds.includes(comment.id)}
            isHighlighted={highlightedId === comment.id}
            onToggleReply={() => handleToggleReply(comment.id)}
            onChange={(change) => handleCommentChange(comment.id, change)}
            onDelete={() => handleCommentDelete(comment.id)}
            onVoteChange={(upvoted) => onVoteChange?.(comment.id, upvoted)}
            onImageUpload={onImageUpload}
            mentionUsers={mentionUsers}
            onMentionSearch={onMentionSearch}
            onFetchComment={onFetchComment}
            onJumpToComment={handleJumpToComment}
          />
        ))}

        {/* Load More Button */}
        {hasNextPage && onLoadMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="text-muted-foreground hover:text-foreground"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load more comments'
              )}
            </Button>
          </div>
        )}
      </div>

      {value.length === 0 && !isFetchingNextPage && (
        <div className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</div>
      )}
    </div>
  );
}
