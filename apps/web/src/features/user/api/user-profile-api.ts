import { apiRequest } from '@/shared/api/http-client';
import type { StandardResponse, User } from '@/shared/api/types';

export interface UpdateUserProfileData {
  fullName?: string;
  email?: string;
  password?: string;
  avatarUpload?: string; // temp file path from avatar upload
}

/**
 * Update global user profile
 * Note: Only global user fields are editable, workspace user fields are read-only
 */
export const updateUserProfile = (data: UpdateUserProfileData) =>
  apiRequest<StandardResponse<User>>({
    url: '/api/user/patch/me',
    method: 'POST',
    data: { data },
  });

/**
 * Get current user profile
 */
export const getCurrentUser = () =>
  apiRequest<StandardResponse<User>>({
    url: '/api/user/get/me',
    method: 'POST',
  });
