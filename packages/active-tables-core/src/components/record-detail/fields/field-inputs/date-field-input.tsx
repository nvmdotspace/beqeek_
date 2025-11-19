/**
 * DateFieldInput - Input component for date/time fields
 * @module active-tables-core/components/record-detail/fields/field-inputs
 */

import React from 'react';
import { Input } from '@workspace/ui/components/input';
import type { FieldConfig } from '../../../../types/field.js';
import { FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, FIELD_TYPE_TIME } from '@workspace/beqeek-shared/constants';

interface DateFieldInputProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  field: FieldConfig;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/**
 * Date/time field input component
 * Handles DATE, DATETIME, and TIME types with ISO format conversion
 */
export function DateFieldInput({
  value,
  onChange,
  onKeyDown,
  autoFocus,
  disabled,
  field,
  ...ariaProps
}: DateFieldInputProps) {
  // Determine input type and format based on field type
  const getInputType = () => {
    switch (field.type) {
      case FIELD_TYPE_DATE:
        return 'date';
      case FIELD_TYPE_DATETIME:
        return 'datetime-local';
      case FIELD_TYPE_TIME:
        return 'time';
      default:
        return 'date';
    }
  };

  // Convert stored value to input format
  const formatValueForInput = (val: unknown): string => {
    if (val == null || val === '') return '';

    const stringValue = String(val);

    try {
      switch (field.type) {
        case FIELD_TYPE_DATE: {
          // Expected format: YYYY-MM-DD
          // Input expects: YYYY-MM-DD
          const date = new Date(stringValue);
          if (!isNaN(date.getTime())) {
            const isoDate = date.toISOString().split('T')[0];
            return isoDate || stringValue;
          }
          return stringValue;
        }

        case FIELD_TYPE_DATETIME: {
          // Expected format: ISO 8601 (YYYY-MM-DDTHH:mm:ss)
          // Input expects: YYYY-MM-DDTHH:mm
          const date = new Date(stringValue);
          if (!isNaN(date.getTime())) {
            // Format: YYYY-MM-DDTHH:mm
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          }
          return stringValue;
        }

        case FIELD_TYPE_TIME: {
          // Expected format: HH:mm:ss or HH:mm
          // Input expects: HH:mm
          if (stringValue.includes(':')) {
            const parts = stringValue.split(':');
            const hours = parts[0] || '00';
            const minutes = parts[1] || '00';
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          }
          return stringValue;
        }

        default:
          return stringValue;
      }
    } catch {
      return stringValue;
    }
  };

  // Convert input value to storage format
  const formatValueForStorage = (val: string): string | null => {
    if (!val) return null;

    try {
      switch (field.type) {
        case FIELD_TYPE_DATE:
          // Return as-is (YYYY-MM-DD)
          return val;

        case FIELD_TYPE_DATETIME: {
          // Convert YYYY-MM-DDTHH:mm to ISO 8601
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
          return val;
        }

        case FIELD_TYPE_TIME: {
          // Ensure HH:mm:ss format
          if (val.split(':').length === 2) {
            return `${val}:00`;
          }
          return val;
        }

        default:
          return val;
      }
    } catch {
      return val;
    }
  };

  const inputValue = formatValueForInput(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatValueForStorage(e.target.value);
    onChange(formattedValue);
  };

  return (
    <Input
      type={getInputType()}
      value={inputValue}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      disabled={disabled}
      placeholder={field.placeholder || undefined}
      {...ariaProps}
    />
  );
}
