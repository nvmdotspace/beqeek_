/**
 * Table Type Validators
 *
 * Validation utilities for table types.
 */

import { TABLE_TYPES, type TableType } from '../constants/table-types.js';

/**
 * Validates if a given string is a valid table type
 */
export function isValidTableType(type: string): type is TableType {
  return TABLE_TYPES.includes(type as TableType);
}

/**
 * Gets all available table types
 */
export function getTableTypes(): readonly TableType[] {
  return TABLE_TYPES;
}
