/**
 * Hook for updating a workspace team role
 *
 * API: POST /api/workspace/{workspaceId}/workspace/patch/team_roles/{roleId}
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import type { RoleMutationRequest } from '../types/role';

/**
 * Mutation variables for updating a role
 */
export interface UpdateRoleVariables {
  roleId: string;
  request: RoleMutationRequest;
}

/**
 * Standard API response for mutations
 */
interface StandardResponse {
  message?: string | null;
}

/**
 * Options for useUpdateRole hook
 */
export interface UseUpdateRoleOptions {
  /**
   * React Query mutation options
   */
  mutationOptions?: Omit<UseMutationOptions<void, Error, UpdateRoleVariables>, 'mutationFn'>;
}

/**
 * Hook for updating a workspace team role
 *
 * @param workspaceId - Current workspace ID
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const updateRole = useUpdateRole(workspaceId);
 *
 * const handleUpdate = () => {
 *   updateRole.mutate({
 *     roleId: 'role_123',
 *     request: {
 *       constraints: {
 *         workspaceTeamId: 'team_123'
 *       },
 *       data: {
 *         roleName: 'Senior Manager',
 *         roleDescription: 'Updated description'
 *       }
 *     }
 *   });
 * };
 * ```
 */
export function useUpdateRole(workspaceId: string, options?: UseUpdateRoleOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateRoleVariables>({
    mutationFn: async ({ roleId, request }: UpdateRoleVariables) => {
      const client = createActiveTablesApiClient(workspaceId);

      // API: POST /api/workspace/{workspaceId}/workspace/patch/team_roles/{roleId}
      await client.post<StandardResponse>(
        `/workspace/patch/team_roles/${roleId}`,
        request as unknown as Record<string, unknown>,
      );
    },
    ...options?.mutationOptions,
    // Merge onSuccess callbacks to ensure cache invalidation always runs
    onSuccess: (data, variables, context) => {
      // Always invalidate cache first
      queryClient.invalidateQueries({
        queryKey: ['workspace-team-roles', workspaceId, variables.request.constraints.workspaceTeamId],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ['workspace-teams', workspaceId] });

      // Then call user's onSuccess if provided
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
  });
}
