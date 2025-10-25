import { useQueryWithAuth } from '@/hooks/use-query-with-auth';

import { getWorkspaces } from '../api/workspace-api';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';

export const workspaceQueryKey = ['workspaces'];

export const useWorkspaces = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workspaceQueryKey,
    queryFn: () => getWorkspaces(),
    enabled: isAuthenticated, // Only run query when authenticated
  });
};
