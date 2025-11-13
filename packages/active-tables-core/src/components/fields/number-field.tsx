/**
 * NumberField Component
 *
 * Renders INTEGER and NUMERIC fields with real-time Vietnamese formatting
 * - Thousands separator: dot (.) - e.g., 1.234.567
 * - Decimal separator: comma (,) - e.g., 1.234,56
 * - Format as user types for better UX
 */

import { useCallback, useState } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';

export function NumberField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const isNumeric = field.type === FIELD_TYPES.NUMERIC;
  const decimalPlaces = field.decimalPlaces ?? (isNumeric ? 2 : 0);

  // Track cursor position for proper cursor placement after formatting
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // Display mode: Format number with Vietnamese locale
  if (mode === 'display') {
    if (value == null || value === '') {
      return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
    }

    const formatted = new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(value));

    return <span>{formatted}</span>;
  }

  /**
   * Format number with Vietnamese locale while typing
   * @param numStr - Raw number string (can be incomplete like "123." or "-")
   * @param allowDecimal - Whether to allow decimal point
   */
  const formatVietnamese = (numStr: string, allowDecimal: boolean): string => {
    if (!numStr || numStr === '-') return numStr;

    // Split into integer and decimal parts
    const parts = numStr.split('.');
    const integerPart = parts[0] || '';
    const decimalPart = parts[1];

    // Format integer part with thousands separator
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Add decimal part if exists
    if (allowDecimal && decimalPart !== undefined) {
      // Limit decimal places
      const limitedDecimal = decimalPart.slice(0, decimalPlaces);
      return `${formatted},${limitedDecimal}`;
    }

    return formatted;
  };

  /**
   * Parse Vietnamese formatted string to raw number string
   * Example: "1.234,56" -> "1234.56"
   */
  const parseVietnamese = (formatted: string): string => {
    return formatted
      .replace(/\./g, '') // Remove thousands separator
      .replace(/,/g, '.'); // Convert decimal separator
  };

  /**
   * Convert stored numeric value to formatted display string
   */
  const getDisplayValue = (): string => {
    if (value == null || value === '') return '';

    const numStr = String(value);
    const hasDecimal = numStr.includes('.');

    // For NUMERIC fields or if value has decimals, format with decimal support
    if (isNumeric || hasDecimal) {
      return formatVietnamese(numStr, true);
    }

    // For INTEGER, format without decimals
    return formatVietnamese(numStr, false);
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const rawInput = input.value;
      const selectionStart = input.selectionStart || 0;

      // Allow empty
      if (rawInput === '') {
        onChange?.('');
        return;
      }

      // Remove all formatting to get raw input
      const cleaned = parseVietnamese(rawInput);

      // Allow only valid characters: digits, minus, dot
      if (!/^-?\d*\.?\d*$/.test(cleaned)) {
        return; // Reject invalid input
      }

      // Handle minus sign: only at start
      if (cleaned.includes('-') && !cleaned.startsWith('-')) {
        return;
      }

      // For INTEGER: don't allow decimal point
      if (!isNumeric && cleaned.includes('.')) {
        return;
      }

      // Handle incomplete input
      if (cleaned === '-' || cleaned === '.') {
        onChange?.('');
        return;
      }

      // Parse to number
      const parsed = parseFloat(cleaned);

      // Validate parsing
      if (isNaN(parsed)) {
        return;
      }

      // For NUMERIC: check decimal places limit
      if (isNumeric && cleaned.includes('.')) {
        const decimalPart = cleaned.split('.')[1];
        if (decimalPart && decimalPart.length > decimalPlaces) {
          return; // Don't allow more decimal places
        }
      }

      // Calculate cursor position after formatting
      // Count dots before cursor in old string
      const beforeCursor = rawInput.slice(0, selectionStart);
      const dotsBeforeCursor = (beforeCursor.match(/\./g) || []).length;

      // Format the new value
      const formatted = formatVietnamese(cleaned, isNumeric);

      // Count dots before same position in new string
      const newDotsBeforeCursor = (formatted.slice(0, selectionStart).match(/\./g) || []).length;

      // Adjust cursor position based on added/removed dots
      const newCursorPos = selectionStart + (newDotsBeforeCursor - dotsBeforeCursor);
      setCursorPosition(newCursorPos);

      // Store raw number value
      onChange?.(parsed);

      // Update cursor position after React updates DOM
      setTimeout(() => {
        if (input && newCursorPos !== null) {
          input.setSelectionRange(newCursorPos, newCursorPos);
        }
        setCursorPosition(null);
      }, 0);
    },
    [onChange, isNumeric, decimalPlaces],
  );

  const displayValue = getDisplayValue();
  const fieldId = `field-${field.name}`;

  const inputClasses = `
    w-full px-3 py-2
    text-sm
    border border-input rounded-lg
    bg-background text-foreground
    transition-all
    placeholder:text-muted-foreground
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring
    disabled:cursor-not-allowed disabled:opacity-50
    aria-invalid:border-destructive
    ${className || ''}
  `.trim();

  // Placeholder with format hint
  const placeholder =
    field.placeholder ||
    (isNumeric
      ? decimalPlaces > 0
        ? `Ví dụ: 1.234,56 (${decimalPlaces} chữ số thập phân)`
        : 'Ví dụ: 1.234,56'
      : 'Ví dụ: 1.234');

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <input
        type="text"
        inputMode="decimal"
        id={fieldId}
        name={field.name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={field.required}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    </FieldWrapper>
  );
}
