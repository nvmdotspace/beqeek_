import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { WorkspaceMutationData } from '@/shared/api/types';

import { createWorkspace } from '../api/workspace-api';
import { workspaceQueryKey } from './use-workspaces';
import { useApiErrorHandler } from '@/hooks/use-api-error-handler';

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const { handleError } = useApiErrorHandler();

  return useMutation({
    mutationFn: (payload: WorkspaceMutationData) => createWorkspace(payload),
    onSuccess: async () => {
      // Invalidate to refetch fresh data
      await queryClient.invalidateQueries({
        queryKey: workspaceQueryKey,
        refetchType: 'active', // Only refetch active queries
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
