/**
 * Select Field Display - Renders SELECT_ONE field type
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Badge } from '@workspace/ui/components/badge';
import { Text } from '@workspace/ui/components/typography/text';
import type { FieldConfig } from '../../../../types/field.js';

interface SelectFieldDisplayProps {
  value: unknown;
  field?: FieldConfig;
}

/**
 * Display component for single-select fields (SELECT_ONE)
 * Renders as badge with option colors
 *
 * @example
 * <SelectFieldDisplay
 *   value="option1"
 *   field={{
 *     type: 'SELECT_ONE',
 *     options: [
 *       { value: 'option1', text: 'Option 1', background_color: '#10b981', text_color: '#ffffff' }
 *     ]
 *   }}
 * />
 */
export function SelectFieldDisplay({ value, field }: SelectFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Find matching option
  const selectedValue = String(value);
  const option = field?.options?.find((opt: { value: string; text: string }) => opt.value === selectedValue);

  if (!option) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Render badge with option colors if available
  if (option.background_color && option.text_color) {
    return (
      <Badge
        style={{
          backgroundColor: option.background_color,
          color: option.text_color,
          borderColor: option.text_color + '33', // Add transparency for border
        }}
      >
        {option.text}
      </Badge>
    );
  }

  // Fallback to default badge
  return <Badge variant="outline">{option.text}</Badge>;
}
