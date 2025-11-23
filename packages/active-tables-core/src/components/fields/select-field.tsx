/**
 * SelectField Component
 *
 * Redesigned single-select menu aligned with the design system.
 */

import { useCallback } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/index.js';
import { validateFieldValue } from '../../utils/index.js';

interface OptionMeta {
  value: string;
  text: string;
  /**
   * Custom text color (bypasses design system - use sparingly)
   * @warning May cause contrast issues in dark mode. Consider using design system colors.
   */
  text_color?: string;
  /**
   * Custom background color for option indicator
   * @warning Should use design system colors when possible for theme consistency.
   */
  background_color?: string;
}

export function SelectField(props: FieldRendererProps) {
  const { field, value, onChange, disabled = false, error, className, messages, hideLabel = false } = props;

  const stringValue = value ? String(value) : '';
  const options = (field.options as OptionMeta[] | undefined) ?? [];
  const placeholder = field.placeholder || messages?.selectPlaceholder || 'Chọn một tuỳ chọn';
  const noOptionsMessage = messages?.noDataAvailable || 'Không có tuỳ chọn khả dụng';
  const fieldId = `field-${field.name}`;
  const selectedOption = options.find((option) => option.value === stringValue);

  const handleChange = useCallback(
    (newValue: string) => {
      const validationError = validateFieldValue(newValue, field);
      if (validationError) {
        console.warn(`Validation error for ${field.name}:`, validationError);
      }
      onChange?.(newValue);
    },
    [field, onChange],
  );

  if (options.length === 0) {
    return (
      <FieldWrapper
        fieldId={fieldId}
        label={hideLabel ? undefined : field.label}
        required={field.required}
        error={error}
      >
        <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {noOptionsMessage}
        </div>
        <input type="hidden" name={field.name} value="" />
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper fieldId={fieldId} label={hideLabel ? undefined : field.label} required={field.required} error={error}>
      <Select value={stringValue || undefined} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            'text-left font-normal',
            'focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className,
          )}
        >
          <div
            className={cn(
              'flex w-full items-center gap-2 text-sm',
              selectedOption ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {selectedOption ? <OptionPreview option={selectedOption} /> : placeholder}
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-lg border border-input bg-popover p-1 shadow-lg">
          {options.map((option) => {
            const isActive = option.value === stringValue;

            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  'w-full rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent/40 text-foreground',
                )}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <OptionPreview option={option} />
                  <SelectionIndicator active={isActive} />
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <input type="hidden" name={field.name} value={stringValue} />
    </FieldWrapper>
  );
}

function OptionPreview({ option }: { option: OptionMeta }) {
  return (
    <span className="flex items-center gap-2 text-left text-sm text-foreground">
      {option.background_color && (
        <span
          className="h-2.5 w-2.5 rounded-full border border-border"
          style={{ backgroundColor: option.background_color }}
        />
      )}
      <span>{option.text}</span>
    </span>
  );
}

function SelectionIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-4 w-4 items-center justify-center rounded-full border transition-all',
        active ? 'border-primary' : 'border-input',
      )}
    >
      <span
        className={cn('h-2 w-2 rounded-full bg-primary transition-opacity', active ? 'opacity-100' : 'opacity-0')}
      />
    </span>
  );
}
