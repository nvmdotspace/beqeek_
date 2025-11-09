/**
 * SelectField Component
 *
 * Renders SELECT_ONE, SELECT_LIST, CHECKBOX_ONE, and CHECKBOX_LIST field types
 */

import React, { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/index.js';
import { FIELD_TYPE_SELECT_LIST, FIELD_TYPE_CHECKBOX_LIST, type FieldType } from '../../types/field.js';

const MULTI_VALUE_SELECT_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_CHECKBOX_LIST,
]);
import { validateFieldValue } from '../../utils/index.js';

export function SelectField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const isMultiple = MULTI_VALUE_SELECT_TYPES.has(field.type);

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
        return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((val) => {
            const option = field.options?.find((opt: { value: string }) => opt.value === val);

            return (
              <span
                key={val}
                className="inline-flex items-center justify-center px-2 py-1 rounded-full text-sm font-medium min-h-[2rem]"
                style={{
                  color: option?.text_color || '#1f2937',
                  backgroundColor: option?.background_color || '#e5e7eb',
                }}
              >
                {option?.text || val}
              </span>
            );
          })}
        </div>
      );
    }

    // Single select display
    const selectedValue = normalizedValue as string;
    if (!selectedValue) {
      return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
    }

    const option = field.options?.find((opt: { value: string }) => opt.value === selectedValue);

    // Always apply badge styling for consistency with minimum height
    return (
      <span
        className="inline-flex items-center justify-center px-2 py-1 rounded-full text-sm font-medium min-h-[2rem]"
        style={{
          color: option?.text_color || '#1f2937',
          backgroundColor: option?.background_color || '#e5e7eb',
        }}
      >
        {option?.text || selectedValue}
      </span>
    );
  }

  // Edit mode
  const fieldId = `field-${field.name}`;

  const selectClasses = `
    w-full px-3 py-2
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
        <p className="text-xs text-muted-foreground mt-1">
          {props.messages?.multiSelectHint || 'Hold Ctrl/Cmd to select multiple options'}
        </p>
      )}
    </FieldWrapper>
  );
}
