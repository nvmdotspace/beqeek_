import { useState, useMemo, memo, useCallback } from 'react';
import { MoreVertical, Pencil, Trash2, Reply, Heart, ThumbsUp, Smile } from 'lucide-react';

import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

import type { Comment } from '../../api/active-comments-api';
import { CommentEditor } from './comment-editor';

/**
 * CommentItem - Individual comment display with actions
 *
 * Features:
 * - User avatar and name
 * - Timestamp display
 * - Comment content (decrypted)
 * - Edit/delete actions (for own comments)
 * - Reply functionality
 * - Emoji reactions
 *
 * Performance optimizations:
 * - React.memo to prevent unnecessary re-renders
 * - useMemo for expensive computations (timestamp, initials)
 * - useCallback for stable event handlers
 */

export interface CommentItemProps {
  /**
   * Comment data (should be decrypted)
   */
  comment: Comment;

  /**
   * Whether current user can edit this comment
   */
  canEdit?: boolean;

  /**
   * Whether current user can delete this comment
   */
  canDelete?: boolean;

  /**
   * Whether reply button should be shown
   * @default true
   */
  showReply?: boolean;

  /**
   * Whether reactions should be shown
   * @default true
   */
  showReactions?: boolean;

  /**
   * Whether the comment is being edited
   */
  isEditing?: boolean;

  /**
   * Edit draft value
   */
  editValue?: string;

  /**
   * Callback when edit starts
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
   * Callback when reply is clicked
   */
  onReply?: (commentId: string) => void;

  /**
   * Callback when reaction is added
   */
  onReaction?: (commentId: string, reaction: string) => void;

  /**
   * Nesting level (for threaded replies)
   * @default 0
   */
  level?: number;

  /**
   * Maximum nesting level
   * @default 3
   */
  maxLevel?: number;
}

/**
 * Format timestamp for display
 * Memoized helper to avoid recomputation on every render
 */
const formatTimestamp = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

/**
 * Get user initials from full name
 * Memoized helper to avoid recomputation on every render
 */
const getUserInitials = (fullName?: string): string => {
  if (!fullName) return 'U';

  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    const first = parts[0];
    return first ? first.charAt(0).toUpperCase() : 'U';
  }

  const first = parts[0];
  const last = parts[parts.length - 1];
  return (
    (first ? first.charAt(0) : '') +
    (last ? last.charAt(0) : '')
  ).toUpperCase() || 'U';
};

const CommentItemComponent = ({
  comment,
  canEdit = false,
  canDelete = false,
  showReply = true,
  showReactions = true,
  isEditing = false,
  editValue = '',
  onEdit,
  onEditSave,
  onEditCancel,
  onDelete,
  onReply,
  onReaction,
  level = 0,
  maxLevel = 3,
}: CommentItemProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [localEditValue, setLocalEditValue] = useState(editValue);

  // Memoize computed values to prevent recalculation
  const initials = useMemo(() => getUserInitials(comment.createdBy?.fullName), [comment.createdBy?.fullName]);
  const timestamp = useMemo(() => formatTimestamp(comment.createdAt), [comment.createdAt]);
  const hasActions = useMemo(() => canEdit || canDelete || showReply, [canEdit, canDelete, showReply]);
  const canNestMore = useMemo(() => level < maxLevel, [level, maxLevel]);

  /**
   * Handle edit save with useCallback for stable reference
   */
  const handleEditSave = useCallback(async () => {
    if (!onEditSave || !localEditValue.trim()) return;

    setIsSaving(true);
    try {
      await onEditSave(comment.id, localEditValue.trim());
    } finally {
      setIsSaving(false);
    }
  }, [onEditSave, localEditValue, comment.id]);

  /**
   * Handle edit cancel with useCallback for stable reference
   */
  const handleEditCancel = useCallback(() => {
    setLocalEditValue(editValue);
    onEditCancel?.();
  }, [editValue, onEditCancel]);

  /**
   * Handle reaction with useCallback for stable reference
   */
  const handleReaction = useCallback((reaction: string) => {
    onReaction?.(comment.id, reaction);
  }, [onReaction, comment.id]);

  /**
   * Handle edit button click with useCallback
   */
  const handleEditClick = useCallback(() => {
    onEdit?.(comment.id);
  }, [onEdit, comment.id]);

  /**
   * Handle delete button click with useCallback
   */
  const handleDeleteClick = useCallback(() => {
    onDelete?.(comment.id);
  }, [onDelete, comment.id]);

  /**
   * Handle reply button click with useCallback
   */
  const handleReplyClick = useCallback(() => {
    onReply?.(comment.id);
  }, [onReply, comment.id]);

  return (
    <div
      className={cn(
        'group relative flex gap-3 py-3',
        level > 0 && 'ml-8'
      )}
      data-comment-id={comment.id}
    >
      <Avatar className="size-9 flex-shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {comment.createdBy?.fullName || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>

          {hasActions && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Comment actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {showReply && canNestMore && onReply && (
                  <>
                    <DropdownMenuItem onClick={handleReplyClick}>
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <CommentEditor
            value={localEditValue}
            onChange={setLocalEditValue}
            onSubmit={handleEditSave}
            onCancel={handleEditCancel}
            placeholder="Edit your comment..."
            isEditing={true}
            disabled={isSaving}
            autoFocus={true}
            submitText="Save"
          />
        ) : (
          <div className="whitespace-pre-wrap break-words text-sm text-foreground/90">
            {comment.commentContent}
          </div>
        )}

        {/* Reactions */}
        {showReactions && !isEditing && (
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleReaction('like')}
                  >
                    <ThumbsUp className="mr-1 h-3 w-3" />
                    <span className="text-xs">0</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleReaction('heart')}
                  >
                    <Heart className="mr-1 h-3 w-3" />
                    <span className="text-xs">0</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Love</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleReaction('smile')}
                  >
                    <Smile className="mr-1 h-3 w-3" />
                    <span className="text-xs">0</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Smile</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Memoized CommentItem component
 *
 * Custom equality function prevents re-renders when:
 * - Comment content hasn't changed
 * - Editing state hasn't changed
 * - Permissions haven't changed
 */
export const CommentItem = memo(CommentItemComponent, (prevProps, nextProps) => {
  // Check if comment data changed
  if (
    prevProps.comment.id !== nextProps.comment.id ||
    prevProps.comment.commentContent !== nextProps.comment.commentContent ||
    prevProps.comment.createdAt !== nextProps.comment.createdAt ||
    prevProps.comment.createdBy?.fullName !== nextProps.comment.createdBy?.fullName
  ) {
    return false; // Comment changed, re-render
  }

  // Check if editing state changed
  if (
    prevProps.isEditing !== nextProps.isEditing ||
    prevProps.editValue !== nextProps.editValue
  ) {
    return false; // Editing state changed, re-render
  }

  // Check if permissions or display options changed
  if (
    prevProps.canEdit !== nextProps.canEdit ||
    prevProps.canDelete !== nextProps.canDelete ||
    prevProps.showReply !== nextProps.showReply ||
    prevProps.showReactions !== nextProps.showReactions ||
    prevProps.level !== nextProps.level
  ) {
    return false; // Permissions changed, re-render
  }

  // No relevant changes, skip re-render
  return true;
});
