import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/http-client';
import type { ActiveTableRecord } from '../types';
import type { FieldConfig } from '@workspace/active-tables-core';

/**
 * Workspace user interface
 */
export interface WorkspaceUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

/**
 * Hook to resolve workspace user fields (SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER)
 * Batch fetches user data for all user IDs in the records
 *
 * @param workspaceId - Current workspace ID
 * @param records - Records containing user field values
 * @param fields - Field configurations to identify user fields
 * @param enabled - Whether to enable the query
 */
export function useWorkspaceUserData(
  workspaceId: string,
  records: ActiveTableRecord[],
  fields: FieldConfig[],
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ['workspace-users', workspaceId, records.map((r) => r.id).join(',')],
    queryFn: async () => {
      // Step 1: Identify user fields
      const userFields = fields.filter(
        (f) => f.type === 'SELECT_ONE_WORKSPACE_USER' || f.type === 'SELECT_LIST_WORKSPACE_USER',
      );

      if (userFields.length === 0) {
        return {};
      }

      // Step 2: Collect all unique user IDs
      const userIds = new Set<string>();

      records.forEach((record) => {
        userFields.forEach((field) => {
          const value = record.record[field.name];

          if (!value) return;

          // Handle SELECT_ONE_WORKSPACE_USER (single user ID)
          if (field.type === 'SELECT_ONE_WORKSPACE_USER' && typeof value === 'string') {
            userIds.add(value);
          }

          // Handle SELECT_LIST_WORKSPACE_USER (array of user IDs)
          if (field.type === 'SELECT_LIST_WORKSPACE_USER' && Array.isArray(value)) {
            value.forEach((id) => {
              if (typeof id === 'string') {
                userIds.add(id);
              }
            });
          }
        });
      });

      if (userIds.size === 0) {
        return {};
      }

      // Step 3: Batch fetch user data
      const response = await apiRequest<{ data: WorkspaceUser[] }>({
        url: `/api/workspace/${workspaceId}/workflow/get/workspace_users`,
        method: 'POST',
        data: {
          user_ids: Array.from(userIds),
        },
      });

      // Step 4: Build lookup map: userId -> user
      const userDataMap: Record<string, WorkspaceUser> = {};

      response.data.forEach((user) => {
        userDataMap[user.id] = user;
      });

      return userDataMap;
    },
    enabled: enabled && records.length > 0 && fields.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes cache (users change less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  });
}

/**
 * Helper to get display value for a workspace user field
 *
 * @param userId - User ID to look up
 * @param userData - Data from useWorkspaceUserData
 * @param displayFormat - Format: 'name' | 'email' | 'name+email' (default: 'name')
 */
export function getUserDisplayValue(
  userId: string,
  userData: Record<string, WorkspaceUser> | undefined,
  displayFormat: 'name' | 'email' | 'name+email' = 'name',
): string {
  if (!userData || !userData[userId]) {
    return userId; // Fallback to ID if not found
  }

  const user = userData[userId];

  switch (displayFormat) {
    case 'name':
      return user.name || user.email;
    case 'email':
      return user.email;
    case 'name+email':
      return user.name ? `${user.name} (${user.email})` : user.email;
    default:
      return user.name || user.email;
  }
}

/**
 * Helper to get user avatar URL
 *
 * @param userId - User ID to look up
 * @param userData - Data from useWorkspaceUserData
 */
export function getUserAvatar(userId: string, userData: Record<string, WorkspaceUser> | undefined): string | undefined {
  if (!userData || !userData[userId]) {
    return undefined;
  }

  return userData[userId].avatar;
}
