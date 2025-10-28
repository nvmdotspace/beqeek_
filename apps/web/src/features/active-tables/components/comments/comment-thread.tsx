import { useState, useMemo } from 'react';
import { Separator } from '@workspace/ui/components/separator';

import type { Comment } from '../../api/active-comments-api';
import { CommentItem } from './comment-item';
import { CommentEditor } from './comment-editor';

/**
 * CommentThread - Display comment with replies in threaded view
 *
 * Features:
 * - Recursive rendering of replies
 * - Reply editor inline
 * - Maximum nesting level support
 * - Visual indentation
 */

export interface CommentThreadProps {
  /**
   * Parent comment (decrypted)
   */
  comment: Comment;

  /**
   * All comments (for finding replies)
   */
  allComments: Comment[];

  /**
   * Current user ID (for checking ownership)
   */
  currentUserId?: string;

  /**
   * Whether current user can edit this comment
   */
  canEdit?: boolean;

  /**
   * Whether current user can delete this comment
   */
  canDelete?: boolean;

  /**
   * Callback when edit is clicked
   */
  onEdit?: (commentId: string) => void;

  /**
   * Callback when edit is saved
   */
  onEditSave?: (commentId: string, content: string) => Promise<void>;

  /**
   * Callback when edit is cancelled
   */
  onEditCancel?: () => void;

  /**
   * Callback when delete is clicked
   */
  onDelete?: (commentId: string) => void;

  /**
   * Callback when reply is submitted
   */
  onReply?: (parentId: string, content: string) => Promise<void>;

  /**
   * Callback when reaction is added
   */
  onReaction?: (commentId: string, reaction: string) => void;

  /**
   * Currently editing comment ID
   */
  editingCommentId?: string;

  /**
   * Edit draft value
   */
  editValue?: string;

  /**
   * Nesting level
   * @default 0
   */
  level?: number;

  /**
   * Maximum nesting level
   * @default 3
   */
  maxLevel?: number;
}

export function CommentThread({
  comment,
  allComments,
  currentUserId,
  canEdit,
  canDelete,
  onEdit,
  onEditSave,
  onEditCancel,
  onDelete,
  onReply,
  onReaction,
  editingCommentId,
  editValue,
  level = 0,
  maxLevel = 3,
}: CommentThreadProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  /**
   * Find direct replies to this comment
   */
  const replies = useMemo(() => {
    return allComments.filter((c) => c.parentId === comment.id);
  }, [allComments, comment.id]);

  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToId === comment.id;
  const canNestMore = level < maxLevel;

  /**
   * Handle reply submission
   */
  const handleReplySubmit = async () => {
    if (!replyDraft.trim() || !onReply) return;

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyDraft.trim());
      setReplyDraft('');
      setReplyingToId(null);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  /**
   * Handle reply cancel
   */
  const handleReplyCancel = () => {
    setReplyDraft('');
    setReplyingToId(null);
  };

  /**
   * Handle reply button click
   */
  const handleReplyClick = (commentId: string) => {
    setReplyingToId(commentId);
  };

  return (
    <div className="comment-thread">
      {/* Main comment */}
      <CommentItem
        comment={comment}
        canEdit={canEdit}
        canDelete={canDelete}
        showReply={canNestMore}
        showReactions={true}
        isEditing={isEditing}
        editValue={editValue}
        onEdit={onEdit}
        onEditSave={onEditSave}
        onEditCancel={onEditCancel}
        onDelete={onDelete}
        onReply={handleReplyClick}
        onReaction={onReaction}
        level={level}
        maxLevel={maxLevel}
      />

      {/* Reply editor (shown when replying) */}
      {isReplying && canNestMore && (
        <div className="ml-12 mt-2">
          <CommentEditor
            value={replyDraft}
            onChange={setReplyDraft}
            onSubmit={handleReplySubmit}
            onCancel={handleReplyCancel}
            placeholder={`Reply to ${comment.createdBy?.fullName || 'Anonymous'}...`}
            isEditing={true}
            disabled={isSubmittingReply}
            autoFocus={true}
            submitText="Reply"
          />
        </div>
      )}

      {/* Replies (recursive) */}
      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply, index) => (
            <div key={reply.id}>
              {index > 0 && level === 0 && <Separator className="my-2 ml-12" />}
              <CommentThread
                comment={reply}
                allComments={allComments}
                currentUserId={currentUserId}
                canEdit={currentUserId === reply.createdBy?.id}
                canDelete={currentUserId === reply.createdBy?.id}
                onEdit={onEdit}
                onEditSave={onEditSave}
                onEditCancel={onEditCancel}
                onDelete={onDelete}
                onReply={onReply}
                onReaction={onReaction}
                editingCommentId={editingCommentId}
                editValue={editValue}
                level={level + 1}
                maxLevel={maxLevel}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
