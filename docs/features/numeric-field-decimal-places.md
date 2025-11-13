# Numeric Field Decimal Places Configuration

## Overview

This document describes the configurable `decimalPlaces` feature for numeric fields in Active Tables, allowing precise control over decimal precision for both `INTEGER` and `NUMERIC` field types.

## Implementation Date

2025-11-13

## Motivation

Previously, numeric field formatting was hardcoded:

- **NUMERIC**: Displayed up to 10 decimal places
- **INTEGER**: Displayed 0 decimal places

This lacked flexibility for use cases requiring specific precision:

- Currency (2 decimals)
- Scientific calculations (4-6 decimals)
- Exchange rates (4 decimals)
- Percentages (2-3 decimals)

## Changes Made

### 1. Schema Changes

Added optional `decimalPlaces` property to field configuration:

**Location**: `packages/beqeek-shared/src/types/table-config-types.ts`

```typescript
export interface BaseFieldConfig {
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: FieldDefaultValue;
  required: boolean;
  /**
   * Number of decimal places for NUMERIC fields
   * Default: 2 for NUMERIC, 0 for INTEGER
   * Range: 0-10
   */
  decimalPlaces?: number;
}
```

**Location**: `packages/active-tables-core/src/types/field.ts`

```typescript
export interface FieldConfig {
  type: FieldType;
  label: string;
  name: string;
  // ... other properties
  /**
   * Number of decimal places for NUMERIC fields
   * Default: 2 for NUMERIC, 0 for INTEGER
   * Range: 0-10
   */
  decimalPlaces?: number;
}
```

### 2. Component Updates

**NumberField Component** (`packages/active-tables-core/src/components/fields/number-field.tsx`):

**Display Mode:**

```typescript
// Determine decimal places
const isNumeric = field.type === FIELD_TYPES.NUMERIC;
const decimalPlaces = field.decimalPlaces ?? (isNumeric ? 2 : 0);

// Format numbers with Vietnamese locale (dot for thousands, comma for decimal)
const formatted = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: isNumeric ? 0 : 0,
  maximumFractionDigits: decimalPlaces,
}).format(Number(numericValue));
```

**Edit Mode:**

```typescript
const isNumeric = field.type === FIELD_TYPES.NUMERIC;
const decimalPlaces = field.decimalPlaces ?? (isNumeric ? 2 : 0);

// Calculate step based on decimal places
// For decimalPlaces=2: step=0.01, for decimalPlaces=3: step=0.001, etc.
const step = isNumeric && decimalPlaces > 0 ? Math.pow(10, -decimalPlaces).toString() : '1';
```

**Field Formatter Utility** (`packages/active-tables-core/src/utils/field-formatter.ts`):

```typescript
case FIELD_TYPE_INTEGER:
case FIELD_TYPE_NUMERIC: {
  if (typeof value === 'number') {
    const isNumeric = field.type === FIELD_TYPE_NUMERIC;
    const decimalPlaces = field.decimalPlaces ?? (isNumeric ? 2 : 0);

    // Format with Vietnamese locale (dot for thousands, comma for decimal)
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: isNumeric ? 0 : 0,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  }
  return String(value);
}
```

## Usage Examples

### 1. Currency Field (2 decimals - default)

```typescript
const priceField: FieldConfig = {
  type: FIELD_TYPE_NUMERIC,
  label: 'Giá tiền',
  name: 'price',
  required: false,
  // decimalPlaces: 2 (default, can be omitted)
};

// Input: 1234567.50
// Display: 1.234.567,5
// Edit step: 0.01
```

### 2. Exchange Rate (4 decimals)

```typescript
const exchangeRateField: FieldConfig = {
  type: FIELD_TYPE_NUMERIC,
  label: 'Tỷ giá',
  name: 'exchange_rate',
  required: false,
  decimalPlaces: 4,
};

// Input: 23456.7891
// Display: 23.456,7891
// Edit step: 0.0001
```

### 3. Percentage (3 decimals)

```typescript
const percentField: FieldConfig = {
  type: FIELD_TYPE_NUMERIC,
  label: 'Tỷ lệ %',
  name: 'percentage',
  required: false,
  decimalPlaces: 3,
};

// Input: 12.345
// Display: 12,345
// Edit step: 0.001
```

### 4. Scientific Precision (6 decimals)

```typescript
const scientificField: FieldConfig = {
  type: FIELD_TYPE_NUMERIC,
  label: 'Giá trị khoa học',
  name: 'value',
  required: false,
  decimalPlaces: 6,
};

// Input: 3.14159265359
// Display: 3,141593
// Edit step: 0.000001
```

### 5. Rounded Amount (0 decimals)

```typescript
const roundedField: FieldConfig = {
  type: FIELD_TYPE_NUMERIC,
  label: 'Số tiền làm tròn',
  name: 'rounded_amount',
  required: false,
  decimalPlaces: 0,
};

// Input: 1234567.89
// Display: 1.234.568 (rounded)
// Edit step: 1
```

### 6. Integer Quantity (default 0 decimals)

```typescript
const quantityField: FieldConfig = {
  type: FIELD_TYPE_INTEGER,
  label: 'Số lượng',
  name: 'quantity',
  required: false,
  // decimalPlaces: 0 (default for INTEGER)
};

// Input: 1000
// Display: 1.000
// Edit step: 1
```

## Formatting Behavior

### Vietnamese Number Format (vi-VN)

The implementation uses `Intl.NumberFormat('vi-VN')` for consistent Vietnamese formatting:

- **Thousand separator**: `.` (dot)
- **Decimal separator**: `,` (comma)

Examples:

- `1234567.89` → `1.234.567,89`
- `1000` → `1.000`
- `0.5` → `0,5`

### Default Values

| Field Type | Default `decimalPlaces` | Behavior                                  |
| ---------- | ----------------------- | ----------------------------------------- |
| `INTEGER`  | `0`                     | No decimals, whole numbers only           |
| `NUMERIC`  | `2`                     | Up to 2 decimal places (currency default) |

### Edge Cases

1. **No `decimalPlaces` specified**: Uses default (2 for NUMERIC, 0 for INTEGER)
2. **`decimalPlaces: 0` on NUMERIC**: Functions like INTEGER (rounds to whole number)
3. **Large `decimalPlaces` (>10)**: Supported but capped by `Intl.NumberFormat` limits
4. **Negative `decimalPlaces`**: Not validated (behavior undefined, should add validation)

## HTML5 Input Step Attribute

The edit mode calculates the `step` attribute dynamically:

| `decimalPlaces` | Step Value   | Example                       |
| --------------- | ------------ | ----------------------------- |
| 0               | `"1"`        | Whole numbers only            |
| 1               | `"0.1"`      | 1 decimal place               |
| 2               | `"0.01"`     | 2 decimal places (currency)   |
| 3               | `"0.001"`    | 3 decimal places              |
| 4               | `"0.0001"`   | 4 decimal places (rates)      |
| 6               | `"0.000001"` | 6 decimal places (scientific) |

Formula: `step = 10^(-decimalPlaces)`

## Migration Notes

### Backward Compatibility

- ✅ **Fully backward compatible**: Existing fields without `decimalPlaces` use defaults
- ✅ **No database migration needed**: Property is optional
- ✅ **Existing data unaffected**: Only changes display/input behavior

### API Changes

No breaking changes to API contracts. The `decimalPlaces` property is:

- Optional in all interfaces
- Ignored if not provided (uses defaults)
- Can be added to existing fields without affecting existing records

## Testing

### Unit Tests

Location: `packages/active-tables-core/src/components/fields/__tests__/number-field-decimal-places.test.tsx`

Covers:

- Default behavior (2 for NUMERIC, 0 for INTEGER)
- Custom decimal places (0, 2, 4, 6)
- Vietnamese formatting
- Edge cases

### Manual Testing Checklist

- [ ] Create table with NUMERIC field (default 2 decimals)
- [ ] Create table with NUMERIC field (custom 4 decimals)
- [ ] Create table with INTEGER field (default 0 decimals)
- [ ] Enter values and verify display formatting
- [ ] Verify edit mode respects step attribute
- [ ] Test with Vietnamese locale
- [ ] Test kanban/gantt views render formatted numbers
- [ ] Test record list displays formatted numbers
- [ ] Test encryption/decryption preserves precision

## Future Enhancements

### 1. UI for Decimal Places Configuration

Add field configuration UI in table schema editor:

```tsx
// Schema editor component
{
  field.type === FIELD_TYPE_NUMERIC && (
    <div className="form-group">
      <label>Decimal Places</label>
      <input
        type="number"
        min="0"
        max="10"
        value={field.decimalPlaces ?? 2}
        onChange={(e) => updateField({ decimalPlaces: Number(e.target.value) })}
      />
      <span className="help-text">Number of decimal places to display (0-10). Default: 2</span>
    </div>
  );
}
```

### 2. Validation

Add validation for `decimalPlaces` range:

```typescript
// In field-validation.ts
export function validateDecimalPlaces(decimalPlaces?: number): string | null {
  if (decimalPlaces === undefined) return null;

  if (decimalPlaces < 0 || decimalPlaces > 10) {
    return 'Decimal places must be between 0 and 10';
  }

  if (!Number.isInteger(decimalPlaces)) {
    return 'Decimal places must be an integer';
  }

  return null;
}
```

### 3. Locale-Aware Formatting

Allow users to configure locale per field:

```typescript
export interface BaseFieldConfig {
  // ... existing properties
  decimalPlaces?: number;
  locale?: string; // e.g., 'vi-VN', 'en-US', 'de-DE'
}
```

### 4. Rounding Mode Configuration

Add control over rounding behavior:

```typescript
export interface BaseFieldConfig {
  // ... existing properties
  decimalPlaces?: number;
  roundingMode?: 'ceil' | 'floor' | 'round' | 'trunc';
}
```

## Related Files

- `packages/beqeek-shared/src/types/table-config-types.ts` - Schema definition
- `packages/active-tables-core/src/types/field.ts` - Field config interface
- `packages/active-tables-core/src/components/fields/number-field.tsx` - Number field component
- `packages/active-tables-core/src/utils/field-formatter.ts` - Field formatting utility
- `packages/active-tables-core/src/components/fields/__tests__/number-field-decimal-places.test.tsx` - Tests

## References

- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [HTML5 input step attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/step)
- [Vietnamese number formatting conventions](https://en.wikipedia.org/wiki/Decimal_separator#Countries_using_decimal_comma)
