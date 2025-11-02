/**
 * UUID v7 Generator
 *
 * Generates UUID v7 (time-ordered) identifiers as specified in RFC draft.
 * Format: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
 *
 * Benefits:
 * - Sortable by creation time (timestamp prefix)
 * - Globally unique
 * - Database-friendly indexing
 *
 * Based on: api-integration-create-active-table.md Section 7.2
 */

/**
 * Generate a UUID v7 identifier
 *
 * @returns UUID v7 string (e.g., "019a442e-1a78-7000-8000-123456789abc")
 *
 * @example
 * ```typescript
 * const actionId = generateUUIDv7();
 * // "019a442e-1a78-7c5c-8aad-9ed6dcf2879f"
 * ```
 */
export function generateUUIDv7(): string {
  // Get current timestamp in milliseconds
  const timestamp = Date.now();

  // Convert to hex (12 characters for 48-bit timestamp)
  const timestampHex = timestamp.toString(16).padStart(12, '0');

  // Generate 16 random bytes
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  // Set version to 7 (bits 48-51 = 0111)
  randomBytes[6] = (randomBytes[6]! & 0x0f) | 0x70;

  // Set variant to RFC 4122 (bits 64-65 = 10)
  randomBytes[8] = (randomBytes[8]! & 0x3f) | 0x80;

  // Convert bytes to hex
  const hex = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0'));

  // Format: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
  return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-7${hex[6]!.slice(1)}-${hex[8]}-${hex.slice(10).join('')}`;
}
