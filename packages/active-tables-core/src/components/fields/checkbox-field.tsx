/**
 * CheckboxField Component
 *
 * Renders CHECKBOX_YES_NO field type (single boolean checkbox)
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';

export function CheckboxField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  // Convert value to boolean
  const booleanValue = Boolean(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    },
    [onChange]
  );

  // Display mode
  if (mode === 'display') {
    return (
      <span className="inline-flex items-center">
        {booleanValue ? (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <span className="ml-2">
          {booleanValue ? (props.messages?.yes || 'Yes') : (props.messages?.no || 'No')}
        </span>
      </span>
    );
  }

  // Edit mode
  const fieldId = `field-${field.name}`;

  const checkboxClasses = `
    w-4 h-4
    text-blue-600 border-gray-300 rounded
    focus:ring-2 focus:ring-blue-500
    disabled:cursor-not-allowed disabled:opacity-50
    ${error ? 'border-red-500' : ''}
    ${className || ''}
  `.trim();

  return (
    <FieldWrapper
      fieldId={fieldId}
      label=""
      error={error}
      className="flex items-center space-x-2"
    >
      <input
        type="checkbox"
        id={fieldId}
        name={field.name}
        checked={booleanValue}
        onChange={handleChange}
        disabled={disabled}
        className={checkboxClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-700 cursor-pointer">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </FieldWrapper>
  );
}
