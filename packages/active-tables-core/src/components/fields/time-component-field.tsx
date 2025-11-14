/**
 * TimeComponentField Component
 *
 * Renders YEAR, MONTH, DAY, HOUR, MINUTE, SECOND field types using shadcn/ui Input
 * These are integer inputs with specific validation ranges and no Vietnamese formatting
 */

import { useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import {
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
} from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';

// Validation ranges for each time component type
const TIME_COMPONENT_RANGES: Record<
  string,
  {
    placeholder: string;
  }
> = {
  [FIELD_TYPE_YEAR]: {
    placeholder: 'YYYY (e.g., 2025)',
  },
  [FIELD_TYPE_MONTH]: {
    placeholder: 'MM (1-12)',
  },
  [FIELD_TYPE_DAY]: {
    placeholder: 'DD (1-31)',
  },
  [FIELD_TYPE_HOUR]: {
    placeholder: 'HH (0-23)',
  },
  [FIELD_TYPE_MINUTE]: {
    placeholder: 'MM (0-59)',
  },
  [FIELD_TYPE_SECOND]: {
    placeholder: 'SS (0-59)',
  },
};

export function TimeComponentField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const config = TIME_COMPONENT_RANGES[field.type];
  if (!config) {
    console.error(`TimeComponentField: Unknown field type ${field.type}`);
    return null;
  }

  const numericValue = value != null && value !== '' ? Number(value) : null;
  const stringValue = numericValue !== null ? String(numericValue) : '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Allow empty
      if (input === '') {
        onChange?.('');
        return;
      }

      // Only allow digits
      if (!/^\d+$/.test(input)) {
        return;
      }

      const parsed = parseInt(input, 10);

      // Validate range
      if (isNaN(parsed)) {
        return;
      }

      // Validate with field validator
      const validationError = validateFieldValue(parsed, field);
      if (validationError) {
        console.warn(`Validation error for ${field.name}:`, validationError);
      }

      onChange?.(parsed);
    },
    [onChange, field, config],
  );

  // Edit mode only
  const fieldId = `field-${field.name}`;
  const placeholder = field.placeholder || config.placeholder;

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <Input
        type="text"
        inputMode="numeric"
        id={fieldId}
        name={field.name}
        value={stringValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={field.required}
        className={className}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    </FieldWrapper>
  );
}
