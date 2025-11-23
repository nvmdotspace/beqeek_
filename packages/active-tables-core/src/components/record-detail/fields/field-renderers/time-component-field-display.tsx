/**
 * Time Component Field Display - Renders YEAR, MONTH, DAY, HOUR, MINUTE, SECOND field types
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';
import {
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
  type FieldType,
} from '@workspace/beqeek-shared/constants';

interface TimeComponentFieldDisplayProps {
  value: unknown;
  componentType: FieldType;
}

/**
 * Get unit label for time component type
 */
function getUnitLabel(componentType: FieldType, locale: string): string {
  if (locale === 'vi') {
    switch (componentType) {
      case FIELD_TYPE_YEAR:
        return 'năm';
      case FIELD_TYPE_MONTH:
        return 'tháng';
      case FIELD_TYPE_DAY:
        return 'ngày';
      case FIELD_TYPE_HOUR:
        return 'giờ';
      case FIELD_TYPE_MINUTE:
        return 'phút';
      case FIELD_TYPE_SECOND:
        return 'giây';
      default:
        return '';
    }
  } else {
    // English labels
    switch (componentType) {
      case FIELD_TYPE_YEAR:
        return 'year';
      case FIELD_TYPE_MONTH:
        return 'month';
      case FIELD_TYPE_DAY:
        return 'day';
      case FIELD_TYPE_HOUR:
        return 'hour';
      case FIELD_TYPE_MINUTE:
        return 'minute';
      case FIELD_TYPE_SECOND:
        return 'second';
      default:
        return '';
    }
  }
}

/**
 * Display component for time component fields (YEAR, MONTH, DAY, HOUR, MINUTE, SECOND)
 * Displays numeric value with appropriate unit label
 *
 * @example
 * <TimeComponentFieldDisplay value={2025} componentType="YEAR" />
 * // Output (vi): "2025 năm"
 * // Output (en): "2025 year"
 */
export function TimeComponentFieldDisplay({ value, componentType }: TimeComponentFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));

  // Handle invalid numbers
  if (isNaN(numValue)) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Get locale from document or default to Vietnamese
  const locale = document.documentElement.lang || 'vi';
  const unitLabel = getUnitLabel(componentType, locale);

  return (
    <Text className="tabular-nums">
      {numValue} {unitLabel}
    </Text>
  );
}
