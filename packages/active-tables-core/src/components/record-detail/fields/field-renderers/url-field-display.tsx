/**
 * URL Field Display - Renders URL field type with external link
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';
import { ExternalLink } from 'lucide-react';

interface UrlFieldDisplayProps {
  value: unknown;
}

/**
 * Display component for URL fields
 * Renders as clickable link with hostname and external icon
 *
 * @example
 * <UrlFieldDisplay value="https://example.com/page" />
 */
export function UrlFieldDisplay({ value }: UrlFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const url = String(value).trim();
  let hostname = url;
  let isValidUrl = false;

  // Try to extract hostname
  try {
    const urlObj = new URL(url);
    hostname = urlObj.hostname;
    isValidUrl = true;
  } catch {
    // If URL parsing fails, use the full value
    hostname = url;
  }

  return (
    <a
      href={isValidUrl ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
    >
      <Text as="span" color="primary">
        {hostname}
      </Text>
      <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  );
}
