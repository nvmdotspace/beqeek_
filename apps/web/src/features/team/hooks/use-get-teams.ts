/**
 * Hook for fetching workspace teams
 *
 * API: POST /api/workspace/{workspaceId}/workspace/get/p/teams
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import {
  buildTeamQuery,
  TEAM_QUERY_PRESETS,
  type TeamQueries,
  type GetTeamsRequest,
  type GetTeamsResponse,
  type WorkspaceTeam,
} from '../types/team';

/**
 * Options for useGetTeams hook
 */
export interface UseGetTeamsOptions {
  /**
   * Query configuration - can be:
   * - A preset name (e.g., 'BASIC', 'WITH_ROLES', 'MINIMAL')
   * - A custom TeamQueries object
   * - undefined (uses WITH_ROLES preset by default)
   */
  query?: TeamQueries | keyof typeof TEAM_QUERY_PRESETS;

  /**
   * React Query options
   */
  reactQueryOptions?: Omit<UseQueryOptions<WorkspaceTeam[], Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching workspace teams
 *
 * @param workspaceId - Current workspace ID
 * @param options - Query and React Query options
 * @returns Query result with teams data
 *
 * @example
 * ```tsx
 * // Use preset for basic team info
 * const { data: teams } = useGetTeams(workspaceId, {
 *   query: 'BASIC'
 * });
 *
 * // Use preset with roles
 * const { data: teams } = useGetTeams(workspaceId, {
 *   query: 'WITH_ROLES'
 * });
 *
 * // Custom query
 * const { data: teams } = useGetTeams(workspaceId, {
 *   query: {
 *     fields: 'id,teamName,teamDescription',
 *     limit: 20,
 *     filtering: {
 *       'teamName:contains': 'Engineering'
 *     }
 *   }
 * });
 * ```
 */
export function useGetTeams(workspaceId: string, options?: UseGetTeamsOptions) {
  const query = options?.query;
  const reactQueryOptions = options?.reactQueryOptions;
  const requestBody: GetTeamsRequest = buildTeamQuery(query);
  const queryKey = ['workspace-teams', workspaceId, requestBody.queries];

  return useQuery<WorkspaceTeam[], Error>({
    queryKey,
    queryFn: async () => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/get/p/teams
      const response = await client.post<GetTeamsResponse>(
        '/workspace/get/p/teams',
        requestBody as unknown as Record<string, unknown>,
      );

      return response.data.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...reactQueryOptions,
  });
}

/**
 * Re-export types and presets
 */
export { TEAM_QUERY_PRESETS, type TeamQueries, type WorkspaceTeam };
