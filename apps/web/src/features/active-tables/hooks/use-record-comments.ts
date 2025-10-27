import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore, selectIsAuthenticated } from '@/features/auth';

import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  type Comment,
  type CommentQueryParams,
  type CreateCommentRequest,
  type UpdateCommentRequest,
} from '../api/active-comments-api';

interface UseRecordCommentsOptions {
  workspaceId?: string;
  tableId?: string;
  recordId?: string;
  pageSize?: number;
  ordering?: CommentQueryParams['direction'];
}

export const useRecordComments = ({
  workspaceId,
  tableId,
  recordId,
  pageSize = 20,
  ordering = 'asc',
}: UseRecordCommentsOptions) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const queryKey = useMemo(
    () => ['record-comments', workspaceId, tableId, recordId, pageSize, ordering],
    [workspaceId, tableId, recordId, pageSize, ordering],
  );

  const enabled = Boolean(isAuthenticated && workspaceId && tableId && recordId);

  const commentsQuery = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) =>
      fetchComments(workspaceId!, tableId!, recordId!, {
        paging: 'cursor',
        limit: pageSize,
        next_id: pageParam ?? undefined,
        direction: ordering,
      }),
    getNextPageParam: (lastPage) => lastPage.next_id ?? null,
  });

  const mergedComments: Comment[] = useMemo(() => {
    if (!commentsQuery.data?.pages?.length) return [];
    return commentsQuery.data.pages.flatMap((page) => page.data ?? []);
  }, [commentsQuery.data]);

  const invalidateComments = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const createCommentMutation = useMutation({
    mutationFn: async (payload: CreateCommentRequest) => {
      if (!workspaceId || !tableId || !recordId) {
        throw new Error('Missing identifiers for creating comment');
      }

      return await createComment(workspaceId, tableId, recordId, payload);
    },
    onSuccess: invalidateComments,
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, payload }: { commentId: string; payload: UpdateCommentRequest }) => {
      if (!workspaceId || !tableId || !recordId) {
        throw new Error('Missing identifiers for updating comment');
      }

      return await updateComment(workspaceId, tableId, recordId, commentId, payload);
    },
    onSuccess: invalidateComments,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!workspaceId || !tableId || !recordId) {
        throw new Error('Missing identifiers for deleting comment');
      }

      return await deleteComment(workspaceId, tableId, recordId, commentId);
    },
    onSuccess: invalidateComments,
  });

  return {
    comments: mergedComments,
    query: commentsQuery,
    fetchNext: commentsQuery.fetchNextPage,
    hasNextPage: commentsQuery.hasNextPage,
    isFetchingNextPage: commentsQuery.isFetchingNextPage,
    createComment: createCommentMutation.mutateAsync,
    updateComment: updateCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
};
