import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/http-client';

interface InviteUserRequest {
  workspaceId: string;
  workspaceTeamId: string;
  workspaceTeamRoleId: string;
  userId: string;
}

interface InviteUserResponse {
  message: string;
}

interface UseInviteUserOptions {
  mutationOptions?: Omit<UseMutationOptions<InviteUserResponse, Error, InviteUserRequest>, 'mutationFn'>;
}

/**
 * Hook to invite an existing user to a workspace with team and role assignment
 * Matches Blade PHP API: POST /workspace/{workspaceId}/workspace/post/invitations/bulk
 *
 * @param workspaceId - Workspace ID
 * @param options - Mutation options
 * @returns Mutation object
 */
export function useInviteUser(workspaceId: string, options?: UseInviteUserOptions) {
  const queryClient = useQueryClient();

  return useMutation<InviteUserResponse, Error, InviteUserRequest>({
    mutationFn: async (request: InviteUserRequest) => {
      // Match Blade PHP payload structure: { data: [{ workspaceTeamId, workspaceTeamRoleId, userId }] }
      const response = await apiClient.post<InviteUserResponse>(
        `/api/workspace/${workspaceId}/workspace/post/invitations/bulk`,
        {
          data: [
            {
              workspaceTeamId: request.workspaceTeamId,
              workspaceTeamRoleId: request.workspaceTeamRoleId,
              userId: request.userId,
            },
          ],
        },
      );
      return response.data;
    },
    ...options?.mutationOptions,
    // Merge onSuccess callbacks to ensure cache invalidation always runs
    onSuccess: (data, variables, context, meta) => {
      // Invalidate workspace users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'users'], exact: false });

      // Invalidate team members query
      queryClient.invalidateQueries({
        queryKey: ['workspace', workspaceId, 'team', variables.workspaceTeamId, 'members'],
        exact: false,
      });

      // Call user's onSuccess if provided (pass all 4 params)
      options?.mutationOptions?.onSuccess?.(data, variables, context, meta);
    },
  });
}
