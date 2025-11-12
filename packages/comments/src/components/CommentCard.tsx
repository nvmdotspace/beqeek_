/**
 * CommentCard - Individual comment display with reactions, edit, delete
 * Supports nested replies, emoji reactions, and upvotes
 */

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { ArrowUpIcon, SmileIcon, EllipsisVertical, CircleIcon } from 'lucide-react';
import type { Comment, CommentChange } from '../types/comment.js';
import { ACTIONS_TYPE, ACTIONS } from '../types/comment.js';
import type { CommentUser } from '../types/user.js';
import { CommentPreview } from './CommentPreview.js';
import { CommentEditor } from './editor/CommentEditor.js';
import { EmojiReactions } from './EmojiReactions.js';
import { cn } from '@workspace/ui/lib/utils';

export interface CommentCardProps {
  /** Comment data */
  comment: Comment;
  /** Current user */
  currentUser: CommentUser;
  /** Whether upvoting is allowed */
  allowUpvote?: boolean;
  /** Callback when reply is submitted */
  onReply?: (replyText: string) => void;
  /** Callback when comment is changed */
  onChange?: (change: CommentChange) => void;
  /** Callback when comment is deleted */
  onDelete?: () => void;
  /** Callback when vote changes */
  onVoteChange?: (upvoted: boolean) => void;
}

/**
 * CommentCard component
 * Displays a single comment with all its interactions
 */
export function CommentCard({
  comment,
  currentUser,
  allowUpvote = false,
  onReply,
  onChange,
  onDelete,
  onVoteChange,
}: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  const isOwnComment = currentUser.id === comment.user.id;

  // Get reactions that have counts and are selected by user
  const visibleReactions = ACTIONS.filter(
    (action) => comment.actions?.[action.id] && comment.selectedActions?.includes(action.id),
  );

  // Upvote state
  const upvoteCount = comment.actions?.UPVOTE ?? 0;
  const isUpvoted = comment.selectedActions?.includes(ACTIONS_TYPE.UPVOTE);

  const handleUpvote = () => {
    if (!onChange || !onVoteChange) return;

    const newUpvoted = !isUpvoted;
    onVoteChange(newUpvoted);

    if (newUpvoted) {
      // Add upvote
      onChange({
        selectedActions: [...(comment.selectedActions ?? []), ACTIONS_TYPE.UPVOTE],
        actions: {
          ...(comment.actions || {}),
          UPVOTE: upvoteCount + 1,
        },
      });
    } else {
      // Remove upvote
      onChange({
        selectedActions: comment.selectedActions?.filter((a) => a !== ACTIONS_TYPE.UPVOTE),
        actions: {
          ...(comment.actions || {}),
          UPVOTE: Math.max(0, upvoteCount - 1),
        },
      });
    }
  };

  const handleReactionSelect = (selectedReactions: ACTIONS_TYPE[], changedReaction: ACTIONS_TYPE) => {
    if (!onChange) return;

    const currentCount = comment.actions?.[changedReaction] ?? 0;
    onChange({
      selectedActions: selectedReactions,
      actions: {
        ...(comment.actions || {}),
        [changedReaction]: currentCount + 1,
      },
    });
  };

  const handleReactionUnselect = (selectedReactions: ACTIONS_TYPE[], changedReaction: ACTIONS_TYPE) => {
    if (!onChange) return;

    const currentCount = comment.actions?.[changedReaction] ?? 0;
    onChange({
      selectedActions: selectedReactions,
      actions: {
        ...(comment.actions || {}),
        [changedReaction]: Math.max(0, currentCount - 1),
      },
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onChange && editedText !== comment.text) {
      onChange({ text: editedText });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(comment.text);
    setIsEditing(false);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#comment-${comment.id}`;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      onDelete?.();
    }
  };

  return (
    <div className="flex flex-col gap-1" id={`comment-${comment.id}`}>
      <div className="flex gap-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
          <AvatarFallback>{comment.user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full">
          <div className="min-h-[30px] rounded-lg border border-input">
            {/* Header */}
            <div className="h-[37px] w-full flex items-center justify-between border-b border-input px-3">
              <span className="font-semibold">{comment.user.fullName}</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyLink}>Copy link</DropdownMenuItem>
                  {isOwnComment && (
                    <>
                      <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="p-3">
              {isEditing ? (
                <CommentEditor
                  value={editedText}
                  onChange={setEditedText}
                  currentUser={currentUser}
                  submitText="Update"
                  onSubmit={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  showCancel
                  className="border-0"
                />
              ) : (
                <CommentPreview source={comment.text} className="prose prose-sm max-w-none" />
              )}
            </div>

            {/* Reactions */}
            {allowUpvote && !isEditing && (
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm px-3 pb-2">
                {/* Upvote button */}
                <button
                  onClick={handleUpvote}
                  className={cn(
                    'border rounded-xl px-2 py-0.5 inline-flex gap-1 items-center cursor-pointer transition-colors',
                    isUpvoted ? 'border-primary text-primary' : 'hover:bg-accent',
                  )}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  <span>{upvoteCount}</span>
                </button>

                {/* Emoji picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-full">
                      <SmileIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0.5 w-auto" align="start">
                    <EmojiReactions
                      value={comment.selectedActions}
                      onSelect={handleReactionSelect}
                      onUnSelect={handleReactionUnselect}
                    />
                  </PopoverContent>
                </Popover>

                {/* Visible reactions */}
                {visibleReactions.map((action) => (
                  <div key={action.id} className="border rounded-xl px-2 py-0.5 inline-flex gap-1 items-center">
                    <span>{action.emoji}</span>
                    <span>{comment.actions?.[action.id]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex gap-2 items-center text-sm font-semibold text-muted-foreground ml-1 mt-1">
            <button onClick={() => setIsReplying(true)} className="text-primary cursor-pointer hover:underline">
              Reply
            </button>
            <CircleIcon className="h-1 w-1 fill-current" />
            <span>{formatDistance(comment.createdAt, new Date(), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Reply editor */}
      {isReplying && onReply && (
        <div className="ml-12">
          <CommentEditor
            currentUser={currentUser}
            placeholder="Write a reply..."
            submitText="Reply"
            showCancel
            onSubmit={() => {
              // The parent component will handle the actual reply submission
              setIsReplying(false);
            }}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 flex flex-col gap-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={reply.user.avatarUrl} alt={reply.user.fullName} />
                <AvatarFallback>{reply.user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col flex-1">
                <div className="bg-accent/50 rounded-lg p-3">
                  <CommentPreview source={reply.text} className="text-sm" />
                </div>
                <div className="inline-flex gap-1 text-xs font-semibold text-muted-foreground mt-1">
                  <span className="text-foreground">{reply.user.fullName}</span>
                  <CircleIcon className="h-1 w-1 fill-current mt-1" />
                  <span>{formatDistance(reply.createdAt, new Date(), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
