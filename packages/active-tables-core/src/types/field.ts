/**
 * Field type definitions and utilities for Active Tables
 *
 * Supports 25+ field types with type guards for runtime validation
 */

// ============================================
// Field Types Constants
// ============================================

/**
 * All supported field types in Active Tables
 */
export const FIELD_TYPES = {
  // Text fields
  SHORT_TEXT: 'SHORT_TEXT',
  TEXT: 'TEXT',
  RICH_TEXT: 'RICH_TEXT',
  EMAIL: 'EMAIL',
  URL: 'URL',
  PHONE: 'PHONE',

  // Number fields
  INTEGER: 'INTEGER',
  NUMERIC: 'NUMERIC',
  CURRENCY: 'CURRENCY',
  PERCENTAGE: 'PERCENTAGE',
  RATING: 'RATING',

  // Date/Time fields
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  TIME: 'TIME',
  YEAR: 'YEAR',
  MONTH: 'MONTH',
  DAY: 'DAY',
  HOUR: 'HOUR',
  MINUTE: 'MINUTE',
  SECOND: 'SECOND',

  // Selection fields
  SELECT_ONE: 'SELECT_ONE',
  SELECT_LIST: 'SELECT_LIST',
  CHECKBOX_YES_NO: 'CHECKBOX_YES_NO',
  CHECKBOX_ONE: 'CHECKBOX_ONE',
  CHECKBOX_LIST: 'CHECKBOX_LIST',

  // Reference fields
  SELECT_ONE_RECORD: 'SELECT_ONE_RECORD',
  SELECT_LIST_RECORD: 'SELECT_LIST_RECORD',

  // Special fields
  FILE: 'FILE',
  IMAGE: 'IMAGE',
  LOCATION: 'LOCATION',
  JSON: 'JSON',
} as const;

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];

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

  /** Whether field is required */
  required?: boolean;

  /** Options for selection fields */
  options?: FieldOption[];
}

// ============================================
// Type Guards
// ============================================

/**
 * Text field types
 */
export const TEXT_FIELD_TYPES = [
  FIELD_TYPES.SHORT_TEXT,
  FIELD_TYPES.TEXT,
  FIELD_TYPES.RICH_TEXT,
  FIELD_TYPES.EMAIL,
  FIELD_TYPES.URL,
  FIELD_TYPES.PHONE,
] as const;

export function isTextField(type: string): boolean {
  return TEXT_FIELD_TYPES.includes(type as any);
}

/**
 * Number field types
 */
export const NUMBER_FIELD_TYPES = [
  FIELD_TYPES.INTEGER,
  FIELD_TYPES.NUMERIC,
  FIELD_TYPES.CURRENCY,
  FIELD_TYPES.PERCENTAGE,
  FIELD_TYPES.RATING,
] as const;

export function isNumberField(type: string): boolean {
  return NUMBER_FIELD_TYPES.includes(type as any);
}

/**
 * Date/Time field types
 */
export const DATE_TIME_FIELD_TYPES = [
  FIELD_TYPES.DATE,
  FIELD_TYPES.DATETIME,
  FIELD_TYPES.TIME,
  FIELD_TYPES.YEAR,
  FIELD_TYPES.MONTH,
  FIELD_TYPES.DAY,
  FIELD_TYPES.HOUR,
  FIELD_TYPES.MINUTE,
  FIELD_TYPES.SECOND,
] as const;

export function isDateTimeField(type: string): boolean {
  return DATE_TIME_FIELD_TYPES.includes(type as any);
}

/**
 * Selection field types (use options)
 */
export const SELECTION_FIELD_TYPES = [
  FIELD_TYPES.SELECT_ONE,
  FIELD_TYPES.SELECT_LIST,
  FIELD_TYPES.CHECKBOX_YES_NO,
  FIELD_TYPES.CHECKBOX_ONE,
  FIELD_TYPES.CHECKBOX_LIST,
] as const;

export function isSelectionField(type: string): boolean {
  return SELECTION_FIELD_TYPES.includes(type as any);
}

/**
 * Reference field types (reference other records)
 */
export const REFERENCE_FIELD_TYPES = [
  FIELD_TYPES.SELECT_ONE_RECORD,
  FIELD_TYPES.SELECT_LIST_RECORD,
] as const;

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
