/**
 * Rich Text Field Display - Renders RICH_TEXT field type with HTML content
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Text } from '@workspace/ui/components/typography/text';

interface RichTextFieldDisplayProps {
  value: unknown;
}

/**
 * Display component for rich text fields with HTML content
 * Uses dangerouslySetInnerHTML to render formatted content
 *
 * @example
 * <RichTextFieldDisplay value="<p>Hello <strong>world</strong></p>" />
 */
export function RichTextFieldDisplay({ value }: RichTextFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const htmlContent = String(value);

  // Basic sanitization: strip script tags (basic protection)
  // Note: For production, consider using a library like DOMPurify
  const sanitizedContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
