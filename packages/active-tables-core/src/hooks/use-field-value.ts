/**
 * useFieldValue Hook
 *
 * Hook for managing field value state and validation
 */

import { useState, useCallback } from 'react';
import type { FieldConfig } from '../types/field.js';

export interface UseFieldValueOptions {
  field: FieldConfig;
  initialValue?: unknown;
  onChange?: (value: unknown) => void;
}

export interface UseFieldValueReturn {
  value: unknown;
  setValue: (value: unknown) => void;
  error: string | null;
  isValid: boolean;
  validate: () => boolean;
  reset: () => void;
}

/**
 * Hook for managing field value with validation
 *
 * @example
 * ```tsx
 * const { value, setValue, error, isValid } = useFieldValue({
 *   field: { name: 'email', type: 'EMAIL', label: 'Email', required: true },
 *   initialValue: ''
 * });
 * ```
 */
export function useFieldValue(options: UseFieldValueOptions): UseFieldValueReturn {
  const { field, initialValue, onChange } = options;

  const [value, setValueState] = useState<unknown>(initialValue);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((): boolean => {
    // Basic validation
    if (field.required && !value) {
      setError('This field is required');
      return false;
    }

    setError(null);
    return true;
  }, [field, value]);

  const setValue = useCallback(
    (newValue: unknown) => {
      setValueState(newValue);
      onChange?.(newValue);
      setError(null);
    },
    [onChange]
  );

  const reset = useCallback(() => {
    setValueState(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    setValue,
    error,
    isValid: !error,
    validate,
    reset,
  };
}
