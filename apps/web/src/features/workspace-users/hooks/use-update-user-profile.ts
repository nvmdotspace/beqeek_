import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateUserProfile, type UpdateUserProfileData, USER_PROFILE_QUERY_KEY } from '@/features/user';

import { workspaceQueryKey } from '@/features/workspace/hooks/use-workspaces';
import { WORKSPACE_USER_ME_QUERY_KEY } from './use-current-workspace-user';
import { useParams } from '@tanstack/react-router';

/**
 * Hook to update global user profile
 * Invalidates workspace queries to refresh myWorkspaceUser data
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { workspaceId } = useParams({ strict: false });

  return useMutation({
    mutationFn: (data: UpdateUserProfileData) => updateUserProfile(data),
    onSuccess: () => {
      // Invalidate all workspace-related queries to refresh myWorkspaceUser
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: WORKSPACE_USER_ME_QUERY_KEY(workspaceId) });
      }
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
