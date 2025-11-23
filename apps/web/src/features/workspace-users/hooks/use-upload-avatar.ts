import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';

import { uploadTempFiles } from '../api/temp-files-api';
import { updateUserProfile, USER_PROFILE_QUERY_KEY } from '@/features/user';
import { workspaceQueryKey } from '@/features/workspace/hooks/use-workspaces';
import { WORKSPACE_USER_ME_QUERY_KEY } from './use-current-workspace-user';

interface UploadAvatarOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to upload avatar image
 * Two-step process:
 * 1. Upload file to temp storage
 * 2. Update profile with temp path (backend moves to permanent storage)
 */
export function useUploadAvatar(options?: UploadAvatarOptions) {
  const queryClient = useQueryClient();
  const { workspaceId } = useParams({ strict: false });

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Upload to temp storage
      const paths = await uploadTempFiles([file]);
      if (!paths.length) {
        throw new Error('Failed to upload file');
      }

      // Step 2: Update profile with temp path
      await updateUserProfile({ avatarUpload: paths[0] });

      return paths[0];
    },
    onSuccess: () => {
      // Invalidate all workspace-related queries to refresh avatar
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: WORKSPACE_USER_ME_QUERY_KEY(workspaceId) });
      }
      toast.success('Avatar updated successfully');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload avatar');
      options?.onError?.(error);
    },
  });
}
