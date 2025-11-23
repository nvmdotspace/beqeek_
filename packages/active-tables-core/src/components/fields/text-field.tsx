/**
 * TextField Component
 *
 * Renders SHORT_TEXT, EMAIL, and URL field types using shadcn/ui Input
 */

import { useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function TextField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className, hideLabel = false } = props;

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
    [onChange, field],
  );

  // Edit mode only
  const inputType = field.type === FIELD_TYPES.EMAIL ? 'email' : field.type === FIELD_TYPES.URL ? 'url' : 'text';
  const fieldId = `field-${field.name}`;

  return (
    <FieldWrapper fieldId={fieldId} label={hideLabel ? undefined : field.label} required={field.required} error={error}>
      <Input
        type={inputType}
        id={fieldId}
        name={field.name}
        value={stringValue}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        className={className}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    </FieldWrapper>
  );
}
