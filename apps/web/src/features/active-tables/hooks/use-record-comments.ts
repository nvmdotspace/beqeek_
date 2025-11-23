/**
 * useRecordComments Hook
 *
 * Manages comments for a specific record
 * Currently stubbed - will integrate with API when endpoints are available
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecordComment } from '@workspace/active-tables-core';

interface UseRecordCommentsOptions {
  /** Whether to fetch comments (default: true) */
  enabled?: boolean;
}

/**
 * Hook to manage record comments
 * Returns empty comments array until API is implemented
 */
export function useRecordComments(
  workspaceId: string,
  tableId: string,
  recordId: string,
  options?: UseRecordCommentsOptions,
) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['record-comments', workspaceId, tableId, recordId],
    queryFn: () => fetchRecordComments(workspaceId, tableId, recordId),
    enabled: (options?.enabled ?? true) && !!workspaceId && !!tableId && !!recordId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => createRecordComment(workspaceId, tableId, recordId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateRecordComment(workspaceId, tableId, recordId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteRecordComment(workspaceId, tableId, recordId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  return {
    comments,
    isLoading,
    addComment: async (content: string) => {
      console.log('[Comments] Adding comment (stub):', content);
      return addCommentMutation.mutateAsync(content);
    },
    updateComment: async (commentId: string, content: string) => {
      console.log('[Comments] Updating comment (stub):', commentId, content);
      return updateCommentMutation.mutateAsync({ commentId, content });
    },
    deleteComment: async (commentId: string) => {
      console.log('[Comments] Deleting comment (stub):', commentId);
      return deleteCommentMutation.mutateAsync(commentId);
    },
  };
}

// ============================================
// Stub API Functions
// TODO: Implement when API endpoints are available
// ============================================

async function fetchRecordComments(
  _workspaceId: string,
  _tableId: string,
  _recordId: string,
): Promise<RecordComment[]> {
  // Return empty array for now
  return [];
}

async function createRecordComment(
  _workspaceId: string,
  _tableId: string,
  _recordId: string,
  _content: string,
): Promise<RecordComment> {
  // Stub implementation
  throw new Error('Comments API not yet implemented');
}

async function updateRecordComment(
  _workspaceId: string,
  _tableId: string,
  _recordId: string,
  _commentId: string,
  _content: string,
): Promise<void> {
  // Stub implementation
  throw new Error('Comments API not yet implemented');
}

async function deleteRecordComment(
  _workspaceId: string,
  _tableId: string,
  _recordId: string,
  _commentId: string,
): Promise<void> {
  // Stub implementation
  throw new Error('Comments API not yet implemented');
}
