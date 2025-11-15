import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/http-client';

interface CreateWorkspaceUserRequest {
  workspaceId: string;
  workspaceTeamId: string;
  workspaceTeamRoleId: string;
  username: string;
  password: string;
  email?: string;
  fullName?: string;
}

interface CreateWorkspaceUserResponse {
  message: string;
  data: {
    id: string;
  };
}

interface UseCreateWorkspaceUserOptions {
  mutationOptions?: Omit<
    UseMutationOptions<CreateWorkspaceUserResponse, Error, CreateWorkspaceUserRequest>,
    'mutationFn'
  >;
}

/**
 * Hook to create a new user and add them to a workspace with team and role assignment
 * Matches Blade PHP API: POST /workspace/{workspaceId}/workspace/post/users
 *
 * @param workspaceId - Workspace ID
 * @param options - Mutation options
 * @returns Mutation object
 */
export function useCreateWorkspaceUser(workspaceId: string, options?: UseCreateWorkspaceUserOptions) {
  const queryClient = useQueryClient();

  return useMutation<CreateWorkspaceUserResponse, Error, CreateWorkspaceUserRequest>({
    mutationFn: async (request: CreateWorkspaceUserRequest) => {
      // Match Blade PHP payload structure:
      // { constraints: { workspaceTeamId, workspaceTeamRoleId }, data: { username, password, email, fullName } }
      const response = await apiClient.post<CreateWorkspaceUserResponse>(
        `/api/workspace/${workspaceId}/workspace/post/users`,
        {
          constraints: {
            workspaceTeamId: request.workspaceTeamId,
            workspaceTeamRoleId: request.workspaceTeamRoleId,
          },
          data: {
            username: request.username,
            password: request.password,
            email: request.email,
            fullName: request.fullName,
          },
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
