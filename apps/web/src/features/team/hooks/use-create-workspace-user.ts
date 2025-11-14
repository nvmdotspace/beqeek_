import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/http-client';

interface CreateWorkspaceUserRequest {
  constraints: {
    workspaceId: string;
    workspaceTeamId?: string;
    workspaceTeamRoleId?: string;
  };
  data: {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
  };
}

interface CreateWorkspaceUserResponse {
  id: string;
  userId: string;
  workspaceId: string;
  workspaceTeamId?: string;
  workspaceTeamRoleId?: string;
  user: {
    id: string;
    username: string;
    email?: string;
    fullName?: string;
  };
  message: string;
}

interface UseCreateWorkspaceUserOptions {
  mutationOptions?: Omit<
    UseMutationOptions<CreateWorkspaceUserResponse, Error, CreateWorkspaceUserRequest>,
    'mutationFn'
  >;
}

/**
 * Hook to create a new user and add them to a workspace with optional team and role assignment
 *
 * @param workspaceId - Workspace ID
 * @param options - Mutation options
 * @returns Mutation object
 */
export function useCreateWorkspaceUser(workspaceId: string, options?: UseCreateWorkspaceUserOptions) {
  const queryClient = useQueryClient();

  return useMutation<CreateWorkspaceUserResponse, Error, CreateWorkspaceUserRequest>({
    mutationFn: async (request: CreateWorkspaceUserRequest) => {
      const response = await apiClient.post<CreateWorkspaceUserResponse>(
        `/api/workspace/${workspaceId}/create/workspace_users`,
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
