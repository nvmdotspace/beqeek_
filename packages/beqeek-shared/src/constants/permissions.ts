/**
 * Active Table Permission Constants
 * Based on active-table-config-functional-spec.md Section 2.9
 *
 * Permission values vary by action type. This file organizes them
 * according to the specification.
 */

// ============================================
// Common Permission Values
// ============================================

/**
 * Deny permission
 */
export const PERMISSION_NOT_ALLOWED = 'not_allowed' as const;

/**
 * Allow without restrictions
 */
export const PERMISSION_ALLOWED = 'allowed' as const;

/**
 * Allow on all records/comments
 */
export const PERMISSION_ALL = 'all' as const;

// ============================================
// Create Action Permissions (Section 2.9.3.a)
// ============================================

/**
 * Permissions for action type = 'create'
 * Only two options: can create or cannot create
 */
export const CREATE_PERMISSIONS = [PERMISSION_NOT_ALLOWED, PERMISSION_ALLOWED] as const;

export type CreatePermission = (typeof CREATE_PERMISSIONS)[number];

// ============================================
// Record Action Permissions (Section 2.9.3.b)
// ============================================

/**
 * Permissions for action types: access, update, delete, custom
 * Most diverse permission group with ownership and time-based controls
 */

// Self-created permissions
export const PERMISSION_SELF_CREATED = 'self_created' as const;
export const PERMISSION_SELF_CREATED_2H = 'self_created_2h' as const;
export const PERMISSION_SELF_CREATED_12H = 'self_created_12h' as const;
export const PERMISSION_SELF_CREATED_24H = 'self_created_24h' as const;

// Assignment-based permissions
export const PERMISSION_ASSIGNED_USER = 'assigned_user' as const;
export const PERMISSION_RELATED_USER = 'related_user' as const;
export const PERMISSION_SELF_CREATED_OR_ASSIGNED = 'self_created_or_assigned' as const;
export const PERMISSION_SELF_CREATED_OR_RELATED = 'self_created_or_related' as const;

// Team-based permissions
export const PERMISSION_CREATED_BY_TEAM = 'created_by_team' as const;
export const PERMISSION_CREATED_BY_TEAM_2H = 'created_by_team_2h' as const;
export const PERMISSION_CREATED_BY_TEAM_12H = 'created_by_team_12h' as const;
export const PERMISSION_CREATED_BY_TEAM_24H = 'created_by_team_24h' as const;
export const PERMISSION_CREATED_BY_TEAM_48H = 'created_by_team_48h' as const;
export const PERMISSION_CREATED_BY_TEAM_72H = 'created_by_team_72h' as const;

// Team assignment-based permissions
export const PERMISSION_ASSIGNED_TEAM_MEMBER = 'assigned_team_member' as const;
export const PERMISSION_RELATED_TEAM_MEMBER = 'related_team_member' as const;
export const PERMISSION_CREATED_OR_ASSIGNED_TEAM_MEMBER = 'created_or_assigned_team_member' as const;
export const PERMISSION_CREATED_OR_RELATED_TEAM_MEMBER = 'created_or_related_team_member' as const;

export const RECORD_ACTION_PERMISSIONS = [
  PERMISSION_NOT_ALLOWED,
  PERMISSION_ALL,
  PERMISSION_SELF_CREATED,
  PERMISSION_SELF_CREATED_2H,
  PERMISSION_SELF_CREATED_12H,
  PERMISSION_SELF_CREATED_24H,
  PERMISSION_ASSIGNED_USER,
  PERMISSION_RELATED_USER,
  PERMISSION_SELF_CREATED_OR_ASSIGNED,
  PERMISSION_SELF_CREATED_OR_RELATED,
  PERMISSION_CREATED_BY_TEAM,
  PERMISSION_CREATED_BY_TEAM_2H,
  PERMISSION_CREATED_BY_TEAM_12H,
  PERMISSION_CREATED_BY_TEAM_24H,
  PERMISSION_CREATED_BY_TEAM_48H,
  PERMISSION_CREATED_BY_TEAM_72H,
  PERMISSION_ASSIGNED_TEAM_MEMBER,
  PERMISSION_RELATED_TEAM_MEMBER,
  PERMISSION_CREATED_OR_ASSIGNED_TEAM_MEMBER,
  PERMISSION_CREATED_OR_RELATED_TEAM_MEMBER,
] as const;

export type RecordActionPermission = (typeof RECORD_ACTION_PERMISSIONS)[number];

// ============================================
// Comment Create Permissions (Section 2.9.3.c)
// ============================================

/**
 * Permissions for action type = 'comment_create'
 * Same as record action permissions but applies to "on which records can create comment"
 */
export const COMMENT_CREATE_PERMISSIONS = RECORD_ACTION_PERMISSIONS;
export type CommentCreatePermission = RecordActionPermission;

// ============================================
// Comment Access Permissions (Section 2.9.3.d)
// ============================================

/**
 * Permissions for action type = 'comment_access'
 * Controls viewing comments
 */
export const PERMISSION_COMMENT_SELF_CREATED = 'comment_self_created' as const;
export const PERMISSION_COMMENT_SELF_CREATED_OR_TAGGED = 'comment_self_created_or_tagged' as const;
export const PERMISSION_COMMENT_CREATED_BY_TEAM = 'comment_created_by_team' as const;
export const PERMISSION_COMMENT_CREATED_OR_TAGGED_TEAM_MEMBER = 'comment_created_or_tagged_team_member' as const;

export const COMMENT_ACCESS_PERMISSIONS = [
  PERMISSION_NOT_ALLOWED,
  PERMISSION_ALL,
  PERMISSION_COMMENT_SELF_CREATED,
  PERMISSION_COMMENT_SELF_CREATED_OR_TAGGED,
  PERMISSION_COMMENT_CREATED_BY_TEAM,
  PERMISSION_COMMENT_CREATED_OR_TAGGED_TEAM_MEMBER,
] as const;

export type CommentAccessPermission = (typeof COMMENT_ACCESS_PERMISSIONS)[number];

// ============================================
// Comment Update/Delete Permissions (Section 2.9.3.e)
// ============================================

/**
 * Permissions for action types: comment_update, comment_delete
 * Usually restricted by time
 */
export const PERMISSION_COMMENT_SELF_CREATED_2H = 'comment_self_created_2h' as const;
export const PERMISSION_COMMENT_SELF_CREATED_12H = 'comment_self_created_12h' as const;
export const PERMISSION_COMMENT_SELF_CREATED_24H = 'comment_self_created_24h' as const;
export const PERMISSION_COMMENT_CREATED_BY_TEAM_2H = 'comment_created_by_team_2h' as const;
export const PERMISSION_COMMENT_CREATED_BY_TEAM_12H = 'comment_created_by_team_12h' as const;
export const PERMISSION_COMMENT_CREATED_BY_TEAM_24H = 'comment_created_by_team_24h' as const;

export const COMMENT_MODIFY_PERMISSIONS = [
  PERMISSION_NOT_ALLOWED,
  PERMISSION_ALL,
  PERMISSION_COMMENT_SELF_CREATED,
  PERMISSION_COMMENT_SELF_CREATED_2H,
  PERMISSION_COMMENT_SELF_CREATED_12H,
  PERMISSION_COMMENT_SELF_CREATED_24H,
  PERMISSION_COMMENT_CREATED_BY_TEAM,
  PERMISSION_COMMENT_CREATED_BY_TEAM_2H,
  PERMISSION_COMMENT_CREATED_BY_TEAM_12H,
  PERMISSION_COMMENT_CREATED_BY_TEAM_24H,
] as const;

export type CommentModifyPermission = (typeof COMMENT_MODIFY_PERMISSIONS)[number];

// ============================================
// All Permissions
// ============================================

/**
 * Union of all possible permission values
 */
export const ALL_PERMISSIONS = [
  ...new Set([
    ...CREATE_PERMISSIONS,
    ...RECORD_ACTION_PERMISSIONS,
    ...COMMENT_ACCESS_PERMISSIONS,
    ...COMMENT_MODIFY_PERMISSIONS,
  ]),
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];
