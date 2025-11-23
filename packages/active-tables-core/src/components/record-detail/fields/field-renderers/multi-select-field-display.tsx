/**
 * Multi-Select Field Display - Renders SELECT_LIST and CHECKBOX_LIST field types
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Badge } from '@workspace/ui/components/badge';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Text } from '@workspace/ui/components/typography/text';
import type { FieldConfig } from '../../../../types/field.js';

interface MultiSelectFieldDisplayProps {
  value: unknown;
  field?: FieldConfig;
}

/**
 * Display component for multi-select fields (SELECT_LIST, CHECKBOX_LIST)
 * Renders multiple badges with option colors
 *
 * @example
 * <MultiSelectFieldDisplay
 *   value={['option1', 'option2']}
 *   field={{
 *     type: 'SELECT_LIST',
 *     options: [
 *       { value: 'option1', text: 'Tag 1', background_color: '#10b981', text_color: '#ffffff' },
 *       { value: 'option2', text: 'Tag 2', background_color: '#3b82f6', text_color: '#ffffff' }
 *     ]
 *   }}
 * />
 */
export function MultiSelectFieldDisplay({ value, field }: MultiSelectFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Ensure value is an array
  const values = Array.isArray(value) ? value : [value];

  // Filter out empty values
  const selectedValues = values.filter((v) => v != null && v !== '').map(String);

  if (selectedValues.length === 0) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Find matching options
  const selectedOptions = selectedValues
    .map((val) => field?.options?.find((opt: { value: string; text: string }) => opt.value === val))
    .filter(
      (opt): opt is { value: string; text: string; background_color?: string; text_color?: string } => opt != null,
    );

  if (selectedOptions.length === 0) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  return (
    <Inline space="space-050" wrap>
      {selectedOptions.map((option, index) => {
        // Render badge with option colors if available
        if (option.background_color && option.text_color) {
          return (
            <Badge
              key={`${option.value}-${index}`}
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
        return (
          <Badge key={`${option.value}-${index}`} variant="outline">
            {option.text}
          </Badge>
        );
      })}
    </Inline>
  );
}
