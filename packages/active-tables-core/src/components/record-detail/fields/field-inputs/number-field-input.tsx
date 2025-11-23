/**
 * NumberFieldInput - Input component for numeric fields
 * @module active-tables-core/components/record-detail/fields/field-inputs
 */

import React from 'react';
import { Input } from '@workspace/ui/components/input';
import type { FieldConfig } from '../../../../types/field.js';
import { FIELD_TYPE_NUMERIC } from '@workspace/beqeek-shared/constants';

interface NumberFieldInputProps {
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
 * Number field input component
 * Handles INTEGER and NUMERIC types with decimal places
 */
export function NumberFieldInput({
  value,
  onChange,
  onKeyDown,
  autoFocus,
  disabled,
  field,
  ...ariaProps
}: NumberFieldInputProps) {
  // Convert value to string for input
  const stringValue = value != null ? String(value) : '';

  // Determine step based on field type
  const getStep = () => {
    if (field.type === FIELD_TYPE_NUMERIC) {
      const decimalPlaces = field.decimalPlaces ?? 2;
      return decimalPlaces > 0 ? `0.${'0'.repeat(decimalPlaces - 1)}1` : '1';
    }
    return '1'; // INTEGER - whole numbers only
  };

  // Handle input change with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty value
    if (newValue === '') {
      onChange(null);
      return;
    }

    // For NUMERIC, preserve the decimal input
    if (field.type === FIELD_TYPE_NUMERIC) {
      onChange(newValue);
    } else {
      // For INTEGER, parse as integer
      const parsed = parseInt(newValue, 10);
      onChange(isNaN(parsed) ? newValue : parsed);
    }
  };

  // Handle blur to format the value
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === '') {
      onChange(null);
      return;
    }

    if (field.type === FIELD_TYPE_NUMERIC) {
      const parsed = parseFloat(newValue);
      if (!isNaN(parsed)) {
        const decimalPlaces = field.decimalPlaces ?? 2;
        onChange(parsed.toFixed(decimalPlaces));
      }
    } else {
      const parsed = parseInt(newValue, 10);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  return (
    <Input
      type="number"
      value={stringValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      disabled={disabled}
      placeholder={field.placeholder}
      step={getStep()}
      className="text-right"
      {...ariaProps}
    />
  );
}
