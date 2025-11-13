/**
 * Hook for fetching a single workspace team
 *
 * API: POST /api/workspace/{workspaceId}/workspace/get/teams/{teamId}
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import {
  buildTeamQuery,
  TEAM_QUERY_PRESETS,
  type TeamQueries,
  type GetTeamRequest,
  type GetTeamResponse,
  type WorkspaceTeam,
} from '../types/team';

/**
 * Options for useGetTeam hook
 */
export interface UseGetTeamOptions {
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
  reactQueryOptions?: Omit<UseQueryOptions<WorkspaceTeam | null, Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching a single workspace team
 *
 * @param workspaceId - Current workspace ID
 * @param teamId - Team ID to fetch
 * @param options - Query and React Query options
 * @returns Query result with team data
 *
 * @example
 * ```tsx
 * const { data: team } = useGetTeam(workspaceId, teamId, {
 *   query: 'WITH_ROLES'
 * });
 * ```
 */
export function useGetTeam(workspaceId: string, teamId: string, options?: UseGetTeamOptions) {
  const query = options?.query;
  const reactQueryOptions = options?.reactQueryOptions;
  const requestBody: GetTeamRequest = buildTeamQuery(query);
  const queryKey = ['workspace-team', workspaceId, teamId, requestBody.queries];

  return useQuery<WorkspaceTeam | null, Error>({
    queryKey,
    queryFn: async () => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/get/teams/{teamId}
      const response = await client.post<GetTeamResponse>(
        `/workspace/get/teams/${teamId}`,
        requestBody as unknown as Record<string, unknown>,
      );

      return response.data.data ?? null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...reactQueryOptions,
  });
}

/**
 * Re-export types and presets
 */
export { TEAM_QUERY_PRESETS, type TeamQueries, type WorkspaceTeam };
