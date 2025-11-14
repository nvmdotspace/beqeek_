/**
 * CheckboxField Component
 *
 * Redesigned to match the current design system with an edit-only interactive tile.
 */

import { useCallback } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';

export function CheckboxField(props: FieldRendererProps) {
  const { field, value, onChange, disabled = false, error, className } = props;

  const booleanValue = Boolean(value);
  const fieldId = `field-${field.name}`;

  const handleChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (checked === 'indeterminate') {
        return;
      }

      if (checked !== booleanValue) {
        onChange?.(checked);
      }
    },
    [booleanValue, onChange],
  );

  return (
    <FieldWrapper
      fieldId={fieldId}
      label=""
      required={field.required}
      error={error}
      className="mb-4"
      fieldClassName="mt-0"
    >
      <label
        htmlFor={fieldId}
        className={cn(
          'flex items-center gap-3 text-sm font-medium text-foreground',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className,
        )}
      >
        <Checkbox
          id={fieldId}
          name={field.name}
          checked={booleanValue}
          onCheckedChange={handleChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        />
        <span>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </span>
      </label>
    </FieldWrapper>
  );
}
