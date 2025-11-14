import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/http-client';

interface InviteUserRequest {
  constraints: {
    workspaceId: string;
    workspaceTeamId?: string;
    workspaceTeamRoleId?: string;
  };
  data: {
    username: string;
  };
}

interface InviteUserResponse {
  id: string;
  userId: string;
  workspaceId: string;
  workspaceTeamId?: string;
  workspaceTeamRoleId?: string;
  message: string;
}

interface UseInviteUserOptions {
  mutationOptions?: Omit<UseMutationOptions<InviteUserResponse, Error, InviteUserRequest>, 'mutationFn'>;
}

/**
 * Hook to invite an existing user to a workspace with optional team and role assignment
 *
 * @param workspaceId - Workspace ID
 * @param options - Mutation options
 * @returns Mutation object
 */
export function useInviteUser(workspaceId: string, options?: UseInviteUserOptions) {
  const queryClient = useQueryClient();

  return useMutation<InviteUserResponse, Error, InviteUserRequest>({
    mutationFn: async (request: InviteUserRequest) => {
      const response = await apiClient.post<InviteUserResponse>(
        `/api/workspace/${workspaceId}/set/workspace_users`,
        request,
      );
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate workspace users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'users'] });

      // If assigned to a team, invalidate team members query
      if (variables.constraints.workspaceTeamId) {
        queryClient.invalidateQueries({
          queryKey: ['workspace', workspaceId, 'team', variables.constraints.workspaceTeamId, 'members'],
        });
      }

      // Call user's onSuccess if provided
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    ...options?.mutationOptions,
  });
}
