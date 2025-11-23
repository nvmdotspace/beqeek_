/**
 * MultiSelectField Component
 *
 * Renders SELECT_LIST field type with custom multi-select UI using shadcn/ui components
 * Better UX than native <select multiple> with visual tags and checkboxes
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';

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

export function MultiSelectField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className, hideLabel = false } = props;

  // Normalize value to array
  const selectedValues = (Array.isArray(value) ? value : value ? [value] : []) as string[];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOption = useCallback(
    (optionValue: string) => {
      // Read current values fresh from props to avoid stale closure
      const currentValues = (Array.isArray(value) ? value : value ? [value] : []) as string[];

      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];

      const validationResult = validateFieldValue(newValues, field);
      if (!validationResult.valid && validationResult.error) {
        console.warn(`Validation error for ${field.name}:`, validationResult.error);
      }

      onChange?.(newValues);
    },
    [value, onChange, field],
  );

  const handleRemoveValue = useCallback(
    (optionValue: string) => {
      // Read current values fresh from props to avoid stale closure
      const currentValues = (Array.isArray(value) ? value : value ? [value] : []) as string[];

      const newValues = currentValues.filter((v) => v !== optionValue);
      onChange?.(newValues);
    },
    [value, onChange],
  );

  // Edit mode only
  const fieldId = `field-${field.name}`;

  return (
    <FieldWrapper fieldId={fieldId} label={hideLabel ? undefined : field.label} required={field.required} error={error}>
      <div ref={dropdownRef} className="relative">
        {/* Selected values display */}
        <div
          className={cn(
            'min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
            'flex flex-wrap items-center gap-2 pr-6',
            'cursor-pointer transition-all',
            'focus-within:outline-none focus-within:ring-1 focus-within:ring-inset focus-within:ring-ring',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive focus-within:ring-destructive/40',
            className,
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              !disabled && setIsOpen(!isOpen);
            }
          }}
        >
          {selectedValues.length === 0 ? (
            <span className="text-muted-foreground">
              {field.placeholder || props.messages?.selectPlaceholder || 'Chọn các thẻ'}
            </span>
          ) : (
            selectedValues.map((val) => {
              const option = field.options?.find((opt: { value: string }) => opt.value === val);

              return (
                <Badge
                  key={val}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1 text-xs"
                  style={
                    option?.background_color
                      ? {
                          backgroundColor: option.background_color,
                          color: option.text_color || 'inherit',
                        }
                      : undefined
                  }
                >
                  <span className="max-w-[120px] truncate">{option?.text || val}</span>
                  <button
                    type="button"
                    className="ml-1 rounded-sm p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled) {
                        handleRemoveValue(val);
                      }
                    }}
                    disabled={disabled}
                    aria-label={props.messages?.remove || 'Remove'}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              );
            })
          )}

          {/* Dropdown arrow */}
          <svg
            className={cn(
              'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60 transition-transform',
              isOpen && 'rotate-180',
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown options */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 z-50 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-input bg-popover text-popover-foreground shadow-lg">
            <div className="p-1">
              {field.options?.map((option: OptionMeta) => {
                const isSelected = selectedValues.includes(option.value);

                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleOption(option.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleToggleOption(option.value);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm outline-none',
                      'transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring/30',
                      isSelected && 'bg-accent/30',
                    )}
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none mt-0.5" aria-hidden="true" />
                    <span className="flex flex-1 items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={
                          option.background_color
                            ? {
                                backgroundColor: option.background_color,
                                color: option.text_color || 'inherit',
                              }
                            : undefined
                        }
                      >
                        {option.text}
                      </Badge>
                    </span>
                    {isSelected && (
                      <span
                        className={cn('h-4 w-4 rounded-full border transition-all', 'border-primary bg-primary/10')}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <input type="hidden" name={field.name} value={selectedValues.join(',')} />
    </FieldWrapper>
  );
}
