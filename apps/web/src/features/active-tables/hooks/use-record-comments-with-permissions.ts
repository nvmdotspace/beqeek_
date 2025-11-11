/**
 * Hook for managing record comments with permission checks
 *
 * Supports comment CRUD operations based on user permissions
 * Checks against comment action permissions from table config
 *
 * @see packages/beqeek-shared - COMMENT_ACTION_TYPES and permission constants
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import type { Table } from '@workspace/active-tables-core';
import {
  ACTION_TYPE_COMMENT_CREATE,
  ACTION_TYPE_COMMENT_ACCESS,
  ACTION_TYPE_COMMENT_UPDATE,
  ACTION_TYPE_COMMENT_DELETE,
} from '@workspace/beqeek-shared';

export interface RecordComment {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
  edited?: boolean;
}

export interface CommentPermissions {
  canCreate: boolean;
  canAccess: boolean;
  canUpdate: (commentUserId: string) => boolean;
  canDelete: (commentUserId: string) => boolean;
}

/**
 * Calculate comment permissions based on table config and current user
 *
 * @param table - Table configuration with permissions config
 * @param currentUserId - Current user ID
 * @param userRoleId - Current user's role ID
 * @param userTeamId - Current user's team ID
 * @returns Comment permissions object
 */
function calculateCommentPermissions(
  table: Table | null,
  currentUserId: string | undefined,
  userRoleId: string | undefined,
  userTeamId: string | undefined,
): CommentPermissions {
  if (!table || !currentUserId) {
    return {
      canCreate: false,
      canAccess: false,
      canUpdate: () => false,
      canDelete: () => false,
    };
  }

  // Find matching permission config for user's role/team
  const permConfig = table.config.permissionsConfig?.find((p) => p.roleId === userRoleId || p.teamId === userTeamId);

  if (!permConfig) {
    // No permission config found - deny all
    return {
      canCreate: false,
      canAccess: false,
      canUpdate: () => false,
      canDelete: () => false,
    };
  }

  // Get permission values for each action
  const createAction = permConfig.actions.find((a) => a.actionId === ACTION_TYPE_COMMENT_CREATE);
  const accessAction = permConfig.actions.find((a) => a.actionId === ACTION_TYPE_COMMENT_ACCESS);
  const updateAction = permConfig.actions.find((a) => a.actionId === ACTION_TYPE_COMMENT_UPDATE);
  const deleteAction = permConfig.actions.find((a) => a.actionId === ACTION_TYPE_COMMENT_DELETE);

  // Helper to check if permission allows action
  const checkPermission = (permission: string | undefined, commentUserId: string): boolean => {
    if (!permission || permission === 'not_allowed') return false;
    if (permission === 'all') return true;
    if (permission === 'self_created') return commentUserId === currentUserId;
    // Add more permission checks as needed
    return false;
  };

  return {
    canCreate: createAction?.permission !== 'not_allowed',
    canAccess: accessAction?.permission !== 'not_allowed',
    canUpdate: (commentUserId: string) => checkPermission(updateAction?.permission, commentUserId),
    canDelete: (commentUserId: string) => checkPermission(deleteAction?.permission, commentUserId),
  };
}

/**
 * Hook for record comments with permission management
 *
 * TODO: Replace mock implementation with actual API calls
 *
 * @example
 * ```tsx
 * const {
 *   comments,
 *   permissions,
 *   isLoading,
 *   addComment,
 *   updateComment,
 *   deleteComment
 * } = useRecordCommentsWithPermissions(
 *   workspaceId,
 *   tableId,
 *   recordId,
 *   table,
 *   currentUser
 * );
 * ```
 */
export function useRecordCommentsWithPermissions(
  workspaceId: string,
  tableId: string,
  recordId: string,
  table: Table | null,
  currentUser?: { id: string; roleId?: string; teamId?: string },
) {
  const queryClient = useQueryClient();

  // Calculate permissions
  const permissions = useMemo(
    () => calculateCommentPermissions(table, currentUser?.id, currentUser?.roleId, currentUser?.teamId),
    [table, currentUser],
  );

  // Fetch comments (TODO: Replace with actual API)
  const { data: comments = [], isLoading } = useQuery<RecordComment[]>({
    queryKey: ['record-comments', workspaceId, tableId, recordId],
    queryFn: async () => {
      // TODO: Implement actual API call
      // For now, return empty array
      return [];
    },
    enabled: !!workspaceId && !!tableId && !!recordId && permissions.canAccess,
    staleTime: 30 * 1000,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!permissions.canCreate) {
        throw new Error('No permission to create comments');
      }

      // TODO: Implement actual API call
      // For now, just log
      console.log('[addComment] Content:', content);
      return {
        id: Date.now().toString(),
        content,
        userId: currentUser?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (!permissions.canUpdate(comment.userId)) {
        throw new Error('No permission to update this comment');
      }

      // TODO: Implement actual API call
      console.log('[updateComment] ID:', commentId, 'Content:', content);
      return { commentId, content };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (!permissions.canDelete(comment.userId)) {
        throw new Error('No permission to delete this comment');
      }

      // TODO: Implement actual API call
      console.log('[deleteComment] ID:', commentId);
      return { commentId };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  return {
    comments,
    permissions,
    isLoading,
    addComment: addCommentMutation.mutateAsync,
    updateComment: (commentId: string, content: string) => updateCommentMutation.mutateAsync({ commentId, content }),
    deleteComment: deleteCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
}
