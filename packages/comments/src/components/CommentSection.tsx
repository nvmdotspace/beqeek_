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
  onVoteChange?: (commentId: string, upvoted: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
  mentionUsers?: MentionUser[];
  onMentionSearch?: (query: string) => Promise<MentionUser[]>;
  className?: string;
}

export function CommentSection({
  value,
  currentUser,
  onChange,
  allowUpvote,
  onVoteChange,
  onImageUpload,
  mentionUsers,
  onMentionSearch,
  className,
}: CommentSectionProps) {
  const [newCommentText, setNewCommentText] = useState('');

  const handleSubmitNewComment = () => {
    if (!newCommentText.trim()) return;

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
  };

  const handleReply = (commentId: string, replyText: string) => {
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
  };

  const handleCommentChange = (commentId: string, change: any) => {
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
  };

  const handleCommentDelete = (commentId: string) => {
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
  };

  return (
    <div className={`comment-section space-y-4 ${className || ''}`}>
      {/* New Comment Editor */}
      <CommentEditor
        value={newCommentText}
        onChange={setNewCommentText}
        currentUser={currentUser}
        placeholder="Write a comment..."
        submitText="Comment"
        onSubmit={handleSubmitNewComment}
        onImageUpload={onImageUpload}
        mentionUsers={mentionUsers}
        onMentionSearch={onMentionSearch}
      />

      {/* Comments List */}
      <div className="space-y-4">
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
            onImageUpload={onImageUpload}
            mentionUsers={mentionUsers}
            onMentionSearch={onMentionSearch}
          />
        ))}
      </div>

      {value.length === 0 && (
        <div className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</div>
      )}
    </div>
  );
}
