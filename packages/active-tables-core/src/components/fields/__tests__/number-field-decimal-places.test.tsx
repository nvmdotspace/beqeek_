/**
 * Test file demonstrating decimalPlaces configuration for number fields
 */

import { describe, it, expect } from 'vitest';
import { formatFieldValue } from '../../../utils/field-formatter.js';
import { FIELD_TYPE_INTEGER, FIELD_TYPE_NUMERIC } from '../../../types/field.js';
import type { FieldConfig } from '../../../types/field.js';

describe('Number Field with decimalPlaces Configuration', () => {
  describe('formatFieldValue', () => {
    it('should format INTEGER with default 0 decimal places', () => {
      const field: FieldConfig = {
        type: FIELD_TYPE_INTEGER,
        label: 'Quantity',
        name: 'quantity',
        required: false,
      };

      expect(formatFieldValue(1234567, field)).toBe('1.234.567');
    });

    it('should format NUMERIC with default 2 decimal places', () => {
      const field: FieldConfig = {
        type: FIELD_TYPE_NUMERIC,
        label: 'Price',
        name: 'price',
        required: false,
      };

      expect(formatFieldValue(1234567.89, field)).toBe('1.234.567,89');
      expect(formatFieldValue(1234567.8, field)).toBe('1.234.567,8');
      expect(formatFieldValue(1234567, field)).toBe('1.234.567');
    });

    it('should format NUMERIC with custom decimalPlaces=4', () => {
      const field: FieldConfig = {
        type: FIELD_TYPE_NUMERIC,
        label: 'Exchange Rate',
        name: 'rate',
        required: false,
        decimalPlaces: 4,
      };

      expect(formatFieldValue(1.23456789, field)).toBe('1,2346');
      expect(formatFieldValue(1234.5678, field)).toBe('1.234,5678');
    });

    it('should format NUMERIC with decimalPlaces=0 (no decimals)', () => {
      const field: FieldConfig = {
        type: FIELD_TYPE_NUMERIC,
        label: 'Rounded Amount',
        name: 'amount',
        required: false,
        decimalPlaces: 0,
      };

      expect(formatFieldValue(1234567.89, field)).toBe('1.234.568'); // Rounded
    });

    it('should format NUMERIC with high precision decimalPlaces=6', () => {
      const field: FieldConfig = {
        type: FIELD_TYPE_NUMERIC,
        label: 'Scientific Value',
        name: 'value',
        required: false,
        decimalPlaces: 6,
      };

      expect(formatFieldValue(3.14159265359, field)).toBe('3,141593');
    });

    it('should override default for INTEGER with custom decimalPlaces (edge case)', () => {
      const field: FieldConfig = {
        type: FIELD_TYPE_INTEGER,
        label: 'ID',
        name: 'id',
        required: false,
        decimalPlaces: 2, // Unusual but supported
      };

      // INTEGER with decimalPlaces still formats as integer by default
      expect(formatFieldValue(1234, field)).toBe('1.234');
    });
  });

  describe('Display formatting examples', () => {
    it('should demonstrate Vietnamese number formatting', () => {
      // Example 1: Currency (2 decimal places)
      const currencyField: FieldConfig = {
        type: FIELD_TYPE_NUMERIC,
        label: 'Giá tiền',
        name: 'price',
        required: false,
        decimalPlaces: 2,
      };
      expect(formatFieldValue(1234567.5, currencyField)).toBe('1.234.567,5');

      // Example 2: Percentage (3 decimal places)
      const percentField: FieldConfig = {
        type: FIELD_TYPE_NUMERIC,
        label: 'Tỷ lệ',
        name: 'rate',
        required: false,
        decimalPlaces: 3,
      };
      expect(formatFieldValue(12.345, percentField)).toBe('12,345');

      // Example 3: Integer quantity
      const quantityField: FieldConfig = {
        type: FIELD_TYPE_INTEGER,
        label: 'Số lượng',
        name: 'qty',
        required: false,
      };
      expect(formatFieldValue(1000, quantityField)).toBe('1.000');
    });
  });
});
