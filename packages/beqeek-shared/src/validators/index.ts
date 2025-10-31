/**
 * Beqeek Shared Validators
 *
 * Validation helpers for Active Table configurations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  FieldType,
  QuickFilterValidFieldType,
  KanbanStatusValidFieldType,
  GanttDateValidFieldType,
  GanttProgressValidFieldType,
  GanttDependencyValidFieldType,
  ActionType,
  RecordListLayout,
  RecordDetailLayout,
  CommentsPosition,
  SortOrder,
} from '../constants/index.js';

import {
  ALL_FIELD_TYPES,
  TEXT_FIELD_TYPES,
  TIME_FIELD_TYPES,
  NUMBER_FIELD_TYPES,
  SELECTION_FIELD_TYPES,
  REFERENCE_FIELD_TYPES,
  FIELD_TYPES_WITH_OPTIONS,
  FIELD_TYPES_WITH_REFERENCE,
  QUICK_FILTER_VALID_FIELD_TYPES,
  KANBAN_STATUS_VALID_FIELD_TYPES,
  GANTT_DATE_VALID_FIELD_TYPES,
  GANTT_PROGRESS_VALID_FIELD_TYPES,
  GANTT_DEPENDENCY_VALID_FIELD_TYPES,
  ALL_ACTION_TYPES,
  SYSTEM_ACTION_TYPES,
  RECORD_ACTION_TYPES,
  COMMENT_ACTION_TYPES,
  ACTION_TYPE_CREATE,
  ACTION_TYPE_COMMENT_CREATE,
  ACTION_TYPE_COMMENT_ACCESS,
  ACTION_TYPE_COMMENT_UPDATE,
  ACTION_TYPE_COMMENT_DELETE,
  ACTION_TYPE_CUSTOM,
  CREATE_PERMISSIONS,
  RECORD_ACTION_PERMISSIONS,
  COMMENT_ACCESS_PERMISSIONS,
  COMMENT_MODIFY_PERMISSIONS,
  RECORD_LIST_LAYOUTS,
  RECORD_DETAIL_LAYOUTS,
  COMMENTS_POSITIONS,
  SORT_ORDERS,
} from '../constants/index.js';

// ============================================
// Field Type Validators
// ============================================

/**
 * Check if a value is a valid field type
 */
export function isValidFieldType(value: unknown): value is FieldType {
  return typeof value === 'string' && ALL_FIELD_TYPES.includes(value as FieldType);
}

/**
 * Check if field type is a text type
 */
export function isTextFieldType(fieldType: FieldType): boolean {
  return TEXT_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is a time type
 */
export function isTimeFieldType(fieldType: FieldType): boolean {
  return TIME_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is a number type
 */
export function isNumberFieldType(fieldType: FieldType): boolean {
  return NUMBER_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is a selection type
 */
export function isSelectionFieldType(fieldType: FieldType): boolean {
  return SELECTION_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is a reference type
 */
export function isReferenceFieldType(fieldType: FieldType): boolean {
  return REFERENCE_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type requires options property
 */
export function requiresOptions(fieldType: FieldType): boolean {
  return FIELD_TYPES_WITH_OPTIONS.includes(fieldType as any);
}

/**
 * Check if field type requires reference properties
 */
export function requiresReference(fieldType: FieldType): boolean {
  return FIELD_TYPES_WITH_REFERENCE.includes(fieldType as any);
}

/**
 * Check if field type is valid for Quick Filter
 */
export function isValidQuickFilterFieldType(fieldType: FieldType): fieldType is QuickFilterValidFieldType {
  return QUICK_FILTER_VALID_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is valid for Kanban status field
 */
export function isValidKanbanStatusFieldType(fieldType: FieldType): fieldType is KanbanStatusValidFieldType {
  return KANBAN_STATUS_VALID_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is valid for Gantt date fields
 */
export function isValidGanttDateFieldType(fieldType: FieldType): fieldType is GanttDateValidFieldType {
  return GANTT_DATE_VALID_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is valid for Gantt progress field
 */
export function isValidGanttProgressFieldType(fieldType: FieldType): fieldType is GanttProgressValidFieldType {
  return GANTT_PROGRESS_VALID_FIELD_TYPES.includes(fieldType as any);
}

/**
 * Check if field type is valid for Gantt dependency field
 */
export function isValidGanttDependencyFieldType(fieldType: FieldType): fieldType is GanttDependencyValidFieldType {
  return GANTT_DEPENDENCY_VALID_FIELD_TYPES.includes(fieldType as any);
}

// ============================================
// Action Type Validators
// ============================================

/**
 * Check if a value is a valid action type
 */
export function isValidActionType(value: unknown): value is ActionType {
  return typeof value === 'string' && ALL_ACTION_TYPES.includes(value as ActionType);
}

/**
 * Check if action type is a system action
 */
export function isSystemActionType(actionType: ActionType): boolean {
  return SYSTEM_ACTION_TYPES.includes(actionType as any);
}

/**
 * Check if action type is a record action
 */
export function isRecordActionType(actionType: ActionType): boolean {
  return RECORD_ACTION_TYPES.includes(actionType as any);
}

/**
 * Check if action type is a comment action
 */
export function isCommentActionType(actionType: ActionType): boolean {
  return COMMENT_ACTION_TYPES.includes(actionType as any);
}

/**
 * Check if action type is custom
 */
export function isCustomActionType(actionType: ActionType): boolean {
  return actionType === ACTION_TYPE_CUSTOM;
}

// ============================================
// Permission Validators
// ============================================

/**
 * Get valid permissions for an action type
 */
export function getValidPermissionsForActionType(actionType: ActionType): readonly string[] {
  if (actionType === ACTION_TYPE_CREATE) {
    return CREATE_PERMISSIONS;
  }

  if (actionType === ACTION_TYPE_COMMENT_CREATE) {
    return RECORD_ACTION_PERMISSIONS;
  }

  if (actionType === ACTION_TYPE_COMMENT_ACCESS) {
    return COMMENT_ACCESS_PERMISSIONS;
  }

  if (actionType === ACTION_TYPE_COMMENT_UPDATE || actionType === ACTION_TYPE_COMMENT_DELETE) {
    return COMMENT_MODIFY_PERMISSIONS;
  }

  // For access, update, delete, custom
  return RECORD_ACTION_PERMISSIONS;
}

/**
 * Check if a permission is valid for a given action type
 */
export function isValidPermissionForActionType(permission: string, actionType: ActionType): boolean {
  const validPermissions = getValidPermissionsForActionType(actionType);
  return validPermissions.includes(permission);
}

// ============================================
// Layout Validators
// ============================================

/**
 * Check if a value is a valid record list layout
 */
export function isValidRecordListLayout(value: unknown): value is RecordListLayout {
  return typeof value === 'string' && RECORD_LIST_LAYOUTS.includes(value as RecordListLayout);
}

/**
 * Check if a value is a valid record detail layout
 */
export function isValidRecordDetailLayout(value: unknown): value is RecordDetailLayout {
  return typeof value === 'string' && RECORD_DETAIL_LAYOUTS.includes(value as RecordDetailLayout);
}

/**
 * Check if a value is a valid comments position
 */
export function isValidCommentsPosition(value: unknown): value is CommentsPosition {
  return typeof value === 'string' && COMMENTS_POSITIONS.includes(value as CommentsPosition);
}

/**
 * Check if a value is a valid sort order
 */
export function isValidSortOrder(value: unknown): value is SortOrder {
  return typeof value === 'string' && SORT_ORDERS.includes(value as SortOrder);
}

// ============================================
// Table Type Validators
// ============================================

export * from './table-type-validators.js';
