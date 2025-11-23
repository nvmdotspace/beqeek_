/**
 * CheckboxListField Component
 *
 * Redesigned checklist surfaced as a card list that follows the design system tokens.
 */

import { useCallback, useMemo } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';

interface OptionMeta {
  value: string;
  text: string;
  text_color?: string;
  background_color?: string;
}

function orderValues(valueSet: Set<string>, options?: OptionMeta[]) {
  if (!options?.length) {
    return Array.from(valueSet);
  }

  return options.map((option) => option.value).filter((value) => valueSet.has(value));
}

export function CheckboxListField(props: FieldRendererProps) {
  const { field, value, onChange, disabled = false, error, className, messages, hideLabel = false } = props;

  const rawValues = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);
  const selectedValues = useMemo(() => rawValues.map((val) => String(val)), [rawValues]);

  const fieldId = `field-${field.name}`;
  const options = (field.options as OptionMeta[] | undefined) ?? [];
  const noOptionsMessage = messages?.noDataAvailable || 'Không có tuỳ chọn khả dụng';

  const handleToggleOption = useCallback(
    (optionValue: string, nextState: boolean | 'indeterminate') => {
      if (nextState === 'indeterminate') {
        return;
      }

      const valueSet = new Set(selectedValues);
      if (nextState) {
        valueSet.add(optionValue);
      } else {
        valueSet.delete(optionValue);
      }

      const newValues = orderValues(valueSet, options);
      const validationResult = validateFieldValue(newValues, field);
      if (!validationResult.valid && validationResult.error) {
        console.warn(`Validation error for ${field.name}:`, validationResult.error);
      }

      onChange?.(newValues);
    },
    [selectedValues, field, onChange, options],
  );

  const containerClasses = cn(
    'overflow-hidden rounded-2xl border border-input/80 bg-card shadow-sm transition-all',
    'divide-y divide-border/60',
    disabled && 'cursor-not-allowed opacity-60',
    error && 'border-destructive ring-1 ring-destructive/20',
    className,
  );

  return (
    <FieldWrapper fieldId={fieldId} label={hideLabel ? undefined : field.label} required={field.required} error={error}>
      {options.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {noOptionsMessage}
        </div>
      ) : (
        <div className={containerClasses}>
          {options.map((option, index) => {
            const optionId = `${fieldId}-${option.value}-${index}`;
            const isChecked = selectedValues.includes(option.value);

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  'focus-within:bg-accent/40 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
                  !disabled && 'hover:bg-accent/30',
                  isChecked && 'bg-accent/25',
                )}
              >
                <Checkbox
                  id={optionId}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleToggleOption(option.value, checked)}
                  disabled={disabled}
                  aria-labelledby={`${optionId}-label`}
                />

                <div className="flex flex-1 items-center gap-3">
                  {option.background_color && (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: option.background_color }}
                    />
                  )}
                  <span
                    id={`${optionId}-label`}
                    className="font-medium text-foreground"
                    style={
                      option.text_color
                        ? {
                            color: option.text_color,
                          }
                        : undefined
                    }
                  >
                    {option.text}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}

      <input type="hidden" name={field.name} value={selectedValues.join(',')} />
    </FieldWrapper>
  );
}
