/**
 * CommentCard component
 * Displays individual comment with reactions and reply reference (flat design - no nesting)
 */

import { formatDistanceToNow } from 'date-fns';
import { Copy, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { cn } from '@workspace/ui/lib/utils';

import type { Comment, CommentChange } from '../types/comment.js';
import type { CommentUser } from '../types/user.js';
import type { CommentI18n } from '../types/i18n.js';
import type { MentionUser } from './editor/plugins/MentionsPlugin.js';

import { defaultI18n } from '../types/i18n.js';

import { CommentEditor } from './editor/CommentEditor.js';
import { CommentPreview } from './CommentPreview.js';
import { EmojiReactions } from './EmojiReactions.js';
import { ReplyReferenceBadge } from './ReplyReferenceBadge.js';
import { ACTIONS_TYPE } from '../types/comment.js';

export interface CommentCardProps {
  comment: Comment;
  /** All comments for reference lookup */
  allComments: Comment[];
  currentUser: CommentUser;
  allowUpvote?: boolean;
  /** Show emoji reactions (default: true) */
  showReactions?: boolean;
  /** Whether this comment is selected for reply */
  isSelected?: boolean;
  /** Whether this comment is highlighted (jump-to target) */
  isHighlighted?: boolean;
  /** Toggle reply selection (for multi-reply) */
  onToggleReply: () => void;
  onChange: (change: CommentChange) => void;
  onDelete: () => void;
  onVoteChange?: (upvoted: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
  mentionUsers?: MentionUser[];
  onMentionSearch?: (query: string) => Promise<MentionUser[]>;
  /** Async callback to fetch fresh comment content before editing */
  onFetchComment?: (commentId: string) => Promise<string | null>;
  /** Callback when clicking on a reply reference */
  onJumpToComment?: (commentId: string) => void;
  /** Callback to fetch comments by IDs (for pagination support) */
  onFetchReplyComments?: (ids: string[]) => Promise<Comment[]>;
  /** Internationalization strings */
  i18n?: Partial<CommentI18n>;
}

export function CommentCard({
  comment,
  allComments,
  currentUser,
  allowUpvote,
  showReactions = true,
  isSelected = false,
  isHighlighted = false,
  onToggleReply,
  onChange,
  onDelete,
  onVoteChange,
  onImageUpload,
  mentionUsers,
  onMentionSearch,
  onFetchComment,
  onJumpToComment,
  onFetchReplyComments,
  i18n: i18nProp,
}: CommentCardProps) {
  const i18n = { ...defaultI18n, ...i18nProp };
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFetchingForEdit, setIsFetchingForEdit] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  const isOwner = comment.user.id === currentUser.id;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStartEdit = async () => {
    if (onFetchComment) {
      setIsFetchingForEdit(true);
      try {
        const freshContent = await onFetchComment(comment.id);
        if (freshContent !== null) {
          setEditedText(freshContent);
        }
      } finally {
        setIsFetchingForEdit(false);
      }
    } else {
      setEditedText(comment.text);
    }
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onChange({ text: editedText });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(comment.text);
    setIsEditing(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.href}#comment-${comment.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleUpvote = () => {
    const isCurrentlyUpvoted = comment.selectedActions?.includes(ACTIONS_TYPE.UPVOTE);
    const newUpvoteCount = (comment.actions?.[ACTIONS_TYPE.UPVOTE] || 0) + (isCurrentlyUpvoted ? -1 : 1);

    onChange({
      actions: {
        ...comment.actions,
        [ACTIONS_TYPE.UPVOTE]: newUpvoteCount,
      },
      selectedActions: isCurrentlyUpvoted
        ? comment.selectedActions?.filter((a) => a !== ACTIONS_TYPE.UPVOTE)
        : [...(comment.selectedActions || []), ACTIONS_TYPE.UPVOTE],
    });

    onVoteChange?.(!isCurrentlyUpvoted);
  };

  const upvoteCount = comment.actions?.[ACTIONS_TYPE.UPVOTE] || 0;
  const isUpvoted = comment.selectedActions?.includes(ACTIONS_TYPE.UPVOTE);

  return (
    <div
      id={`comment-${comment.id}`}
      className={cn(
        'group rounded-lg p-3 transition-all duration-300',
        isSelected && 'bg-primary/5 ring-1 ring-primary/30',
        isHighlighted && 'bg-primary/10 ring-2 ring-primary/50 animate-pulse',
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
          <AvatarFallback>{getInitials(comment.user.fullName)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user.fullName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {/* Dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  {i18n.copyLink}
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={handleStartEdit} disabled={isFetchingForEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {isFetchingForEdit ? i18n.loading : i18n.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {i18n.delete}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply Reference Badge - shows what this comment is replying to */}
          <ReplyReferenceBadge
            replyToIds={comment.replyToIds || []}
            comments={allComments}
            onJumpToComment={onJumpToComment}
            onFetchReplyComments={onFetchReplyComments}
            i18n={i18n}
          />

          {/* Comment Content */}
          {isEditing ? (
            <div className="mt-2">
              <CommentEditor
                value={editedText}
                onChange={setEditedText}
                currentUser={currentUser}
                placeholder={i18n.editPlaceholder}
                submitText={i18n.save}
                cancelText={i18n.cancel}
                onSubmit={handleSaveEdit}
                onCancel={handleCancelEdit}
                showCancel={true}
                onImageUpload={onImageUpload}
                mentionUsers={mentionUsers}
                onMentionSearch={onMentionSearch}
                i18n={i18n}
              />
            </div>
          ) : (
            <CommentPreview source={comment.text} className="text-sm" />
          )}

          {/* Emoji Reactions */}
          {!isEditing && showReactions && (
            <div className="mt-2">
              <EmojiReactions
                value={comment.selectedActions || []}
                onSelect={(newSelected, changed) => {
                  const newActions = { ...comment.actions };
                  newActions[changed] = (newActions[changed] || 0) + 1;
                  onChange({
                    actions: newActions,
                    selectedActions: newSelected,
                  });
                }}
                onUnSelect={(newSelected, changed) => {
                  const newActions = { ...comment.actions };
                  newActions[changed] = Math.max(0, (newActions[changed] || 0) - 1);
                  onChange({
                    actions: newActions,
                    selectedActions: newSelected,
                  });
                }}
              />
            </div>
          )}

          {/* Comment Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 mt-2">
              {allowUpvote && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-7 px-2', isUpvoted && 'text-primary')}
                  onClick={handleUpvote}
                >
                  {upvoteCount > 0 && <span className="text-xs mr-1">{upvoteCount}</span>}
                  {i18n.upvote}
                </Button>
              )}
              {/* Reply button - toggles selection for multi-reply */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 text-muted-foreground hover:text-foreground',
                  isSelected && 'text-primary bg-primary/10',
                )}
                onClick={onToggleReply}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">{isSelected ? i18n.selected : i18n.reply}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{i18n.deleteConfirmation}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {i18n.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
