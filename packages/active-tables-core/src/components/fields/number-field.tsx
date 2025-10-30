/**
 * NumberField Component
 *
 * Renders INTEGER, NUMERIC, and time component fields (YEAR, MONTH, DAY, etc.)
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function NumberField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  // Convert value to number or empty string
  const numericValue = value != null && value !== '' ? Number(value) : '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty value
      if (inputValue === '') {
        onChange?.('');
        return;
      }

      const newValue = Number(inputValue);

      // Validate
      const validationError = validateFieldValue(newValue, field);
      if (validationError) {
        console.warn(`Validation error for ${field.name}:`, validationError);
      }

      onChange?.(newValue);
    },
    [onChange, field]
  );

  // Display mode
  if (mode === 'display') {
    if (numericValue === '') {
      return (
        <span className="text-gray-400 italic">
          {props.messages?.emptyValue || '—'}
        </span>
      );
    }

    // Format for NUMERIC (decimal numbers)
    if (field.type === FIELD_TYPES.NUMERIC) {
      const formatted = new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10,
      }).format(Number(numericValue));

      return <span>{formatted}</span>;
    }

    // Integer display
    return <span>{numericValue}</span>;
  }

  // Edit mode
  const fieldId = `field-${field.name}`;
  const isDecimal = field.type === FIELD_TYPES.NUMERIC;
  const step = isDecimal ? 'any' : '1';

  const inputClasses = `
    w-full px-3 py-2
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : ''}
    ${className || ''}
  `.trim();

  return (
    <FieldWrapper
      fieldId={fieldId}
      label={field.label}
      required={field.required}
      error={error}
    >
      <input
        type="number"
        id={fieldId}
        name={field.name}
        value={numericValue}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        step={step}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    </FieldWrapper>
  );
}
