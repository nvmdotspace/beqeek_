/**
 * Hook for fetching workspace users with flexible field selection
 *
 * API: POST /api/workspace/{workspaceId}/workspace/get/users
 * Used for user reference fields (SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER)
 *
 * Backend determines which fields to return based on `query.fields` parameter
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
export interface UseGetWorkspaceUsersOptions<TRaw extends boolean = false> {
  /**
   * Query configuration - can be:
   * - A preset name (e.g., 'CREATE_RECORD_FORM', 'BASIC_WITH_AVATAR', 'FULL_DETAILS')
   * - A custom WorkspaceUsersQueries object
   * - undefined (fetches all fields)
   */
  query?: WorkspaceUsersQueries | keyof typeof WORKSPACE_USERS_QUERY_PRESETS;

  /**
   * Return raw API response instead of mapping to WorkspaceUser type
   * Useful when you need full user details including workspaceMemberships
   * @default false
   */
  returnRaw?: TRaw;

  /**
   * React Query options
   */
  reactQueryOptions?: Omit<
    UseQueryOptions<TRaw extends true ? ApiWorkspaceUser[] : WorkspaceUser[], Error>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook for fetching workspace users (mapped to WorkspaceUser type)
 *
 * @param workspaceId - Current workspace ID
 * @param options - Query and React Query options
 * @returns Query result with mapped WorkspaceUser data
 *
 * @example
 * ```tsx
 * // Standard usage - returns WorkspaceUser[] (id, name, avatar)
 * const { data: users } = useGetWorkspaceUsers(workspaceId, {
 *   query: 'CREATE_RECORD_FORM'
 * });
 * ```
 */
export function useGetWorkspaceUsers(
  workspaceId: string,
  options?: UseGetWorkspaceUsersOptions<false>,
): ReturnType<typeof useQuery<WorkspaceUser[], Error>>;

/**
 * Hook for fetching workspace users (raw API response)
 *
 * @param workspaceId - Current workspace ID
 * @param options - Query and React Query options with returnRaw: true
 * @returns Query result with raw ApiWorkspaceUser data
 *
 * @example
 * ```tsx
 * // Raw API data - returns ApiWorkspaceUser[] (all fields including workspaceMemberships)
 * const { data: members } = useGetWorkspaceUsers(workspaceId, {
 *   query: 'FULL_DETAILS',
 *   returnRaw: true
 * });
 * ```
 */
export function useGetWorkspaceUsers(
  workspaceId: string,
  options: UseGetWorkspaceUsersOptions<true>,
): ReturnType<typeof useQuery<ApiWorkspaceUser[], Error>>;

/**
 * Implementation
 */
export function useGetWorkspaceUsers(
  workspaceId: string,
  options?: UseGetWorkspaceUsersOptions<boolean>,
): ReturnType<typeof useQuery<WorkspaceUser[], Error>> | ReturnType<typeof useQuery<ApiWorkspaceUser[], Error>> {
  const query = options?.query;
  const returnRaw = options?.returnRaw ?? false;
  const requestBody: GetWorkspaceUsersRequest = buildWorkspaceUsersQuery(query);

  // Use different cache keys for raw vs mapped data
  const queryKey = returnRaw
    ? ['workspace-users-raw', workspaceId, requestBody.queries]
    : ['workspace-users', workspaceId, requestBody.queries];

  // Single useQuery call to satisfy React Hooks rules
  // The queryFn handles both raw and mapped data based on returnRaw flag
  return useQuery({
    queryKey,
    queryFn: async () => {
      const client = createActiveTablesApiClient(workspaceId);
      const response = await client.post<GetWorkspaceUsersResponse>(
        '/workspace/get/users',
        requestBody as Record<string, unknown>,
      );
      const apiUsers = response.data.data ?? [];

      // Return raw or mapped based on flag
      if (returnRaw) {
        return apiUsers;
      }
      return apiUsers.map(mapApiUserToWorkspaceUser);
    },
    staleTime: 5 * 60 * 1000,
    ...(options?.reactQueryOptions as Omit<
      UseQueryOptions<WorkspaceUser[] | ApiWorkspaceUser[], Error>,
      'queryKey' | 'queryFn'
    >),
  }) as ReturnType<typeof useQuery<WorkspaceUser[], Error>> | ReturnType<typeof useQuery<ApiWorkspaceUser[], Error>>;
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
