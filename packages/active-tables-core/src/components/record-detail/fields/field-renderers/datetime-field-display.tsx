/**
 * DateTime Field Display - Renders DATETIME field type
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';

interface DateTimeFieldDisplayProps {
  value: unknown;
}

/**
 * Display component for datetime fields
 * Formats as localized date and time string
 *
 * @example
 * <DateTimeFieldDisplay value="2025-11-18T14:30:00Z" />
 * // Output (vi): "18 Th11 2025, 21:30:00"
 * // Output (en): "Nov 18, 2025, 2:30:00 PM"
 */
export function DateTimeFieldDisplay({ value }: DateTimeFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  try {
    const date = new Date(String(value));

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return <Text className="text-muted-foreground">-</Text>;
    }

    // Get locale from document or default to Vietnamese
    const locale = document.documentElement.lang || 'vi';

    // Format datetime
    const formatted = date.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return <Text>{formatted}</Text>;
  } catch {
    return <Text className="text-muted-foreground">-</Text>;
  }
}
