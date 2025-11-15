/**
 * Hook for fetching workspace users with RAW API data (no mapping)
 * Use this when you need full user details including workspaceMemberships
 *
 * API: POST /api/workspace/{workspaceId}/workspace/get/users
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import {
  buildWorkspaceUsersQuery,
  WORKSPACE_USERS_QUERY_PRESETS,
  type WorkspaceUsersQueries,
  type GetWorkspaceUsersRequest,
} from '../types/workspace-users-query';

/**
 * API response user type (from backend) - FULL details
 */
export interface ApiWorkspaceUser {
  id: string;
  fullName: string;
  avatar?: string;
  thumbnailAvatar?: string;
  email?: string;
  username?: string;
  globalUser?: {
    username: string;
    email?: string;
  };
  workspaceMemberships?: Array<{
    userId: string;
    workspaceTeamRoleId: string;
    workspaceTeamId: string;
    invitedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API response for workspace users
 */
interface GetWorkspaceUsersResponse {
  data?: ApiWorkspaceUser[];
  total?: number;
  message?: string | null;
}

/**
 * Options for useGetWorkspaceUsersRaw hook
 */
export interface UseGetWorkspaceUsersRawOptions {
  /**
   * Query configuration - can be:
   * - A preset name (e.g., 'FULL_DETAILS', 'BASIC_WITH_AVATAR')
   * - A custom WorkspaceUsersQueries object
   * - undefined (fetches all fields)
   */
  query?: WorkspaceUsersQueries | keyof typeof WORKSPACE_USERS_QUERY_PRESETS;

  /**
   * React Query options
   */
  reactQueryOptions?: Omit<UseQueryOptions<ApiWorkspaceUser[], Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching workspace users with RAW API data (no mapping to WorkspaceUser type)
 * Returns full user details including workspaceMemberships
 *
 * @param workspaceId - Current workspace ID
 * @param options - Query and React Query options
 * @returns Query result with raw API users data
 *
 * @example
 * ```tsx
 * // Fetch users with full details including memberships
 * const { data: users } = useGetWorkspaceUsersRaw(workspaceId, {
 *   query: 'FULL_DETAILS'
 * });
 *
 * // Access workspaceMemberships
 * users.forEach(user => {
 *   console.log(user.workspaceMemberships); // Available!
 * });
 * ```
 */
export function useGetWorkspaceUsersRaw(workspaceId: string, options?: UseGetWorkspaceUsersRawOptions) {
  const query = options?.query;
  const reactQueryOptions = options?.reactQueryOptions;
  const requestBody: GetWorkspaceUsersRequest = buildWorkspaceUsersQuery(query);
  const queryKey = ['workspace-users-raw', workspaceId, requestBody.queries];

  return useQuery<ApiWorkspaceUser[], Error>({
    queryKey,
    queryFn: async () => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/get/users
      const response = await client.post<GetWorkspaceUsersResponse>(
        '/workspace/get/users',
        requestBody as Record<string, unknown>,
      );

      const apiUsers = response.data.data ?? [];
      return apiUsers; // Return raw data without mapping
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...reactQueryOptions,
  });
}

/**
 * Re-export types for convenience
 */
export { WORKSPACE_USERS_QUERY_PRESETS, type WorkspaceUsersQueries, type GetWorkspaceUsersRequest };
