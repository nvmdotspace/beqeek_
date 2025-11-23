import { apiRequest } from '@/shared/api/http-client';
import type { StandardResponse, User } from '@/shared/api/types';

/**
 * Get current user details in a workspace
 */
export const getWorkspaceUserMe = (workspaceId: string) =>
  apiRequest<StandardResponse<User>>({
    url: `/api/workspace/${workspaceId}/workspace/get/me`,
    method: 'POST',
    data: {
      queries: {
        fields:
          'id,fullName,avatar,thumbnailAvatar,email,phone,phoneCountryCode,globalUser{username},workspaceMemberships{userId,workspaceTeamRoleId,workspaceTeamId,invitedAt},createdAt,updatedAt',
      },
    },
  });
