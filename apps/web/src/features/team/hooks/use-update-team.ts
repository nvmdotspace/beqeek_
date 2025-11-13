/**
 * Hook for updating a workspace team
 *
 * API: POST /api/workspace/{workspaceId}/workspace/patch/teams/{teamId}
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import type { TeamMutationRequest } from '../types/team';

/**
 * Mutation variables for updating a team
 */
export interface UpdateTeamVariables {
  teamId: string;
  request: TeamMutationRequest;
}

/**
 * Standard API response for mutations
 */
interface StandardResponse {
  message?: string | null;
}

/**
 * Options for useUpdateTeam hook
 */
export interface UseUpdateTeamOptions {
  /**
   * React Query mutation options
   */
  mutationOptions?: Omit<UseMutationOptions<void, Error, UpdateTeamVariables>, 'mutationFn'>;
}

/**
 * Hook for updating a workspace team
 *
 * @param workspaceId - Current workspace ID
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const updateTeam = useUpdateTeam(workspaceId);
 *
 * const handleUpdate = () => {
 *   updateTeam.mutate({
 *     teamId: 'team_123',
 *     request: {
 *       data: {
 *         teamName: 'Engineering Team',
 *         teamDescription: 'Updated description'
 *       }
 *     }
 *   });
 * };
 * ```
 */
export function useUpdateTeam(workspaceId: string, options?: UseUpdateTeamOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateTeamVariables>({
    mutationFn: async ({ teamId, request }: UpdateTeamVariables) => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/patch/teams/{teamId}
      await client.post<StandardResponse>(
        `/workspace/patch/teams/${teamId}`,
        request as unknown as Record<string, unknown>,
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate teams list and specific team
      queryClient.invalidateQueries({ queryKey: ['workspace-teams', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-team', workspaceId, variables.teamId] });
    },
    ...options?.mutationOptions,
  });
}
