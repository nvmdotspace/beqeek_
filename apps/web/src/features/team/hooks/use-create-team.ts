/**
 * Hook for creating a workspace team
 *
 * API: POST /api/workspace/{workspaceId}/workspace/post/teams
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import type { TeamMutationRequest, TeamMutationResponse, WorkspaceTeam } from '../types/team';

/**
 * Options for useCreateTeam hook
 */
export interface UseCreateTeamOptions {
  /**
   * React Query mutation options
   */
  mutationOptions?: Omit<UseMutationOptions<WorkspaceTeam, Error, TeamMutationRequest>, 'mutationFn'>;
}

/**
 * Hook for creating a workspace team
 *
 * @param workspaceId - Current workspace ID
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const createTeam = useCreateTeam(workspaceId);
 *
 * const handleCreate = () => {
 *   createTeam.mutate({
 *     data: {
 *       teamName: 'Engineering',
 *       teamDescription: 'Software development team'
 *     }
 *   });
 * };
 * ```
 */
export function useCreateTeam(workspaceId: string, options?: UseCreateTeamOptions) {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceTeam, Error, TeamMutationRequest>({
    mutationFn: async (request: TeamMutationRequest) => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/post/teams
      const response = await client.post<TeamMutationResponse>(
        '/workspace/post/teams',
        request as unknown as Record<string, unknown>,
      );

      if (!response.data.data) {
        throw new Error('No data returned from create team');
      }

      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate teams list to refetch
      queryClient.invalidateQueries({ queryKey: ['workspace-teams', workspaceId] });
    },
    ...options?.mutationOptions,
  });
}
