/**
 * Type-safe query definitions for Workspace Users API
 *
 * API: POST /api/workspace/{workspaceId}/workspace/get/users
 *
 * Supports flexible field selection, filtering, pagination, and sorting
 */

/**
 * Workspace user fields that can be queried
 */
export type WorkspaceUserField =
  | 'id'
  | 'fullName'
  | 'avatar'
  | 'thumbnailAvatar'
  | 'email'
  | 'createdAt'
  | 'updatedAt'
  | 'globalUser{username}'
  | 'globalUser{email}'
  | 'workspaceMemberships{userId,workspaceTeamRoleId,workspaceTeamId,invitedAt}';

/**
 * Filtering options for workspace team roles
 */
export interface WorkspaceTeamRoleFiltering {
  /** Filter by workspace team ID */
  workspaceTeamId?: number;
  /** Filter by role ID */
  workspaceTeamRoleId?: number;
}

/**
 * Filtering configuration for workspace users
 */
export interface WorkspaceUsersFiltering {
  /** Filter by workspace team role */
  workspaceTeamRole?: WorkspaceTeamRoleFiltering;
}

/**
 * Sorting options for workspace users
 */
export interface WorkspaceUsersSorting {
  /** Field to sort by */
  field: 'fullName' | 'createdAt' | 'updatedAt';
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Query configuration for workspace users
 */
export interface WorkspaceUsersQueries {
  /**
   * Comma-separated list of fields to return
   * @example "id,fullName,avatar,globalUser{username}"
   */
  fields?: string;

  /** Filtering options */
  filtering?: WorkspaceUsersFiltering;

  /** Maximum number of records to return */
  limit?: number;

  /** Number of records to skip (for pagination) */
  offset?: number;

  /** Sorting configuration */
  sorting?: WorkspaceUsersSorting;
}

/**
 * Complete request body for workspace users API
 */
export interface GetWorkspaceUsersRequest {
  queries?: WorkspaceUsersQueries;
}

/**
 * Predefined query configurations for common use cases
 */
export const WORKSPACE_USERS_QUERY_PRESETS = {
  /**
   * Minimal fields for create/update record forms
   * Only fetches id and fullName for optimal performance
   */
  CREATE_RECORD_FORM: {
    fields: 'id,fullName',
    filtering: {},
  } satisfies WorkspaceUsersQueries,

  /**
   * Basic user info with avatar
   * Suitable for user lists and cards
   */
  BASIC_WITH_AVATAR: {
    fields: 'id,fullName,avatar,thumbnailAvatar',
    filtering: {},
  } satisfies WorkspaceUsersQueries,

  /**
   * Full user details with memberships
   * For admin panels and user management
   */
  FULL_DETAILS: {
    fields:
      'id,fullName,avatar,thumbnailAvatar,globalUser{username},workspaceMemberships{userId,workspaceTeamRoleId,workspaceTeamId,invitedAt},createdAt',
    filtering: {},
  } satisfies WorkspaceUsersQueries,

  /**
   * Username lookup only
   * Minimal data for mentions and autocomplete
   */
  USERNAME_ONLY: {
    fields: 'id,fullName,globalUser{username}',
    filtering: {},
    limit: 50,
  } satisfies WorkspaceUsersQueries,
} as const;

/**
 * Helper function to build workspace users query
 *
 * @param options - Query options or preset name
 * @returns Type-safe query object
 *
 * @example
 * ```ts
 * // Use preset
 * const query = buildWorkspaceUsersQuery('CREATE_RECORD_FORM');
 *
 * // Custom query
 * const query = buildWorkspaceUsersQuery({
 *   fields: 'id,fullName,avatar',
 *   limit: 20,
 *   filtering: {
 *     workspaceTeamRole: { workspaceTeamId: 123 }
 *   }
 * });
 * ```
 */
export function buildWorkspaceUsersQuery(
  options?: WorkspaceUsersQueries | keyof typeof WORKSPACE_USERS_QUERY_PRESETS,
): GetWorkspaceUsersRequest {
  if (!options) {
    return { queries: {} };
  }

  // Handle preset names
  if (typeof options === 'string') {
    return {
      queries: WORKSPACE_USERS_QUERY_PRESETS[options],
    };
  }

  // Handle custom queries
  return {
    queries: options,
  };
}
