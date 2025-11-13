/**
 * Hook for deleting a workspace team
 *
 * API: POST /api/workspace/{workspaceId}/workspace/delete/teams/{teamId}
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';

/**
 * Standard API response for mutations
 */
interface StandardResponse {
  message?: string | null;
}

/**
 * Options for useDeleteTeam hook
 */
export interface UseDeleteTeamOptions {
  /**
   * React Query mutation options
   */
  mutationOptions?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>;
}

/**
 * Hook for deleting a workspace team
 *
 * @param workspaceId - Current workspace ID
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const deleteTeam = useDeleteTeam(workspaceId);
 *
 * const handleDelete = (teamId: string) => {
 *   deleteTeam.mutate(teamId);
 * };
 * ```
 */
export function useDeleteTeam(workspaceId: string, options?: UseDeleteTeamOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (teamId: string) => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/delete/teams/{teamId}
      await client.post<StandardResponse>(`/workspace/delete/teams/${teamId}`, {});
    },
    onSuccess: (_, teamId) => {
      // Invalidate teams list and specific team
      queryClient.invalidateQueries({ queryKey: ['workspace-teams', workspaceId] });
      queryClient.removeQueries({ queryKey: ['workspace-team', workspaceId, teamId] });
    },
    ...options?.mutationOptions,
  });
}
