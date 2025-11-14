/**
 * Field Validation Utilities
 *
 * Manual validation utilities matching legacy pattern.
 * No Zod dependency - uses TypeScript strict typing + runtime checks.
 * Pattern from workflow-forms.blade.php lines 795-826.
 */

import type { Field, Option } from '../types';

/**
 * Validate field configuration
 * Returns error message or null if valid
 */
export function validateField(field: Partial<Field>): string | null {
  // Label required
  if (!field.label?.trim()) {
    return 'Tên trường không được để trống';
  }

  // Select must have options
  if (field.type === 'select' && (!field.options || field.options.length === 0)) {
    return 'Vui lòng thêm ít nhất một tùy chọn cho trường select';
  }

  // Validate select options
  if (field.type === 'select' && field.options) {
    for (const option of field.options) {
      const optionError = validateOption(option);
      if (optionError) {
        return optionError;
      }
    }
  }

  // Date format validation (YYYY-MM-DD)
  if (field.type === 'date' && field.defaultValue) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(field.defaultValue)) {
      return 'Giá trị mặc định phải đúng định dạng YYYY-MM-DD';
    }
  }

  // Datetime format validation (YYYY-MM-DDTHH:MM)
  if (field.type === 'datetime-local' && field.defaultValue) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(field.defaultValue)) {
      return 'Giá trị mặc định phải đúng định dạng YYYY-MM-DDTHH:MM';
    }
  }

  // Number validation for number type
  if (field.type === 'number' && field.defaultValue) {
    if (isNaN(Number(field.defaultValue))) {
      return 'Giá trị mặc định phải là số';
    }
  }

  return null; // Valid
}

/**
 * Auto-generate field name from label
 * Converts to lowercase, replaces spaces with underscores
 */
export function generateFieldName(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, ''); // Remove special characters
}

/**
 * Validate option pair
 */
export function validateOption(option: Option): string | null {
  if (!option.text?.trim()) {
    return 'Tên tùy chọn không được để trống';
  }
  if (!option.value?.trim()) {
    return 'Giá trị tùy chọn không được để trống';
  }
  return null;
}

/**
 * Check if field type requires options
 */
export function requiresOptions(fieldType: string): boolean {
  return fieldType === 'select';
}
