/**
 * ReplyIndicator - Shows which comments are being replied to
 * Appears above the editor when replying to one or more comments
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, CornerDownRight, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { stripHtmlTags } from '@workspace/beqeek-shared';

import type { Comment } from '../types/comment.js';

export interface ReplyIndicatorProps {
  /** IDs of comments being replied to */
  replyingToIds: string[];
  /** All comments for lookup */
  comments: Comment[];
  /** Callback when removing a reply target */
  onRemove: (id: string) => void;
  /** Callback when clearing all reply targets */
  onClearAll: () => void;
  /** Max visible items before collapsing (default: 2) */
  maxVisible?: number;
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

export function ReplyIndicator({ replyingToIds, comments, onRemove, onClearAll, maxVisible = 2 }: ReplyIndicatorProps) {
  const [showAll, setShowAll] = useState(false);

  if (replyingToIds.length === 0) return null;

  const replyingComments = replyingToIds
    .map((id) => comments.find((c) => c.id === id))
    .filter((c): c is Comment => c !== undefined);

  const visibleComments = showAll ? replyingComments : replyingComments.slice(0, maxVisible);
  const hiddenCount = replyingComments.length - maxVisible;

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <CornerDownRight className="h-3.5 w-3.5" />
          Replying to {replyingToIds.length > 1 ? `${replyingToIds.length} messages` : ''}
        </span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClearAll}>
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>

      <div className="space-y-1.5">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="flex items-center gap-2 bg-background rounded px-2 py-1.5 group">
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarImage src={comment.user.avatarUrl} />
              <AvatarFallback className="text-[10px]">{getInitials(comment.user.fullName)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate flex-1">
              <span className="font-medium text-foreground">{comment.user.fullName}:</span>{' '}
              {truncateText(comment.text, 50)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(comment.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && !showAll && (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs mt-1.5 w-full" onClick={() => setShowAll(true)}>
          <ChevronDown className="h-3 w-3 mr-1" />
          Show {hiddenCount} more
        </Button>
      )}

      {showAll && replyingComments.length > maxVisible && (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs mt-1.5 w-full" onClick={() => setShowAll(false)}>
          <ChevronUp className="h-3 w-3 mr-1" />
          Collapse
        </Button>
      )}
    </div>
  );
}
