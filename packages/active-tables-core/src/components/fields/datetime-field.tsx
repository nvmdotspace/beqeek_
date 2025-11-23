/**
 * DateTimeField Component
 *
 * Renders DATETIME field type using shadcn/ui Input
 */

import { useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';
import { format, parse } from 'date-fns';

export function DateTimeField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className, hideLabel = false } = props;

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

  // Edit mode only
  const fieldId = `field-${field.name}`;

  return (
    <FieldWrapper fieldId={fieldId} label={hideLabel ? undefined : field.label} required={field.required} error={error}>
      <Input
        type="datetime-local"
        id={fieldId}
        name={field.name}
        value={stringValue}
        onChange={handleChange}
        disabled={disabled}
        required={field.required}
        className={className}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    </FieldWrapper>
  );
}
