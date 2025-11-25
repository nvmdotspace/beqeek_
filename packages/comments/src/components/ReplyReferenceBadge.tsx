/**
 * ReplyReferenceBadge - Shows which comments a message is replying to
 * Displayed inline with the comment content
 */

import { CornerDownRight } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { stripHtmlTags } from '@workspace/beqeek-shared';

import type { Comment } from '../types/comment.js';

export interface ReplyReferenceBadgeProps {
  /** IDs of comments this is replying to */
  replyToIds: string[];
  /** All comments for lookup */
  comments: Comment[];
  /** Callback when clicking on a reference to jump to it */
  onJumpToComment?: (id: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Convert mention format <@userId|name> to @name
 */
function parseMentions(text: string): string {
  // Match <@userId|displayName> and replace with @displayName
  return text.replace(/<@[^|]+\|([^>]+)>/g, '@$1');
}

function truncateText(text: string, maxLength: number): string {
  // Strip HTML tags first, then parse mentions to show @name format
  let plainText = stripHtmlTags(text);
  plainText = parseMentions(plainText);
  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength) + '...';
}

export function ReplyReferenceBadge({ replyToIds, comments, onJumpToComment }: ReplyReferenceBadgeProps) {
  if (replyToIds.length === 0) return null;

  const replyingComments = replyToIds
    .map((id) => comments.find((c) => c.id === id))
    .filter((c): c is Comment => c !== undefined);

  if (replyingComments.length === 0) return null;

  // Single reply - show inline preview
  if (replyingComments.length === 1) {
    const singleComment = replyingComments[0]!;
    return (
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5 group"
        onClick={() => onJumpToComment?.(singleComment.id)}
      >
        <CornerDownRight className="h-3 w-3 flex-shrink-0" />
        <span className="truncate max-w-[200px]">
          <span className="font-medium">{singleComment.user.fullName}:</span> {truncateText(singleComment.text, 30)}
        </span>
      </button>
    );
  }

  // Multiple replies - show popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5"
        >
          <CornerDownRight className="h-3 w-3 flex-shrink-0" />
          <span>Replying to {replyingComments.length} messages</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="space-y-1">
          {replyingComments.slice(0, 5).map((comment) => (
            <button
              key={comment.id}
              type="button"
              className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted transition-colors text-left"
              onClick={() => onJumpToComment?.(comment.id)}
            >
              <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage src={comment.user.avatarUrl} />
                <AvatarFallback className="text-[10px]">{getInitials(comment.user.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium block">{comment.user.fullName}</span>
                <span className="text-xs text-muted-foreground truncate block">{truncateText(comment.text, 40)}</span>
              </div>
            </button>
          ))}
          {replyingComments.length > 5 && (
            <div className="text-xs text-muted-foreground text-center py-1">
              +{replyingComments.length - 5} more messages
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
