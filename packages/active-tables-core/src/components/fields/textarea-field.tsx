/**
 * TextareaField Component
 *
 * Renders TEXT field type (multiline text) using shadcn/ui Textarea
 */

import { useCallback } from 'react';
import { Textarea } from '@workspace/ui/components/textarea';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function TextareaField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className, hideLabel = false } = props;

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

  // Edit mode only
  const fieldId = `field-${field.name}`;

  return (
    <FieldWrapper fieldId={fieldId} label={hideLabel ? undefined : field.label} required={field.required} error={error}>
      <Textarea
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
        rows={4}
      />
    </FieldWrapper>
  );
}
