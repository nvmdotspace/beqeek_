/**
 * CheckboxFieldInput - Input component for checkbox fields
 * @module active-tables-core/components/record-detail/fields/field-inputs
 */

import React from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldConfig } from '../../../../types/field.js';

interface CheckboxFieldInputProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  field: FieldConfig;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/**
 * Checkbox field input component
 * Handles CHECKBOX_YES_NO type, returns "yes"/"no" string values
 */
export function CheckboxFieldInput({
  value,
  onChange,
  onKeyDown,
  disabled,
  field,
  ...ariaProps
}: CheckboxFieldInputProps) {
  // Convert value to boolean
  const isChecked = value === 'yes' || value === true || value === 1 || value === '1';

  // Handle checkbox change
  const handleChange = (checked: boolean | 'indeterminate') => {
    // Convert boolean to "yes"/"no" string
    onChange(checked === true ? 'yes' : 'no');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Space or Enter toggles checkbox
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange(!isChecked);
    }
    // Pass through other keyboard events (Escape, etc.)
    onKeyDown?.(e);
  };

  return (
    <label
      className={cn('flex items-center gap-2 cursor-pointer select-none', disabled && 'cursor-not-allowed opacity-50')}
      onKeyDown={handleKeyDown}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
        aria-invalid={ariaProps['aria-invalid']}
        aria-describedby={ariaProps['aria-describedby']}
      />
      <span className="text-sm text-foreground">Yes</span>
    </label>
  );
}
