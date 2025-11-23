import { useUserProfile } from './use-user-profile';
import { useCurrentWorkspaceUser } from '@/features/workspace-users/hooks/use-current-workspace-user';
import { useParams as useRouterParams } from '@tanstack/react-router';

/**
 * Unified hook to get the current user.
 * Automatically handles the fallback between Workspace User and Global User.
 *
 * Priority:
 * 1. Workspace User (if inside a workspace)
 * 2. Global User (fallback)
 */
export function useCurrentUser() {
  const { workspaceId } = useRouterParams({ strict: false });

  // 1. Always fetch Global User (as base/fallback)
  const globalProfile = useUserProfile();

  // 2. Fetch Workspace User if we have a workspaceId
  const workspaceProfile = useCurrentWorkspaceUser();

  // 3. Merge logic: Prefer Workspace User, fallback to Global User
  // Note: workspaceProfile.user can be null/undefined if loading or error
  const user = workspaceId && workspaceProfile.user ? workspaceProfile.user : globalProfile.data;

  return {
    // The main user object to display
    user,

    // Raw data sources if needed specific access
    globalUser: globalProfile.data,
    workspaceUser: workspaceProfile.user,

    // Meta
    isLoading: globalProfile.isLoading || (!!workspaceId && workspaceProfile.isLoading),
    error: globalProfile.error || workspaceProfile.error,
    isAuthenticated: !!globalProfile.data,
    workspaceId,
  };
}
