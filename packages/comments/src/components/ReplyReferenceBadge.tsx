/**
 * ReplyReferenceBadge - Shows which comments a message is replying to
 * Displayed inline with the comment content
 * Supports lazy loading for comments on other pages (pagination)
 */

import { useState, useEffect, useCallback } from 'react';
import { CornerDownRight, Loader2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { stripHtmlTags } from '@workspace/beqeek-shared';

import type { Comment } from '../types/comment.js';
import type { CommentI18n } from '../types/i18n.js';

import { defaultI18n } from '../types/i18n.js';

export interface ReplyReferenceBadgeProps {
  /** IDs of comments this is replying to */
  replyToIds: string[];
  /** All comments for lookup */
  comments: Comment[];
  /** Callback when clicking on a reference to jump to it */
  onJumpToComment?: (id: string) => void;
  /** Callback to fetch comments by IDs (for pagination support) */
  onFetchReplyComments?: (ids: string[]) => Promise<Comment[]>;
  /** Internationalization strings */
  i18n?: Partial<CommentI18n>;
}

// Module-level cache for fetched comments (persists across re-renders)
const replyCommentsCache = new Map<string, Comment>();

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

export function ReplyReferenceBadge({
  replyToIds,
  comments,
  onJumpToComment,
  onFetchReplyComments,
  i18n: i18nProp,
}: ReplyReferenceBadgeProps) {
  const i18n = { ...defaultI18n, ...i18nProp };
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedComments, setFetchedComments] = useState<Comment[]>([]);

  if (replyToIds.length === 0) return null;

  // Find comments from current page
  const localComments = replyToIds
    .map((id) => comments.find((c) => c.id === id))
    .filter((c): c is Comment => c !== undefined);

  // Find missing IDs (not in current page, not in cache)
  const missingIds = replyToIds.filter((id) => !comments.find((c) => c.id === id) && !replyCommentsCache.has(id));

  // Get cached comments
  const cachedComments = replyToIds
    .map((id) => replyCommentsCache.get(id))
    .filter((c): c is Comment => c !== undefined);

  // Combine all available comments (local + cached + fetched)
  const allReplyComments = [...localComments, ...cachedComments, ...fetchedComments];

  // Deduplicate by ID
  const replyingComments = Array.from(new Map(allReplyComments.map((c) => [c.id, c])).values());

  // Fetch missing comments when popover opens
  const handleOpenChange = useCallback(
    async (open: boolean) => {
      setIsOpen(open);

      if (open && missingIds.length > 0 && onFetchReplyComments) {
        setIsLoading(true);
        try {
          const fetched = await onFetchReplyComments(missingIds);
          // Update cache
          fetched.forEach((c) => replyCommentsCache.set(c.id, c));
          setFetchedComments((prev) => [...prev, ...fetched]);
        } catch (error) {
          console.error('[ReplyReferenceBadge] Failed to fetch comments:', error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [missingIds, onFetchReplyComments],
  );

  // For single reply case, also need to handle missing comment
  const singleReplyMissing = replyToIds.length === 1 && replyingComments.length === 0;

  // Handle single reply click - fetch if missing
  const handleSingleReplyClick = useCallback(async () => {
    const targetId = replyToIds[0]!;

    // If comment is available, just jump to it
    const existingComment = replyingComments.find((c) => c.id === targetId);
    if (existingComment) {
      onJumpToComment?.(targetId);
      return;
    }

    // Need to fetch first
    if (onFetchReplyComments && missingIds.includes(targetId)) {
      setIsLoading(true);
      try {
        const fetched = await onFetchReplyComments([targetId]);
        fetched.forEach((c) => replyCommentsCache.set(c.id, c));
        setFetchedComments((prev) => [...prev, ...fetched]);
        // Then jump
        onJumpToComment?.(targetId);
      } catch (error) {
        console.error('[ReplyReferenceBadge] Failed to fetch comment:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [replyToIds, replyingComments, missingIds, onFetchReplyComments, onJumpToComment]);

  // No comments found and no way to fetch - show count only
  if (replyingComments.length === 0 && !onFetchReplyComments) {
    return (
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5"
        disabled
      >
        <CornerDownRight className="h-3 w-3 flex-shrink-0" />
        <span>{i18n.replyingToCount(replyToIds.length)}</span>
      </button>
    );
  }

  // Single reply - show inline preview or loading
  if (replyToIds.length === 1) {
    const singleComment = replyingComments[0];

    if (singleComment) {
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

    // Single reply but comment not loaded yet - show clickable loading state
    return (
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5"
        onClick={handleSingleReplyClick}
        disabled={isLoading}
      >
        <CornerDownRight className="h-3 w-3 flex-shrink-0" />
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>{i18n.replyingTo}</span>}
      </button>
    );
  }

  // Multiple replies - show popover with lazy loading
  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5"
        >
          <CornerDownRight className="h-3 w-3 flex-shrink-0" />
          <span>{i18n.replyingToCount(replyToIds.length)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="space-y-1">
          {isLoading && replyingComments.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
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
                    <span className="text-xs text-muted-foreground truncate block">
                      {truncateText(comment.text, 40)}
                    </span>
                  </div>
                </button>
              ))}
              {isLoading && replyingComments.length > 0 && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                </div>
              )}
              {replyingComments.length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  {i18n.moreMessages(replyingComments.length - 5)}
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
