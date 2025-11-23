/**
 * Email Field Display - Renders EMAIL field type with mailto link
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';
import { ExternalLink } from 'lucide-react';

interface EmailFieldDisplayProps {
  value: unknown;
}

/**
 * Display component for email fields
 * Renders as clickable mailto link with icon
 *
 * @example
 * <EmailFieldDisplay value="user@example.com" />
 */
export function EmailFieldDisplay({ value }: EmailFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const email = String(value).trim();

  return (
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center gap-1 text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
    >
      <Text as="span" color="primary">
        {email}
      </Text>
      <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  );
}
