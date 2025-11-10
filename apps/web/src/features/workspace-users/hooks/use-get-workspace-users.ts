/**
 * Hook for fetching workspace users
 *
 * API: POST /api/workspace/{workspaceId}/workspace/get/users
 * Used for user reference fields (SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER)
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import {
  buildWorkspaceUsersQuery,
  WORKSPACE_USERS_QUERY_PRESETS,
  type WorkspaceUsersQueries,
  type GetWorkspaceUsersRequest,
} from '../types/workspace-users-query';
import type { WorkspaceUser } from '@workspace/active-tables-core';

/**
 * API response user type (from backend)
 */
interface ApiWorkspaceUser {
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
 * Map API user response to WorkspaceUser type expected by active-tables-core
 */
function mapApiUserToWorkspaceUser(apiUser: ApiWorkspaceUser): WorkspaceUser {
  return {
    id: apiUser.id,
    name: apiUser.fullName, // Map fullName to name
    avatar: apiUser.avatar,
    role: undefined, // Optional, not provided by API
  };
}

/**
 * Options for useGetWorkspaceUsers hook
 */
export interface UseGetWorkspaceUsersOptions {
  /**
   * Query configuration - can be:
   * - A preset name (e.g., 'CREATE_RECORD_FORM', 'BASIC_WITH_AVATAR')
   * - A custom WorkspaceUsersQueries object
   * - undefined (fetches all fields)
   */
  query?: WorkspaceUsersQueries | keyof typeof WORKSPACE_USERS_QUERY_PRESETS;

  /**
   * React Query options
   */
  reactQueryOptions?: Omit<UseQueryOptions<WorkspaceUser[], Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching workspace users with flexible field selection and filtering
 *
 * @param workspaceId - Current workspace ID
 * @param options - Query and React Query options
 * @returns Query result with users data
 *
 * @example
 * ```tsx
 * // Use preset for create record form (minimal fields)
 * const { data: users } = useGetWorkspaceUsers(workspaceId, {
 *   query: 'CREATE_RECORD_FORM'
 * });
 *
 * // Use preset for basic user info with avatar
 * const { data: users } = useGetWorkspaceUsers(workspaceId, {
 *   query: 'BASIC_WITH_AVATAR'
 * });
 *
 * // Custom query with specific fields
 * const { data: users } = useGetWorkspaceUsers(workspaceId, {
 *   query: {
 *     fields: 'id,fullName,avatar',
 *     limit: 20,
 *     filtering: {
 *       workspaceTeamRole: { workspaceTeamId: 123 }
 *     }
 *   }
 * });
 *
 * // Fetch all fields (no filtering)
 * const { data: users } = useGetWorkspaceUsers(workspaceId);
 * ```
 */
export function useGetWorkspaceUsers(workspaceId: string, options?: UseGetWorkspaceUsersOptions) {
  const query = options?.query;
  const reactQueryOptions = options?.reactQueryOptions;
  const requestBody: GetWorkspaceUsersRequest = buildWorkspaceUsersQuery(query);
  const queryKey = ['workspace-users', workspaceId, requestBody.queries];

  return useQuery<WorkspaceUser[], Error>({
    queryKey,
    queryFn: async () => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/get/users
      const response = await client.post<GetWorkspaceUsersResponse>(
        '/workspace/get/users',
        requestBody as Record<string, unknown>,
      );

      const apiUsers = response.data.data ?? [];
      const mappedUsers = apiUsers.map(mapApiUserToWorkspaceUser);

      return mappedUsers;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...reactQueryOptions,
  });
}

/**
 * Re-export types and presets for convenience
 */
export {
  WORKSPACE_USERS_QUERY_PRESETS,
  type WorkspaceUsersQueries,
  type GetWorkspaceUsersRequest,
  type WorkspaceUser, // Re-export from active-tables-core for convenience
};
