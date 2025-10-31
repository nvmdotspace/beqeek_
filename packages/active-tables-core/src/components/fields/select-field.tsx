/**
 * SelectField Component
 *
 * Renders SELECT_ONE, SELECT_LIST, CHECKBOX_ONE, and CHECKBOX_LIST field types
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPE_SELECT_LIST, FIELD_TYPE_CHECKBOX_LIST } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function SelectField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const isMultiple = [FIELD_TYPE_SELECT_LIST, FIELD_TYPE_CHECKBOX_LIST].includes(field.type as any);

  // Normalize value to array for multiple select
  const normalizedValue = isMultiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ?? '');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (isMultiple) {
        const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
        const validationError = validateFieldValue(selectedOptions, field);
        if (validationError) {
          console.warn(`Validation error for ${field.name}:`, validationError);
        }
        onChange?.(selectedOptions);
      } else {
        const newValue = e.target.value;
        const validationError = validateFieldValue(newValue, field);
        if (validationError) {
          console.warn(`Validation error for ${field.name}:`, validationError);
        }
        onChange?.(newValue);
      }
    },
    [onChange, field, isMultiple],
  );

  // Display mode
  if (mode === 'display') {
    if (isMultiple) {
      const selectedValues = normalizedValue as string[];
      if (selectedValues.length === 0) {
        return <span className="text-gray-400 italic">{props.messages?.emptyValue || '—'}</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((val) => {
            const option = field.options?.find((opt: { value: string }) => opt.value === val);
            if (!option) return null;

            return (
              <span
                key={val}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium"
                style={{
                  color: option.text_color || '#1f2937',
                  backgroundColor: option.background_color || '#e5e7eb',
                }}
              >
                {option.text}
              </span>
            );
          })}
        </div>
      );
    }

    // Single select display
    const selectedValue = normalizedValue as string;
    if (!selectedValue) {
      return <span className="text-gray-400 italic">{props.messages?.emptyValue || '—'}</span>;
    }

    const option = field.options?.find((opt: { value: string }) => opt.value === selectedValue);
    if (!option) return <span>{selectedValue}</span>;

    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium"
        style={{
          color: option.text_color || '#1f2937',
          backgroundColor: option.background_color || '#e5e7eb',
        }}
      >
        {option.text}
      </span>
    );
  }

  // Edit mode
  const fieldId = `field-${field.name}`;

  const selectClasses = `
    w-full px-3 py-2
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : ''}
    ${className || ''}
  `.trim();

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <select
        id={fieldId}
        name={field.name}
        value={normalizedValue as string | string[]}
        onChange={handleChange}
        disabled={disabled}
        required={field.required}
        multiple={isMultiple}
        size={isMultiple ? Math.min((field.options?.length || 3) + 1, 6) : undefined}
        className={selectClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      >
        {!isMultiple && (
          <option value="">{field.placeholder || props.messages?.selectPlaceholder || 'Select an option'}</option>
        )}
        {field.options?.map((option: { value: string; text: string }) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
      {isMultiple && (
        <p className="text-xs text-gray-500 mt-1">
          {props.messages?.multiSelectHint || 'Hold Ctrl/Cmd to select multiple options'}
        </p>
      )}
    </FieldWrapper>
  );
}
