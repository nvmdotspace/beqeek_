/**
 * Text Field Display - Renders SHORT_TEXT and TEXT field types
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';
import { FIELD_TYPE_TEXT } from '@workspace/beqeek-shared/constants';
import type { FieldConfig } from '../../../../types/field.js';

interface TextFieldDisplayProps {
  value: unknown;
  field?: FieldConfig;
}

/**
 * Display component for text fields (SHORT_TEXT, TEXT)
 *
 * @example
 * <TextFieldDisplay value="Hello world" />
 * <TextFieldDisplay value="Line 1\nLine 2" field={{ type: 'TEXT' }} />
 */
export function TextFieldDisplay({ value, field }: TextFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const stringValue = String(value);

  // For TEXT type, preserve line breaks
  if (field?.type === FIELD_TYPE_TEXT && stringValue.includes('\n')) {
    return (
      <Text as="div" className="whitespace-pre-wrap">
        {stringValue}
      </Text>
    );
  }

  // For SHORT_TEXT or single-line text
  return <Text>{stringValue}</Text>;
}
