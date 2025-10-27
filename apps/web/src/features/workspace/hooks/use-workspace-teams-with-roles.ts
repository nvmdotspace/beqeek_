import { useMemo } from 'react';

import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';

import { getWorkspaceTeamsWithRoles } from '../api/workspace-teams-api';

export const workspaceTeamsQueryKey = (workspaceId?: string) => ['workspace-teams', workspaceId ?? 'unknown'];

export const useWorkspaceTeamsWithRoles = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const query = useQueryWithAuth({
    queryKey: workspaceTeamsQueryKey(workspaceId),
    queryFn: () => getWorkspaceTeamsWithRoles(workspaceId!),
    enabled: Boolean(isAuthenticated && workspaceId),
  });

  const teams = useMemo(() => {
    if (!workspaceId) {
      return [];
    }
    const response = query.data;
    if (!response) return [];
    return response.data?.data ?? [];
  }, [workspaceId, query.data]);

  return {
    teams,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
