/**
 * CommentSection - Main comment system component
 * Displays comment list and new comment editor
 * React 19 compatible with Lexical editor
 */

import { useState } from 'react';
import { MDXProvider } from '@mdx-js/react';
import type { Comment, CommentChange } from '../types/comment.js';
import type { CommentUser } from '../types/user.js';
import { CommentEditor } from './editor/CommentEditor.js';
import { CommentCard } from './CommentCard.js';

export interface CommentSectionProps {
  /** Array of comments to display */
  value: Comment[];
  /** Current user */
  currentUser: CommentUser;
  /** Callback when comments change */
  onChange?: (comments: Comment[]) => void;
  /** Whether upvoting is allowed */
  allowUpvote?: boolean;
  /** Callback when vote changes */
  onVoteChange?: (commentId: string, upvoted: boolean) => void;
  /** Additional className */
  className?: string;
}

/**
 * Generate unique ID for new comments
 */
function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * CommentSection component
 * Main container for the comment system
 */
export function CommentSection({
  value,
  currentUser,
  onChange,
  allowUpvote = false,
  onVoteChange,
  className = '',
}: CommentSectionProps) {
  const [newCommentText, setNewCommentText] = useState('');

  const handleNewComment = () => {
    if (!onChange || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: generateId(),
      user: currentUser,
      text: newCommentText,
      createdAt: new Date(),
      replies: [],
      actions: {},
      selectedActions: [],
    };

    onChange([newComment, ...value]);
    setNewCommentText('');
  };

  const handleCommentChange = (commentId: string, change: CommentChange) => {
    if (!onChange) return;

    onChange(
      value.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              ...change,
            }
          : comment,
      ),
    );
  };

  const handleCommentDelete = (commentId: string) => {
    if (!onChange) return;
    onChange(value.filter((comment) => comment.id !== commentId));
  };

  const handleReply = (parentId: string, replyText: string) => {
    if (!onChange) return;

    const newReply: Comment = {
      id: generateId(),
      parentId,
      user: currentUser,
      text: replyText,
      createdAt: new Date(),
      replies: [],
    };

    onChange(
      value.map((comment) =>
        comment.id === parentId
          ? {
              ...comment,
              replies: [newReply, ...(comment.replies || [])],
            }
          : comment,
      ),
    );
  };

  return (
    <MDXProvider>
      <div className={`max-w-screen-md flex flex-col gap-4 w-full ${className}`}>
        {/* New comment editor */}
        <CommentEditor
          value={newCommentText}
          onChange={setNewCommentText}
          currentUser={currentUser}
          placeholder="Add your comment here..."
          submitText="Comment"
          onSubmit={handleNewComment}
        />

        {/* Comment list */}
        {value.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            allowUpvote={allowUpvote}
            onReply={(replyText) => handleReply(comment.id, replyText)}
            onChange={(change) => handleCommentChange(comment.id, change)}
            onDelete={() => handleCommentDelete(comment.id)}
            onVoteChange={(upvoted) => onVoteChange?.(comment.id, upvoted)}
          />
        ))}
      </div>
    </MDXProvider>
  );
}
