/**
 * TextField Component
 *
 * Renders SHORT_TEXT, EMAIL, and URL field types
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function TextField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const stringValue = (value as string) ?? '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Validate on change
      const validationError = validateFieldValue(newValue, field);
      if (validationError) {
        // Parent component should handle validation errors
        console.warn(`Validation error for ${field.name}:`, validationError);
      }

      onChange?.(newValue);
    },
    [onChange, field]
  );

  // Display mode
  if (mode === 'display') {
    if (!stringValue) {
      return (
        <span className="text-gray-400 italic">
          {props.messages?.emptyValue || '—'}
        </span>
      );
    }

    // Render as link for URL type
    if (field.type === FIELD_TYPES.URL) {
      return (
        <a
          href={stringValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {stringValue}
        </a>
      );
    }

    // Render as mailto link for EMAIL type
    if (field.type === FIELD_TYPES.EMAIL) {
      return (
        <a
          href={`mailto:${stringValue}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {stringValue}
        </a>
      );
    }

    return <span>{stringValue}</span>;
  }

  // Edit mode
  const inputType = field.type === FIELD_TYPES.EMAIL ? 'email' : field.type === FIELD_TYPES.URL ? 'url' : 'text';
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
    <FieldWrapper
      fieldId={fieldId}
      label={field.label}
      required={field.required}
      error={error}
    >
      <input
        type={inputType}
        id={fieldId}
        name={field.name}
        value={stringValue}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    </FieldWrapper>
  );
}
