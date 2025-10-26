import { useQueryWithAuth } from '@/hooks/use-query-with-auth';

import { getWorkspaces } from '../api/workspace-api';

export const workspaceQueryKey = ['workspaces'];

export const useWorkspaces = () => {
  return useQueryWithAuth({
    queryKey: workspaceQueryKey,
    queryFn: () => getWorkspaces(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
};
