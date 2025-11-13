/**
 * Hook for deleting a workspace team role
 *
 * API: POST /api/workspace/{workspaceId}/workspace/delete/team_roles/{roleId}
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import type { RoleDeleteRequest } from '../types/role';

/**
 * Mutation variables for deleting a role
 */
export interface DeleteRoleVariables {
  roleId: string;
  request: RoleDeleteRequest;
}

/**
 * Standard API response for mutations
 */
interface StandardResponse {
  message?: string | null;
}

/**
 * Options for useDeleteRole hook
 */
export interface UseDeleteRoleOptions {
  /**
   * React Query mutation options
   */
  mutationOptions?: Omit<UseMutationOptions<void, Error, DeleteRoleVariables>, 'mutationFn'>;
}

/**
 * Hook for deleting a workspace team role
 *
 * @param workspaceId - Current workspace ID
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const deleteRole = useDeleteRole(workspaceId);
 *
 * const handleDelete = (roleId: string, teamId: string) => {
 *   deleteRole.mutate({
 *     roleId,
 *     request: {
 *       constraints: {
 *         workspaceTeamId: teamId
 *       }
 *     }
 *   });
 * };
 * ```
 */
export function useDeleteRole(workspaceId: string, options?: UseDeleteRoleOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteRoleVariables>({
    mutationFn: async ({ roleId, request }: DeleteRoleVariables) => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/delete/team_roles/{roleId}
      await client.post<StandardResponse>(
        `/workspace/delete/team_roles/${roleId}`,
        request as unknown as Record<string, unknown>,
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate roles list for the team
      queryClient.invalidateQueries({
        queryKey: ['workspace-team-roles', workspaceId, variables.request.constraints.workspaceTeamId],
      });
      // Also invalidate teams list as it may include role data
      queryClient.invalidateQueries({ queryKey: ['workspace-teams', workspaceId] });
    },
    ...options?.mutationOptions,
  });
}
