/**
 * Active Table Action Type Constants
 * Based on active-table-config-functional-spec.md Section 2.3
 */

// ============================================
// System Action Types
// ============================================

/**
 * Create action - Opens form to create a new record
 */
export const ACTION_TYPE_CREATE = 'create' as const;

/**
 * Access action - Navigate to record detail view
 */
export const ACTION_TYPE_ACCESS = 'access' as const;

/**
 * Update action - Opens form to edit existing record
 */
export const ACTION_TYPE_UPDATE = 'update' as const;

/**
 * Delete action - Triggers record deletion flow (with confirmation)
 */
export const ACTION_TYPE_DELETE = 'delete' as const;

/**
 * Comment create action - Create a new comment on a record
 */
export const ACTION_TYPE_COMMENT_CREATE = 'comment_create' as const;

/**
 * Comment access action - View comments on a record
 */
export const ACTION_TYPE_COMMENT_ACCESS = 'comment_access' as const;

/**
 * Comment update action - Edit an existing comment
 */
export const ACTION_TYPE_COMMENT_UPDATE = 'comment_update' as const;

/**
 * Comment delete action - Delete a comment
 */
export const ACTION_TYPE_COMMENT_DELETE = 'comment_delete' as const;

// ============================================
// Custom Action Type
// ============================================

/**
 * Custom action - User-defined action for custom business logic
 *
 * Frontend sends event to backend with actionId and recordId.
 * Backend executes business logic based on actionId.
 *
 * Examples:
 * - "Send email notification"
 * - "Change status to Approved"
 * - "Sync with external system"
 */
export const ACTION_TYPE_CUSTOM = 'custom' as const;

// ============================================
// Action Type Groups
// ============================================

/**
 * Record CRUD actions
 */
export const RECORD_ACTION_TYPES = [
  ACTION_TYPE_CREATE,
  ACTION_TYPE_ACCESS,
  ACTION_TYPE_UPDATE,
  ACTION_TYPE_DELETE,
] as const;

/**
 * Comment CRUD actions
 */
export const COMMENT_ACTION_TYPES = [
  ACTION_TYPE_COMMENT_CREATE,
  ACTION_TYPE_COMMENT_ACCESS,
  ACTION_TYPE_COMMENT_UPDATE,
  ACTION_TYPE_COMMENT_DELETE,
] as const;

/**
 * System-defined actions (all predefined behaviors)
 */
export const SYSTEM_ACTION_TYPES = [
  ...RECORD_ACTION_TYPES,
  ...COMMENT_ACTION_TYPES,
] as const;

/**
 * All action types
 */
export const ALL_ACTION_TYPES = [
  ...SYSTEM_ACTION_TYPES,
  ACTION_TYPE_CUSTOM,
] as const;

// ============================================
// Type Definitions
// ============================================

export type RecordActionType = (typeof RECORD_ACTION_TYPES)[number];
export type CommentActionType = (typeof COMMENT_ACTION_TYPES)[number];
export type SystemActionType = (typeof SYSTEM_ACTION_TYPES)[number];
export type ActionType = (typeof ALL_ACTION_TYPES)[number];
