/**
 * Field Validation Utilities
 *
 * Client-side validation for field values
 */

import type { FieldConfig } from '../types/field.js';
import { isTextField, isNumberField, isDateTimeField, isSelectionField } from '../types/field.js';

// ============================================
// Types
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validate if value is required
 */
export function validateRequired(value: unknown, field: FieldConfig): ValidationResult {
  if (!field.required) {
    return { valid: true };
  }

  if (value === null || value === undefined || value === '') {
    return {
      valid: false,
      error: `${field.label} is required`,
    };
  }

  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(value: unknown): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: true }; // Empty is valid (use required check separately)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      valid: false,
      error: 'Invalid email format',
    };
  }

  return { valid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(value: unknown): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: true };
  }

  try {
    new URL(value);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Validate number value
 */
export function validateNumber(value: unknown): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return {
        valid: false,
        error: 'Invalid number',
      };
    }
    return { valid: true };
  }

  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) {
      return {
        valid: false,
        error: 'Must be a valid number',
      };
    }
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Must be a number',
  };
}

/**
 * Validate date format
 */
export function validateDate(value: unknown): ValidationResult {
  if (!value) {
    return { valid: true };
  }

  const date = new Date(value as string);
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Invalid date format',
    };
  }

  return { valid: true };
}

/**
 * Validate field value based on field type
 */
export function validateFieldValue(value: unknown, field: FieldConfig): ValidationResult {
  // Check required
  const requiredResult = validateRequired(value, field);
  if (!requiredResult.valid) {
    return requiredResult;
  }

  // Type-specific validation
  if (field.type === 'EMAIL') {
    return validateEmail(value);
  }

  if (field.type === 'URL') {
    return validateUrl(value);
  }

  if (isNumberField(field.type)) {
    return validateNumber(value);
  }

  if (isDateTimeField(field.type)) {
    return validateDate(value);
  }

  // Default: valid
  return { valid: true };
}

/**
 * Validate all fields in a record
 */
export function validateRecord(
  record: Record<string, unknown>,
  fields: FieldConfig[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const field of fields) {
    const value = record[field.name];
    results[field.name] = validateFieldValue(value, field);
  }

  return results;
}

/**
 * Check if record has any validation errors
 */
export function hasValidationErrors(
  results: Record<string, ValidationResult>
): boolean {
  return Object.values(results).some((r) => !r.valid);
}
