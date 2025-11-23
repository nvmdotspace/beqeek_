/**
 * SelectFieldInput - Input component for selection fields
 * @module active-tables-core/components/record-detail/fields/field-inputs
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldConfig, FieldOption } from '../../../../types/field.js';
import { FIELD_TYPE_SELECT_LIST } from '@workspace/beqeek-shared/constants';

interface SelectFieldInputProps {
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
 * MultiSelect component for SELECT_LIST field type
 */
function MultiSelect({
  value,
  onChange,
  options,
  disabled,
  placeholder,
  ariaInvalid,
  ariaDescribedBy,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: FieldOption[];
  disabled?: boolean;
  placeholder?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder || 'Select options...';
    }
    const selectedOptions = options.filter((opt) => value.includes(opt.value));
    return selectedOptions.map((opt) => opt.text).join(', ');
  };

  return (
    <div
      className={cn(
        'flex min-h-[40px] w-full flex-col rounded-md border border-input bg-background px-3 py-2 text-sm transition-all',
        'focus-within:outline-none focus-within:ring-1 focus-within:ring-inset focus-within:ring-ring',
        ariaInvalid && 'border-destructive',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
    >
      {/* Display selected values */}
      <div className="mb-2 text-foreground">{getDisplayText()}</div>

      {/* Options list */}
      <Stack space="space-050">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-2 cursor-pointer select-none',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <Checkbox
              checked={value.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
              disabled={disabled}
            />
            <span className="text-sm">{option.text}</span>
          </label>
        ))}
      </Stack>
    </div>
  );
}

/**
 * Select field input component
 * Renders Select for SELECT_ONE, MultiSelect for SELECT_LIST
 */
export function SelectFieldInput({ value, onChange, onKeyDown, disabled, field, ...ariaProps }: SelectFieldInputProps) {
  const options = field.options || [];

  // Handle SELECT_LIST (multi-select)
  if (field.type === FIELD_TYPE_SELECT_LIST) {
    // Parse value as array
    let arrayValue: string[] = [];
    if (Array.isArray(value)) {
      arrayValue = value.map((v) => String(v));
    } else if (value != null && value !== '') {
      // Try parsing as JSON array
      try {
        const parsed = JSON.parse(String(value));
        if (Array.isArray(parsed)) {
          arrayValue = parsed.map((v) => String(v));
        }
      } catch {
        // If not JSON, treat as single value
        arrayValue = [String(value)];
      }
    }

    return (
      <MultiSelect
        value={arrayValue}
        onChange={(newValue) => onChange(newValue)}
        options={options}
        disabled={disabled}
        placeholder={field.placeholder}
        ariaInvalid={ariaProps['aria-invalid']}
        ariaDescribedBy={ariaProps['aria-describedby']}
      />
    );
  }

  // Handle SELECT_ONE (single select)
  const stringValue = value != null ? String(value) : '';

  return (
    <div onKeyDown={onKeyDown}>
      <Select value={stringValue} onValueChange={(newValue) => onChange(newValue || null)} disabled={disabled}>
        <SelectTrigger aria-invalid={ariaProps['aria-invalid']} aria-describedby={ariaProps['aria-describedby']}>
          <SelectValue placeholder={field.placeholder || 'Select an option...'}>
            {stringValue ? options.find((opt) => opt.value === stringValue)?.text || stringValue : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Empty option */}
          <SelectItem value="">
            <span className="text-muted-foreground italic">None</span>
          </SelectItem>

          {/* Options from field config */}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
