import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { getWorkspaceUserMe } from '../api/workspace-user-api';

export const WORKSPACE_USER_ME_QUERY_KEY = (workspaceId: string) => ['workspace', workspaceId, 'user', 'me'];

/**
 * Hook to get the current workspace user.
 * Fetches specific workspace user details via /api/workspace/{workspaceId}/workspace/get/me
 *
 * @returns Current workspace user data, loading state, and error
 */
export function useCurrentWorkspaceUser() {
  const { workspaceId } = useParams({ strict: false });

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: WORKSPACE_USER_ME_QUERY_KEY(workspaceId || ''),
    queryFn: async () => {
      if (!workspaceId) return null;
      const response = await getWorkspaceUserMe(workspaceId);
      return response.data;
    },
    enabled: !!workspaceId,
  });

  return {
    user,
    isLoading,
    error,
    workspaceId,
  };
}
