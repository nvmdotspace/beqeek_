/**
 * TimeField Component
 *
 * Renders TIME field type
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function TimeField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const stringValue = (value as string) ?? '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value; // HH:mm format

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
      return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
    }

    return <span>{stringValue}</span>;
  }

  // Edit mode
  const fieldId = `field-${field.name}`;

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
        type="time"
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
