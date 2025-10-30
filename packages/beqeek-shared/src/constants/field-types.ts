/**
 * Active Table Field Type Constants
 * Based on active-table-config-functional-spec.md
 */

// ============================================
// Field Type Constants
// ============================================

/**
 * Text field types
 */
export const FIELD_TYPE_SHORT_TEXT = 'SHORT_TEXT' as const;
export const FIELD_TYPE_TEXT = 'TEXT' as const;
export const FIELD_TYPE_RICH_TEXT = 'RICH_TEXT' as const;
export const FIELD_TYPE_EMAIL = 'EMAIL' as const;
export const FIELD_TYPE_URL = 'URL' as const;

/**
 * Time field types
 */
export const FIELD_TYPE_DATE = 'DATE' as const;
export const FIELD_TYPE_DATETIME = 'DATETIME' as const;
export const FIELD_TYPE_TIME = 'TIME' as const;
export const FIELD_TYPE_YEAR = 'YEAR' as const;
export const FIELD_TYPE_MONTH = 'MONTH' as const;
export const FIELD_TYPE_DAY = 'DAY' as const;
export const FIELD_TYPE_HOUR = 'HOUR' as const;
export const FIELD_TYPE_MINUTE = 'MINUTE' as const;
export const FIELD_TYPE_SECOND = 'SECOND' as const;

/**
 * Number field types
 */
export const FIELD_TYPE_INTEGER = 'INTEGER' as const;
export const FIELD_TYPE_NUMERIC = 'NUMERIC' as const;

/**
 * Selection field types
 */
export const FIELD_TYPE_CHECKBOX_YES_NO = 'CHECKBOX_YES_NO' as const;
export const FIELD_TYPE_CHECKBOX_ONE = 'CHECKBOX_ONE' as const;
export const FIELD_TYPE_CHECKBOX_LIST = 'CHECKBOX_LIST' as const;
export const FIELD_TYPE_SELECT_ONE = 'SELECT_ONE' as const;
export const FIELD_TYPE_SELECT_LIST = 'SELECT_LIST' as const;

/**
 * Reference field types
 */
export const FIELD_TYPE_SELECT_ONE_RECORD = 'SELECT_ONE_RECORD' as const;
export const FIELD_TYPE_SELECT_LIST_RECORD = 'SELECT_LIST_RECORD' as const;
export const FIELD_TYPE_SELECT_ONE_WORKSPACE_USER = 'SELECT_ONE_WORKSPACE_USER' as const;
export const FIELD_TYPE_SELECT_LIST_WORKSPACE_USER = 'SELECT_LIST_WORKSPACE_USER' as const;
export const FIELD_TYPE_FIRST_REFERENCE_RECORD = 'FIRST_REFERENCE_RECORD' as const;

// ============================================
// Field Type Groups
// ============================================

/**
 * Text field types group
 */
export const TEXT_FIELD_TYPES = [
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
] as const;

/**
 * Time field types group
 */
export const TIME_FIELD_TYPES = [
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
] as const;

/**
 * Number field types group
 */
export const NUMBER_FIELD_TYPES = [
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
] as const;

/**
 * Selection field types group
 */
export const SELECTION_FIELD_TYPES = [
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
] as const;

/**
 * Reference field types group
 */
export const REFERENCE_FIELD_TYPES = [
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
] as const;

/**
 * All field types
 */
export const ALL_FIELD_TYPES = [
  ...TEXT_FIELD_TYPES,
  ...TIME_FIELD_TYPES,
  ...NUMBER_FIELD_TYPES,
  ...SELECTION_FIELD_TYPES,
  ...REFERENCE_FIELD_TYPES,
] as const;

// ============================================
// Type Definitions
// ============================================

export type TextFieldType = (typeof TEXT_FIELD_TYPES)[number];
export type TimeFieldType = (typeof TIME_FIELD_TYPES)[number];
export type NumberFieldType = (typeof NUMBER_FIELD_TYPES)[number];
export type SelectionFieldType = (typeof SELECTION_FIELD_TYPES)[number];
export type ReferenceFieldType = (typeof REFERENCE_FIELD_TYPES)[number];
export type FieldType = (typeof ALL_FIELD_TYPES)[number];

// ============================================
// Validation Groups
// ============================================

/**
 * Field types that require options property
 */
export const FIELD_TYPES_WITH_OPTIONS = [
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
] as const;

/**
 * Field types that require reference properties
 */
export const FIELD_TYPES_WITH_REFERENCE = [
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
] as const;

/**
 * Field types valid for Quick Filters
 * Per spec: Only choice-based fields can be used as quick filters
 */
export const QUICK_FILTER_VALID_FIELD_TYPES = [
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
] as const;

/**
 * Field types valid for Kanban status field
 * Per spec: Only single-choice fields, as a card can only be in one column at a time
 */
export const KANBAN_STATUS_VALID_FIELD_TYPES = [
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
] as const;

/**
 * Field types valid for Gantt date fields (start/end)
 */
export const GANTT_DATE_VALID_FIELD_TYPES = [
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
] as const;

/**
 * Field types valid for Gantt progress field
 */
export const GANTT_PROGRESS_VALID_FIELD_TYPES = [
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
] as const;

/**
 * Field types valid for Gantt dependency field
 */
export const GANTT_DEPENDENCY_VALID_FIELD_TYPES = [
  FIELD_TYPE_SELECT_LIST_RECORD,
] as const;

export type QuickFilterValidFieldType = (typeof QUICK_FILTER_VALID_FIELD_TYPES)[number];
export type KanbanStatusValidFieldType = (typeof KANBAN_STATUS_VALID_FIELD_TYPES)[number];
export type GanttDateValidFieldType = (typeof GANTT_DATE_VALID_FIELD_TYPES)[number];
export type GanttProgressValidFieldType = (typeof GANTT_PROGRESS_VALID_FIELD_TYPES)[number];
export type GanttDependencyValidFieldType = (typeof GANTT_DEPENDENCY_VALID_FIELD_TYPES)[number];
