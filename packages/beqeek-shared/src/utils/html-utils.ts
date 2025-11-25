/**
 * HTML Utilities
 *
 * Common utilities for handling HTML content across the platform.
 * Used for sanitizing rich text content before processing (e.g., hashing keywords).
 */

/**
 * Strip HTML tags from content to get plain text
 * Preserves text content while removing all HTML markup
 *
 * @example
 * ```typescript
 * stripHtmlTags('<p>Hello <strong>world</strong></p>')
 * // Returns: 'Hello world'
 *
 * stripHtmlTags('<div>Line 1</div><div>Line 2</div>')
 * // Returns: 'Line 1 Line 2'
 * ```
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ') // Replace HTML tags with space
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&lt;/g, '<') // Decode common HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Check if a string contains HTML tags
 *
 * @example
 * ```typescript
 * containsHtml('<p>Hello</p>') // true
 * containsHtml('Hello world')  // false
 * ```
 */
export function containsHtml(text: string): boolean {
  if (!text) return false;
  return /<[^>]+>/.test(text);
}
