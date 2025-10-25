import { useQuery } from '@tanstack/react-query';

import { getWorkspaces } from '../api/workspace-api';
import { useAuthStore } from '@/features/auth';

export const workspaceQueryKey = ['workspaces'];

export const useWorkspaces = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: workspaceQueryKey,
    queryFn: () => getWorkspaces(),
    enabled: isAuthenticated, // Only run query when authenticated
  });
};
