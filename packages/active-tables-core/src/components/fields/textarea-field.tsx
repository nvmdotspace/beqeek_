/**
 * TextareaField Component
 *
 * Renders TEXT field type (multiline text)
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function TextareaField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const stringValue = (value as string) ?? '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Validate on change
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

    // Preserve line breaks in display mode
    return <div className="whitespace-pre-wrap">{stringValue}</div>;
  }

  // Edit mode
  const fieldId = `field-${field.name}`;

  const textareaClasses = `
    w-full px-3 py-2
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    min-h-[100px] resize-y
    ${error ? 'border-red-500' : ''}
    ${className || ''}
  `.trim();

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <textarea
        id={fieldId}
        name={field.name}
        value={stringValue}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        className={textareaClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        rows={4}
      />
    </FieldWrapper>
  );
}
