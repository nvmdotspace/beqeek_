/**
 * Field type definitions and utilities for Active Tables
 *
 * Supports 25+ field types with type guards for runtime validation
 */

// ============================================
// Field Types Constants (Re-exported from beqeek-shared)
// ============================================

import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
} from '@workspace/beqeek-shared/constants';

// Re-export for external use
export {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
};

// Import and re-export groups and types
import {
  TEXT_FIELD_TYPES,
  TIME_FIELD_TYPES,
  NUMBER_FIELD_TYPES,
  SELECTION_FIELD_TYPES,
  REFERENCE_FIELD_TYPES,
  ALL_FIELD_TYPES,
  type FieldType,
  type TextFieldType,
  type TimeFieldType,
  type NumberFieldType,
  type SelectionFieldType,
  type ReferenceFieldType,
} from '@workspace/beqeek-shared/constants';

export {
  TEXT_FIELD_TYPES,
  TIME_FIELD_TYPES,
  NUMBER_FIELD_TYPES,
  SELECTION_FIELD_TYPES,
  REFERENCE_FIELD_TYPES,
  ALL_FIELD_TYPES,
  type FieldType,
  type TextFieldType,
  type TimeFieldType,
  type NumberFieldType,
  type SelectionFieldType,
  type ReferenceFieldType,
};

// Legacy FIELD_TYPES object for backward compatibility
export const FIELD_TYPES = {
  SHORT_TEXT: FIELD_TYPE_SHORT_TEXT,
  TEXT: FIELD_TYPE_TEXT,
  RICH_TEXT: FIELD_TYPE_RICH_TEXT,
  EMAIL: FIELD_TYPE_EMAIL,
  URL: FIELD_TYPE_URL,
  DATE: FIELD_TYPE_DATE,
  DATETIME: FIELD_TYPE_DATETIME,
  TIME: FIELD_TYPE_TIME,
  YEAR: FIELD_TYPE_YEAR,
  MONTH: FIELD_TYPE_MONTH,
  DAY: FIELD_TYPE_DAY,
  HOUR: FIELD_TYPE_HOUR,
  MINUTE: FIELD_TYPE_MINUTE,
  SECOND: FIELD_TYPE_SECOND,
  INTEGER: FIELD_TYPE_INTEGER,
  NUMERIC: FIELD_TYPE_NUMERIC,
  CHECKBOX_YES_NO: FIELD_TYPE_CHECKBOX_YES_NO,
  CHECKBOX_ONE: FIELD_TYPE_CHECKBOX_ONE,
  CHECKBOX_LIST: FIELD_TYPE_CHECKBOX_LIST,
  SELECT_ONE: FIELD_TYPE_SELECT_ONE,
  SELECT_LIST: FIELD_TYPE_SELECT_LIST,
  SELECT_ONE_RECORD: FIELD_TYPE_SELECT_ONE_RECORD,
  SELECT_LIST_RECORD: FIELD_TYPE_SELECT_LIST_RECORD,
  SELECT_ONE_WORKSPACE_USER: FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  SELECT_LIST_WORKSPACE_USER: FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
  FIRST_REFERENCE_RECORD: FIELD_TYPE_FIRST_REFERENCE_RECORD,
} as const;

// ============================================
// Field Option
// ============================================

/**
 * Option for selection fields (SELECT_ONE, SELECT_LIST, etc.)
 */
export interface FieldOption {
  text: string;
  value: string;
  text_color?: string;
  background_color?: string;
}

// ============================================
// Field Configuration
// ============================================

/**
 * Configuration for a single field in an Active Table
 */
export interface FieldConfig {
  /** Field type (SHORT_TEXT, INTEGER, DATE, etc.) */
  type: string;

  /** Display label */
  label: string;

  /** Unique field name (used as key in record data) */
  name: string;

  /** Placeholder text for input */
  placeholder?: string;

  /** Default value for new records */
  defaultValue?: string;

  /** Whether field is required */
  required?: boolean;

  /** Options for selection fields */
  options?: FieldOption[];

  /** Field name to use as label for reference/user fields */
  referenceLabelField?: string;
}

// ============================================
// Type Guards
// ============================================

/**
 * Check if field type is a text field
 */
export function isTextField(type: string): boolean {
  return TEXT_FIELD_TYPES.includes(type as any);
}

/**
 * Check if field type is a number field
 */
export function isNumberField(type: string): boolean {
  return NUMBER_FIELD_TYPES.includes(type as any);
}

/**
 * Check if field type is a date/time field
 */
export function isDateTimeField(type: string): boolean {
  return TIME_FIELD_TYPES.includes(type as any);
}

/**
 * Check if field type is a selection field
 */
export function isSelectionField(type: string): boolean {
  return SELECTION_FIELD_TYPES.includes(type as any);
}

/**
 * Check if field type is a reference field
 */
export function isReferenceField(type: string): boolean {
  return REFERENCE_FIELD_TYPES.includes(type as any);
}

/**
 * Multi-value field types (return arrays)
 */
export const MULTI_VALUE_FIELD_TYPES = [
  FIELD_TYPES.SELECT_LIST,
  FIELD_TYPES.CHECKBOX_LIST,
  FIELD_TYPES.SELECT_LIST_RECORD,
] as const;

export function isMultiValueField(type: string): boolean {
  return MULTI_VALUE_FIELD_TYPES.includes(type as any);
}

/**
 * Check if field type exists and is valid
 */
export function isValidFieldType(type: string): type is FieldType {
  return Object.values(FIELD_TYPES).includes(type as any);
}

/**
 * Check if field config has required properties
 */
export function isValidFieldConfig(field: any): field is FieldConfig {
  return (
    field &&
    typeof field === 'object' &&
    typeof field.type === 'string' &&
    typeof field.label === 'string' &&
    typeof field.name === 'string' &&
    isValidFieldType(field.type)
  );
}

// ============================================
// Legacy Type Aliases (for backward compatibility)
// ============================================

/**
 * @deprecated Use FieldOption instead
 */
export type ActiveTableOption = FieldOption;

/**
 * @deprecated Use FieldConfig instead
 */
export type ActiveFieldConfig = FieldConfig;
