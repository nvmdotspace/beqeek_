/**
 * Workspace Users Hooks
 *
 * Centralized exports for workspace user hooks and types
 */

export {
  useGetWorkspaceUsers,
  WORKSPACE_USERS_QUERY_PRESETS,
  type WorkspaceUser, // From @workspace/active-tables-core
  type WorkspaceUsersQueries,
  type GetWorkspaceUsersRequest,
  type UseGetWorkspaceUsersOptions,
} from './use-get-workspace-users';

export {
  useWorkspaceUsersWithPrefetch,
  type UseWorkspaceUsersWithPrefetchOptions,
} from './use-workspace-users-with-prefetch';

export {
  useUserMapping,
  useUserById,
  useUsersByIds,
  getUserName,
  getUserAvatar,
  getUsersByIds,
  hasUser,
} from './use-user-mapping';
