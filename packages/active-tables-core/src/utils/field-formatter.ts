/**
 * Field formatter utility
 * Formats field values for display based on field type
 */

import type { FieldConfig } from '../types/field.js';

/**
 * Format a field value for display
 */
export function formatFieldValue(value: any, field?: FieldConfig): string {
  if (value == null || value === '') {
    return '';
  }

  if (!field) {
    return String(value);
  }

  switch (field.type) {
    case 'DATE':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          return date.toLocaleDateString();
        } catch {
          return value;
        }
      }
      return String(value);

    case 'DATETIME':
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          return date.toLocaleString();
        } catch {
          return value;
        }
      }
      return String(value);

    case 'NUMBER':
    case 'INTEGER':
    case 'NUMERIC':
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return String(value);

    case 'BOOLEAN':
      return value ? 'Yes' : 'No';

    case 'SELECT_ONE':
    case 'SELECT_LIST':
      if (field.options) {
        const option = field.options.find((opt) => opt.value === value);
        if (option) {
          return option.text;
        }
      }
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);

    case 'RICH_TEXT':
      // Strip HTML tags for display
      if (typeof value === 'string') {
        return value.replace(/<[^>]*>/g, '').trim();
      }
      return String(value);

    case 'URL':
      if (typeof value === 'string' && value.startsWith('http')) {
        try {
          const url = new URL(value);
          return url.hostname;
        } catch {
          return value;
        }
      }
      return String(value);

    case 'EMAIL':
    case 'PHONE':
    case 'SHORT_TEXT':
    case 'TEXT':
    default:
      return String(value);
  }
}
