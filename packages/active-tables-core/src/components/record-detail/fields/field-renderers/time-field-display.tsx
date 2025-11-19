/**
 * Time Field Display - Renders TIME field type
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';

interface TimeFieldDisplayProps {
  value: unknown;
}

/**
 * Display component for time fields
 * Formats as HH:MM:SS in 24-hour format
 *
 * @example
 * <TimeFieldDisplay value="14:30:45" />
 * // Output: "14:30:45"
 */
export function TimeFieldDisplay({ value }: TimeFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const timeString = String(value);

  // Try to parse as time (HH:MM:SS or HH:MM)
  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const hours = timeMatch[1] || '00';
    const minutes = timeMatch[2] || '00';
    const seconds = timeMatch[3] || '00';
    const formatted = `${hours.padStart(2, '0')}:${minutes}:${seconds}`;
    return <Text className="tabular-nums">{formatted}</Text>;
  }

  // Try to parse as full datetime and extract time
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      const formatted = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      return <Text className="tabular-nums">{formatted}</Text>;
    }
  } catch {
    // Fall through to display raw value
  }

  // Fallback to raw value
  return <Text className="tabular-nums">{timeString}</Text>;
}
