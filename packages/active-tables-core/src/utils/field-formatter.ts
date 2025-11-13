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
 * Workspace user for display name resolution
 */
export interface WorkspaceUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

/**
 * Format a field value for display
 *
 * @param value - Field value to format
 * @param field - Field configuration
 * @param workspaceUsers - Optional workspace users for user field name resolution
 */
export function formatFieldValue(value: unknown, field?: FieldConfig, workspaceUsers?: WorkspaceUser[]): string {
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
    case FIELD_TYPE_NUMERIC: {
      if (typeof value === 'number') {
        const isNumeric = field.type === FIELD_TYPE_NUMERIC;
        const decimalPlaces = field.decimalPlaces ?? (isNumeric ? 2 : 0);

        // Format with Vietnamese locale (dot for thousands, comma for decimal)
        return new Intl.NumberFormat('vi-VN', {
          minimumFractionDigits: isNumeric ? 0 : 0,
          maximumFractionDigits: decimalPlaces,
        }).format(value);
      }
      return String(value);
    }

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

    case 'SELECT_ONE_WORKSPACE_USER':
      if (typeof value === 'string' && workspaceUsers) {
        const user = workspaceUsers.find((u) => u.id === value);
        return user?.name || value; // Fallback to ID if not found
      }
      return String(value);

    case 'SELECT_LIST_WORKSPACE_USER':
      if (Array.isArray(value) && workspaceUsers) {
        const userNames = value
          .map((userId) => {
            if (typeof userId === 'string') {
              const user = workspaceUsers.find((u) => u.id === userId);
              return user?.name || userId;
            }
            return String(userId);
          })
          .filter(Boolean);
        return userNames.join(', ');
      }
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);

    case FIELD_TYPE_EMAIL:
    case FIELD_TYPE_SHORT_TEXT:
    case FIELD_TYPE_TEXT:
    default:
      return String(value);
  }
}
