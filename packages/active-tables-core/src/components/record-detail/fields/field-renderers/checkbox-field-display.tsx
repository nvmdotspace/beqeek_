/**
 * Checkbox Field Display - Renders CHECKBOX_YES_NO and CHECKBOX_ONE field types
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Badge } from '@workspace/ui/components/badge';
import { Text } from '@workspace/ui/components/typography/text';
import { FIELD_TYPE_CHECKBOX_YES_NO } from '@workspace/beqeek-shared/constants';
import type { FieldConfig } from '../../../../types/field.js';

interface CheckboxFieldDisplayProps {
  value: unknown;
  field?: FieldConfig;
}

/**
 * Display component for checkbox fields (CHECKBOX_YES_NO, CHECKBOX_ONE)
 * Renders as badge with appropriate color and text
 *
 * @example
 * <CheckboxFieldDisplay value={true} field={{ type: 'CHECKBOX_YES_NO' }} />
 * // Output: Green badge "Yes"
 *
 * <CheckboxFieldDisplay value="option1" field={{ type: 'CHECKBOX_ONE', options: [...] }} />
 * // Output: Badge with option text
 */
export function CheckboxFieldDisplay({ value, field }: CheckboxFieldDisplayProps) {
  // Handle CHECKBOX_YES_NO
  if (field?.type === FIELD_TYPE_CHECKBOX_YES_NO) {
    const isChecked = Boolean(value);
    const locale = document.documentElement.lang || 'vi';
    const yesText = locale === 'vi' ? 'Có' : 'Yes';
    const noText = locale === 'vi' ? 'Không' : 'No';

    return <Badge variant={isChecked ? 'success' : 'secondary'}>{isChecked ? yesText : noText}</Badge>;
  }

  // Handle CHECKBOX_ONE (single option selection)
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
