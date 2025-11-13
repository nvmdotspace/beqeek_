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
    [onChange, field],
  );

  // Display mode
  if (mode === 'display') {
    if (numericValue === '') {
      return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
    }

    // Determine decimal places
    const isNumeric = field.type === FIELD_TYPES.NUMERIC;
    const decimalPlaces = field.decimalPlaces ?? (isNumeric ? 2 : 0);

    // Format numbers with Vietnamese locale (dot for thousands, comma for decimal)
    const formatted = new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: isNumeric ? 0 : 0,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(numericValue));

    return <span>{formatted}</span>;
  }

  // Edit mode
  const fieldId = `field-${field.name}`;
  const isNumeric = field.type === FIELD_TYPES.NUMERIC;
  const decimalPlaces = field.decimalPlaces ?? (isNumeric ? 2 : 0);

  // Calculate step based on decimal places
  // For decimalPlaces=2: step=0.01, for decimalPlaces=3: step=0.001, etc.
  const step = isNumeric && decimalPlaces > 0 ? Math.pow(10, -decimalPlaces).toString() : '1';

  const inputClasses = `
    w-full px-3 py-2
    text-sm
    border border-input rounded-lg
    bg-background text-foreground
    transition-all
    placeholder:text-muted-foreground
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring
    disabled:cursor-not-allowed disabled:opacity-50
    aria-invalid:border-destructive
    ${className || ''}
  `.trim();

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
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
