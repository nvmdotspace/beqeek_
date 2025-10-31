/**
 * DateTimeField Component
 *
 * Renders DATETIME field type
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';
import { format, parse } from 'date-fns';

export function DateTimeField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const stringValue = (value as string) ?? '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value; // YYYY-MM-DDTHH:mm format

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
    if (!stringValue) {
      return <span className="text-gray-400 italic">{props.messages?.emptyValue || '—'}</span>;
    }

    try {
      const date = parse(stringValue, "yyyy-MM-dd'T'HH:mm", new Date());
      const formatted = format(date, 'dd/MM/yyyy HH:mm'); // Vietnamese format
      return <span>{formatted}</span>;
    } catch {
      return <span>{stringValue}</span>;
    }
  }

  // Edit mode
  const fieldId = `field-${field.name}`;

  const inputClasses = `
    w-full px-3 py-2
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : ''}
    ${className || ''}
  `.trim();

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <input
        type="datetime-local"
        id={fieldId}
        name={field.name}
        value={stringValue}
        onChange={handleChange}
        disabled={disabled}
        required={field.required}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    </FieldWrapper>
  );
}
