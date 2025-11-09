/**
 * Field formatter utility
 * Formats field values for display based on field type
 */

import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_URL,
  type FieldConfig,
} from '../types/field.js';

/**
 * Format a field value for display
 */
export function formatFieldValue(value: unknown, field?: FieldConfig): string {
  if (value == null || value === '') {
    return '';
  }

  if (!field) {
    return String(value);
  }

  switch (field.type) {
    case FIELD_TYPE_DATE:
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

    case FIELD_TYPE_DATETIME:
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

    case FIELD_TYPE_INTEGER:
    case FIELD_TYPE_NUMERIC:
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return String(value);

    case FIELD_TYPE_CHECKBOX_YES_NO:
      return value ? 'Yes' : 'No';

    case FIELD_TYPE_SELECT_ONE:
    case FIELD_TYPE_SELECT_LIST:
    case FIELD_TYPE_CHECKBOX_ONE:
    case FIELD_TYPE_CHECKBOX_LIST:
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

    case FIELD_TYPE_RICH_TEXT:
      // Strip HTML tags for display
      if (typeof value === 'string') {
        return value.replace(/<[^>]*>/g, '').trim();
      }
      return String(value);

    case FIELD_TYPE_URL:
      if (typeof value === 'string' && value.startsWith('http')) {
        try {
          const url = new URL(value);
          return url.hostname;
        } catch {
          return value;
        }
      }
      return String(value);

    case FIELD_TYPE_EMAIL:
    case FIELD_TYPE_SHORT_TEXT:
    case FIELD_TYPE_TEXT:
    default:
      return String(value);
  }
}
