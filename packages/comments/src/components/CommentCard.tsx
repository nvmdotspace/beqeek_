/**
 * CommentCard component
 * Displays individual comment with reactions, replies, and actions
 */

import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, Copy, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

import type { Comment, CommentChange } from '../types/comment.js';
import type { CommentUser } from '../types/user.js';
import type { MentionUser } from './editor/plugins/MentionsPlugin.js';

import { CommentEditor } from './editor/CommentEditor.js';
import { CommentPreview } from './CommentPreview.js';
import { EmojiReactions } from './EmojiReactions.js';
import { ACTIONS_TYPE } from '../types/comment.js';

export interface CommentCardProps {
  comment: Comment;
  currentUser: CommentUser;
  allowUpvote?: boolean;
  /** Show emoji reactions (default: true) */
  showReactions?: boolean;
  onReply: (replyText: string) => void;
  onChange: (change: CommentChange) => void;
  onDelete: () => void;
  onVoteChange?: (upvoted: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
  mentionUsers?: MentionUser[];
  onMentionSearch?: (query: string) => Promise<MentionUser[]>;
  depth?: number;
}

export function CommentCard({
  comment,
  currentUser,
  allowUpvote,
  showReactions = true,
  onReply,
  onChange,
  onDelete,
  onVoteChange,
  onImageUpload,
  mentionUsers,
  onMentionSearch,
  depth = 0,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = comment.user.id === currentUser.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveEdit = () => {
    onChange({ text: editedText });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(comment.text);
    setIsEditing(false);
  };

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleCancelReply = () => {
    setReplyText('');
    setIsReplying(false);
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
    <div id={`comment-${comment.id}`} className={depth > 0 ? 'ml-12 mt-4' : ''}>
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
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mt-2">
              <CommentEditor
                value={editedText}
                onChange={setEditedText}
                currentUser={currentUser}
                placeholder="Edit comment..."
                submitText="Save"
                onSubmit={handleSaveEdit}
                onCancel={handleCancelEdit}
                showCancel={true}
                onImageUpload={onImageUpload}
                mentionUsers={mentionUsers}
                onMentionSearch={onMentionSearch}
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <CommentPreview source={comment.text} />
            </div>
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
            <div className="flex items-center gap-4 mt-2">
              {allowUpvote && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 ${isUpvoted ? 'text-primary' : ''}`}
                  onClick={handleUpvote}
                >
                  {isUpvoted ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                  {upvoteCount > 0 && <span className="text-xs">{upvoteCount}</span>}
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setIsReplying(!isReplying)}>
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-1" />
                <span className="text-xs">Copy link</span>
              </Button>
            </div>
          )}

          {/* Reply Editor */}
          {isReplying && (
            <div className="mt-3">
              <CommentEditor
                value={replyText}
                onChange={setReplyText}
                currentUser={currentUser}
                placeholder="Write a reply..."
                submitText="Reply"
                onSubmit={handleSubmitReply}
                onCancel={handleCancelReply}
                showCancel={true}
                onImageUpload={onImageUpload}
                mentionUsers={mentionUsers}
                onMentionSearch={onMentionSearch}
              />
            </div>
          )}

          {/* Replies */}
          {hasReplies && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="h-7 px-2 mb-2" onClick={() => setShowReplies(!showReplies)}>
                {showReplies ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
              {showReplies && (
                <div className="space-y-4">
                  {comment.replies!.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      currentUser={currentUser}
                      allowUpvote={allowUpvote}
                      showReactions={showReactions}
                      onReply={onReply}
                      onChange={onChange}
                      onDelete={onDelete}
                      onVoteChange={onVoteChange}
                      onImageUpload={onImageUpload}
                      mentionUsers={mentionUsers}
                      onMentionSearch={onMentionSearch}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
