import { useQueryWithAuth } from '@/hooks/use-query-with-auth';

import { getWorkspace } from '../api/workspace-api';

export const workspaceDetailQueryKey = (workspaceId: string) => ['workspace', workspaceId];

/**
 * Hook to fetch a single workspace by ID.
 * Uses React Query for caching and automatic refetching.
 */
export const useWorkspace = (workspaceId: string | undefined) => {
  return useQueryWithAuth({
    queryKey: workspaceDetailQueryKey(workspaceId ?? ''),
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
};
