/**
 * User mapping utilities for fast user lookups by ID
 *
 * Provides O(1) user lookups using a Map data structure, avoiding
 * O(n) array.find() operations in components.
 *
 * @see docs/plans/20251110-workspace-users-caching-optimization-plan.md
 */

import { useMemo } from 'react';
import type { WorkspaceUser } from '@workspace/active-tables-core';

/**
 * Create a Map for O(1) user lookups by ID
 *
 * @param users - Array of workspace users
 * @returns Map of user ID to WorkspaceUser
 *
 * @example
 * ```tsx
 * const users = [
 *   { id: 'user_1', name: 'John Doe', avatar: 'https://...' },
 *   { id: 'user_2', name: 'Jane Smith', avatar: 'https://...' }
 * ];
 *
 * const userMap = useUserMapping(users);
 *
 * // O(1) lookup instead of O(n) array.find()
 * const user = userMap.get('user_1');
 * console.log(user?.name); // 'John Doe'
 * ```
 */
export function useUserMapping(users: WorkspaceUser[] | undefined): Map<string, WorkspaceUser> {
  return useMemo(() => {
    const map = new Map<string, WorkspaceUser>();

    if (!users) {
      return map;
    }

    for (const user of users) {
      map.set(user.id, user);
    }

    console.log('[useUserMapping] Created user map:', {
      size: map.size,
    });

    return map;
  }, [users]);
}

/**
 * Get user name by ID with fallback
 *
 * @param userId - User ID to lookup
 * @param userMap - Map created by useUserMapping
 * @param fallback - Fallback text if user not found
 * @returns User name or fallback text
 *
 * @example
 * ```tsx
 * const userMap = useUserMapping(users);
 * const userName = getUserName('user_1', userMap, 'Unknown User');
 * // Returns: 'John Doe' or 'Unknown User' if not found
 * ```
 */
export function getUserName(userId: string, userMap: Map<string, WorkspaceUser>, fallback = 'Unknown User'): string {
  return userMap.get(userId)?.name ?? fallback;
}

/**
 * Get user avatar URL by ID
 *
 * @param userId - User ID to lookup
 * @param userMap - Map created by useUserMapping
 * @returns User avatar URL or undefined
 *
 * @example
 * ```tsx
 * const userMap = useUserMapping(users);
 * const avatar = getUserAvatar('user_1', userMap);
 * // Returns: 'https://...' or undefined
 * ```
 */
export function getUserAvatar(userId: string, userMap: Map<string, WorkspaceUser>): string | undefined {
  return userMap.get(userId)?.avatar;
}

/**
 * Get multiple users by IDs
 *
 * @param userIds - Array of user IDs
 * @param userMap - Map created by useUserMapping
 * @returns Array of WorkspaceUser objects (skips users not found)
 *
 * @example
 * ```tsx
 * const userMap = useUserMapping(users);
 * const selectedUsers = getUsersByIds(['user_1', 'user_2', 'user_999'], userMap);
 * // Returns: [{ id: 'user_1', ... }, { id: 'user_2', ... }]
 * // user_999 is skipped if not found
 * ```
 */
export function getUsersByIds(userIds: string[], userMap: Map<string, WorkspaceUser>): WorkspaceUser[] {
  const users: WorkspaceUser[] = [];

  for (const userId of userIds) {
    const user = userMap.get(userId);
    if (user) {
      users.push(user);
    }
  }

  return users;
}

/**
 * Check if a user exists in the map
 *
 * @param userId - User ID to check
 * @param userMap - Map created by useUserMapping
 * @returns true if user exists
 *
 * @example
 * ```tsx
 * const userMap = useUserMapping(users);
 * const exists = hasUser('user_1', userMap);
 * // Returns: true or false
 * ```
 */
export function hasUser(userId: string, userMap: Map<string, WorkspaceUser>): boolean {
  return userMap.has(userId);
}

/**
 * Hook for getting a single user by ID
 *
 * Convenience hook that combines useUserMapping with a single user lookup.
 *
 * @param userId - User ID to lookup
 * @param users - Array of workspace users
 * @returns WorkspaceUser or undefined
 *
 * @example
 * ```tsx
 * const { data: users } = useGetWorkspaceUsers(workspaceId);
 * const user = useUserById('user_1', users);
 * console.log(user?.name); // 'John Doe' or undefined
 * ```
 */
export function useUserById(userId: string | undefined, users: WorkspaceUser[] | undefined): WorkspaceUser | undefined {
  const userMap = useUserMapping(users);

  return useMemo(() => {
    if (!userId) {
      return undefined;
    }
    return userMap.get(userId);
  }, [userId, userMap]);
}

/**
 * Hook for getting multiple users by IDs
 *
 * Convenience hook that combines useUserMapping with multiple user lookups.
 *
 * @param userIds - Array of user IDs
 * @param users - Array of workspace users
 * @returns Array of WorkspaceUser objects
 *
 * @example
 * ```tsx
 * const { data: users } = useGetWorkspaceUsers(workspaceId);
 * const selectedUsers = useUsersByIds(['user_1', 'user_2'], users);
 * // Returns: [{ id: 'user_1', ... }, { id: 'user_2', ... }]
 * ```
 */
export function useUsersByIds(userIds: string[] | undefined, users: WorkspaceUser[] | undefined): WorkspaceUser[] {
  const userMap = useUserMapping(users);

  return useMemo(() => {
    if (!userIds || userIds.length === 0) {
      return [];
    }
    return getUsersByIds(userIds, userMap);
  }, [userIds, userMap]);
}
