/**
 * Date Field Display - Renders DATE field type
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';

interface DateFieldDisplayProps {
  value: unknown;
}

/**
 * Display component for date fields
 * Formats as localized date string
 *
 * @example
 * <DateFieldDisplay value="2025-11-18" />
 * // Output (vi): "18 Th11 2025"
 * // Output (en): "Nov 18, 2025"
 */
export function DateFieldDisplay({ value }: DateFieldDisplayProps) {
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

    // Format date
    const formatted = date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return <Text>{formatted}</Text>;
  } catch {
    return <Text className="text-muted-foreground">-</Text>;
  }
}
