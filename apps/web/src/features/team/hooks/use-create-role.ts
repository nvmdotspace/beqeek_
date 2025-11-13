/**
 * Hook for creating a workspace team role
 *
 * API: POST /api/workspace/{workspaceId}/workspace/post/team_roles
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import type { RoleMutationRequest, RoleMutationResponse, WorkspaceTeamRole } from '../types/role';

/**
 * Options for useCreateRole hook
 */
export interface UseCreateRoleOptions {
  /**
   * React Query mutation options
   */
  mutationOptions?: Omit<UseMutationOptions<WorkspaceTeamRole, Error, RoleMutationRequest>, 'mutationFn'>;
}

/**
 * Hook for creating a workspace team role
 *
 * @param workspaceId - Current workspace ID
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const createRole = useCreateRole(workspaceId);
 *
 * const handleCreate = () => {
 *   createRole.mutate({
 *     constraints: {
 *       workspaceTeamId: 'team_123'
 *     },
 *     data: {
 *       roleName: 'Manager',
 *       roleDescription: 'Team manager role'
 *     }
 *   });
 * };
 * ```
 */
export function useCreateRole(workspaceId: string, options?: UseCreateRoleOptions) {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceTeamRole, Error, RoleMutationRequest>({
    mutationFn: async (request: RoleMutationRequest) => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/post/team_roles
      const response = await client.post<RoleMutationResponse>(
        '/workspace/post/team_roles',
        request as unknown as Record<string, unknown>,
      );

      if (!response.data.data) {
        throw new Error('No data returned from create role');
      }

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate roles list for the team
      queryClient.invalidateQueries({
        queryKey: ['workspace-team-roles', workspaceId, variables.constraints.workspaceTeamId],
      });
      // Also invalidate teams list as it may include role counts
      queryClient.invalidateQueries({ queryKey: ['workspace-teams', workspaceId] });
    },
    ...options?.mutationOptions,
  });
}
