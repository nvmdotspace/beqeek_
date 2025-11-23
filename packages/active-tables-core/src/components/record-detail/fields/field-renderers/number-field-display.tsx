/**
 * Number Field Display - Renders INTEGER and NUMERIC field types
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';
import { FIELD_TYPE_NUMERIC } from '@workspace/beqeek-shared/constants';
import type { FieldConfig } from '../../../../types/field.js';

interface NumberFieldDisplayProps {
  value: unknown;
  field?: FieldConfig;
}

/**
 * Display component for number fields (INTEGER, NUMERIC)
 * Formats with thousands separator (Vietnamese: dot) and decimal places
 *
 * @example
 * <NumberFieldDisplay value={1234567} field={{ type: 'INTEGER' }} />
 * // Output: "1.234.567"
 *
 * <NumberFieldDisplay value={1234.56789} field={{ type: 'NUMERIC', decimalPlaces: 2 }} />
 * // Output: "1.234,57"
 */
export function NumberFieldDisplay({ value, field }: NumberFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));

  // Handle invalid numbers
  if (isNaN(numValue)) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Determine decimal places
  let decimalPlaces = 0;
  if (field?.type === FIELD_TYPE_NUMERIC) {
    decimalPlaces = field.decimalPlaces ?? 2;
  }

  // Format number with Vietnamese locale (dot for thousands, comma for decimal)
  const formatted = numValue.toLocaleString('vi-VN', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return (
    <Text as="span" className="tabular-nums text-right">
      {formatted}
    </Text>
  );
}
