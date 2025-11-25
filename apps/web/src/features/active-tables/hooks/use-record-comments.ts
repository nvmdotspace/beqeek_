/**
 * useRecordComments Hook
 *
 * Manages comments for a specific record with E2EE encryption support
 * Uses FLAT conversation design with multi-reply support
 */

import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommonUtils, AES256 } from '@workspace/encryption-core';
import { stripHtmlTags } from '@workspace/beqeek-shared';
import type { Comment as PackageComment, CommentUser } from '@workspace/comments';

import * as commentsApi from '../api/active-comments-api';
import type { Comment as ServerComment } from '../api/active-comments-api';

// ============================================
// Types
// ============================================

/** User lookup map for resolving user IDs to user info */
export type UserLookupMap = Map<string, { id: string; fullName: string; avatar?: string }>;

export interface UseRecordCommentsOptions {
  /** Whether to fetch comments (default: true) */
  enabled?: boolean;
  /** Encryption key for E2EE tables */
  encryptionKey?: string;
  /** Page size for pagination */
  pageSize?: number;
  /** User lookup map for resolving createdBy user IDs */
  userLookup?: UserLookupMap;
}

export interface CommentsState {
  /** All loaded comments converted to @workspace/comments format (FLAT - no nesting) */
  comments: PackageComment[];
  /** Is loading initial data */
  isLoading: boolean;
  /** Is loading more pages */
  isFetchingNextPage: boolean;
  /** Has more pages to load */
  hasNextPage: boolean;
  /** Fetch next page */
  fetchNextPage: () => void;
  /**
   * Add new comment
   * @param text - Comment content
   * @param replyToIds - Array of comment IDs being replied to (multi-reply support)
   */
  addComment: (text: string, replyToIds?: string[]) => Promise<void>;
  /** Update existing comment */
  updateComment: (commentId: string, text: string) => Promise<void>;
  /** Delete comment */
  deleteComment: (commentId: string) => Promise<void>;
  /** Fetch single comment content for editing */
  fetchCommentForEdit: (commentId: string) => Promise<string | null>;
  /** Current user for comments */
  currentUser: CommentUser | null;
}

// ============================================
// Encryption Helpers
// ============================================

/**
 * Encrypt comment content for E2EE tables
 */
function encryptContent(content: string, encryptionKey?: string): string {
  if (!encryptionKey) return content;
  return AES256.encrypt(content, encryptionKey);
}

/**
 * Decrypt comment content from E2EE tables
 */
function decryptContent(encryptedContent: string, encryptionKey?: string): string {
  if (!encryptionKey) return encryptedContent;
  try {
    return AES256.decrypt(encryptedContent, encryptionKey);
  } catch {
    // Return as-is if decryption fails (might be unencrypted)
    return encryptedContent;
  }
}

/**
 * Generate hashed keywords for searchable encryption
 * Strips HTML tags before hashing to only index actual content
 */
function generateHashedKeywords(content: string, encryptionKey?: string): Record<string, string[]> | undefined {
  if (!encryptionKey) return undefined;
  // Strip HTML tags to only hash actual text content, not markup
  const plainText = stripHtmlTags(content);
  return {
    commentContent: CommonUtils.hashKeyword(plainText, encryptionKey),
  };
}

/**
 * Extract mentioned user IDs from content
 * Parses Slack-like format: <@userId|name> or HTML-escaped &lt;@userId|name&gt;
 * Returns array of unique user IDs
 */
function extractMentionedUserIds(content: string): string[] {
  const userIds: string[] = [];

  // Match unescaped format: <@userId|name>
  const unescapedRegex = /<@([^|]+)\|[^>]+>/g;
  let match;
  while ((match = unescapedRegex.exec(content)) !== null) {
    const userId = match[1];
    if (userId && !userIds.includes(userId)) {
      userIds.push(userId);
    }
  }

  // Match HTML-escaped format: &lt;@userId|name&gt;
  const escapedRegex = /&lt;@([^|]+)\|[^&]+&gt;/g;
  while ((match = escapedRegex.exec(content)) !== null) {
    const userId = match[1];
    if (userId && !userIds.includes(userId)) {
      userIds.push(userId);
    }
  }

  return userIds;
}

// ============================================
// Data Conversion
// ============================================

/**
 * Convert server comment to @workspace/comments format
 * Now returns FLAT structure with replyToIds array (no nesting)
 */
function serverToPackageComment(
  serverComment: ServerComment,
  encryptionKey?: string,
  userLookup?: UserLookupMap,
): PackageComment {
  const decryptedContent = decryptContent(serverComment.commentContent, encryptionKey);

  // Handle createdBy as string (userId) or object { id, fullName, avatar }
  let userId: string;
  let fullName: string;
  let avatarUrl: string | undefined;

  if (typeof serverComment.createdBy === 'string') {
    // createdBy is a userId string - lookup user info
    userId = serverComment.createdBy;
    const userInfo = userLookup?.get(userId);
    fullName = userInfo?.fullName || 'Unknown User';
    avatarUrl = userInfo?.avatar;
  } else if (serverComment.createdBy && typeof serverComment.createdBy === 'object') {
    // createdBy is an object with user details
    userId = serverComment.createdBy.id || 'unknown';
    fullName = serverComment.createdBy.fullName || 'Unknown User';
    avatarUrl = serverComment.createdBy.avatar;
  } else {
    // Fallback for undefined/null
    userId = 'unknown';
    fullName = 'Unknown User';
    avatarUrl = undefined;
  }

  // Server returns replyTo as array - keep as replyToIds for multi-reply
  const replyToIds = serverComment.replyTo?.filter((id) => id && id.trim() !== '') || [];

  return {
    id: serverComment.id,
    user: {
      id: userId,
      fullName,
      avatarUrl,
    },
    // Multi-reply support
    replyToIds,
    // Backward compat: parentId is first element
    parentId: replyToIds[0],
    text: decryptedContent || '',
    createdAt: serverComment.createdAt ? new Date(serverComment.createdAt) : new Date(),
    actions: {},
    selectedActions: [],
  };
}

// ============================================
// Main Hook
// ============================================

/**
 * Hook to manage record comments with real API and E2EE support
 * Returns FLAT comment list (no nesting) with multi-reply support
 */
export function useRecordComments(
  workspaceId: string,
  tableId: string,
  recordId: string,
  options: UseRecordCommentsOptions = {},
): CommentsState {
  const { enabled = true, encryptionKey, pageSize = 50, userLookup } = options;
  const queryClient = useQueryClient();

  const queryKey = ['record-comments', workspaceId, tableId, recordId];

  // ============================================
  // Fetch Comments (Infinite Query)
  // ============================================

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const response = await commentsApi.fetchComments(workspaceId, tableId, recordId, {
        paging: 'cursor',
        next_id: pageParam,
        direction: 'asc',
        limit: pageSize,
      });
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_id ?? undefined,
    enabled: enabled && !!workspaceId && !!tableId && !!recordId,
  });

  // ============================================
  // Convert Comments - FLAT (no tree building)
  // ============================================

  const comments = useMemo((): PackageComment[] => {
    if (!data?.pages) return [];

    // Flatten all pages and convert to package format
    const allServerComments = data.pages.flatMap((page) => page.data);

    // Return FLAT list (no tree building) - each comment has replyToIds
    return allServerComments.map((c) => serverToPackageComment(c, encryptionKey, userLookup));
  }, [data?.pages, encryptionKey, userLookup]);

  // ============================================
  // Mutations
  // ============================================

  const addCommentMutation = useMutation({
    mutationFn: async ({ text, replyToIds }: { text: string; replyToIds?: string[] }) => {
      // Extract mentioned user IDs before encryption
      const taggedUserIds = extractMentionedUserIds(text);
      const encryptedContent = encryptContent(text, encryptionKey);
      const hashedKeywords = generateHashedKeywords(text, encryptionKey);

      return commentsApi.createComment(workspaceId, tableId, recordId, {
        commentContent: encryptedContent,
        // Send full replyToIds array for multi-reply support
        replyTo: replyToIds?.length ? replyToIds : undefined,
        taggedUserIds: taggedUserIds.length > 0 ? taggedUserIds : undefined,
        hashed_keywords: hashedKeywords,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, text }: { commentId: string; text: string }) => {
      // Extract mentioned user IDs before encryption
      const taggedUserIds = extractMentionedUserIds(text);
      const encryptedContent = encryptContent(text, encryptionKey);
      const hashedKeywords = generateHashedKeywords(text, encryptionKey);

      return commentsApi.updateComment(workspaceId, tableId, recordId, commentId, {
        commentContent: encryptedContent,
        taggedUserIds: taggedUserIds.length > 0 ? taggedUserIds : undefined,
        hashed_keywords: hashedKeywords,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return commentsApi.deleteComment(workspaceId, tableId, recordId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // ============================================
  // Action Handlers
  // ============================================

  const addComment = useCallback(
    async (text: string, replyToIds?: string[]) => {
      await addCommentMutation.mutateAsync({ text, replyToIds });
    },
    [addCommentMutation],
  );

  const updateComment = useCallback(
    async (commentId: string, text: string) => {
      await updateCommentMutation.mutateAsync({ commentId, text });
    },
    [updateCommentMutation],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      await deleteCommentMutation.mutateAsync(commentId);
    },
    [deleteCommentMutation],
  );

  // Fetch single comment for editing (get fresh content from server)
  const fetchCommentForEdit = useCallback(
    async (commentId: string): Promise<string | null> => {
      try {
        const response = await commentsApi.fetchComment(workspaceId, tableId, recordId, commentId);
        const serverComment = response.data;
        // Decrypt content if needed
        return decryptContent(serverComment.commentContent, encryptionKey);
      } catch (error) {
        console.error('[Comments] Failed to fetch comment for edit:', error);
        return null;
      }
    },
    [workspaceId, tableId, recordId, encryptionKey],
  );

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ============================================
  // Return State
  // ============================================

  return {
    comments,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage: handleFetchNextPage,
    addComment,
    updateComment,
    deleteComment,
    fetchCommentForEdit,
    currentUser: null, // Will be set by parent component
  };
}

// ============================================
// Query Key Export (for external invalidation)
// ============================================

export const getCommentsQueryKey = (workspaceId: string, tableId: string, recordId: string) => [
  'record-comments',
  workspaceId,
  tableId,
  recordId,
];
