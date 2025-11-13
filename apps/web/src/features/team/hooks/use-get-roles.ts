/**
 * Hook for fetching workspace team roles
 *
 * API: POST /api/workspace/{workspaceId}/workspace/get/p/team_roles
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import {
  buildRoleQuery,
  ROLE_QUERY_PRESETS,
  type RoleQueries,
  type GetRolesRequest,
  type GetRolesResponse,
  type WorkspaceTeamRole,
} from '../types/role';

/**
 * Options for useGetRoles hook
 */
export interface UseGetRolesOptions {
  /**
   * Query configuration - can be:
   * - A preset name (e.g., 'BASIC', 'FULL', 'MINIMAL')
   * - A custom RoleQueries object
   * - undefined (uses FULL preset by default)
   */
  query?: RoleQueries | keyof typeof ROLE_QUERY_PRESETS;

  /**
   * React Query options
   */
  reactQueryOptions?: Omit<UseQueryOptions<WorkspaceTeamRole[], Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching workspace team roles
 *
 * @param workspaceId - Current workspace ID
 * @param workspaceTeamId - Team ID to fetch roles for (required)
 * @param options - Query and React Query options
 * @returns Query result with roles data
 *
 * @example
 * ```tsx
 * // Use preset for basic role info
 * const { data: roles } = useGetRoles(workspaceId, teamId, {
 *   query: 'BASIC'
 * });
 *
 * // Use preset for full details
 * const { data: roles } = useGetRoles(workspaceId, teamId, {
 *   query: 'FULL'
 * });
 *
 * // Custom query
 * const { data: roles } = useGetRoles(workspaceId, teamId, {
 *   query: {
 *     fields: 'id,roleName,roleDescription',
 *     limit: 20
 *   }
 * });
 * ```
 */
export function useGetRoles(workspaceId: string, workspaceTeamId: string, options?: UseGetRolesOptions) {
  const query = options?.query;
  const reactQueryOptions = options?.reactQueryOptions;
  const requestBody: GetRolesRequest = buildRoleQuery(workspaceTeamId, query);
  const queryKey = ['workspace-team-roles', workspaceId, workspaceTeamId, requestBody.queries];

  return useQuery<WorkspaceTeamRole[], Error>({
    queryKey,
    queryFn: async () => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/get/p/team_roles
      const response = await client.post<GetRolesResponse>(
        '/workspace/get/p/team_roles',
        requestBody as unknown as Record<string, unknown>,
      );

      return response.data.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!workspaceTeamId, // Only fetch if teamId is provided
    ...reactQueryOptions,
  });
}

/**
 * Re-export types and presets
 */
export { ROLE_QUERY_PRESETS, type RoleQueries, type WorkspaceTeamRole };
