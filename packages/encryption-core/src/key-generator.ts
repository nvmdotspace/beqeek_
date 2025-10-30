/**
 * Key Generator - Utilities for generating secure encryption keys
 *
 * Provides cryptographically secure random key generation using Web Crypto API
 */

/**
 * Generates a cryptographically secure random encryption key
 *
 * @param length - Key length in characters (default: 32)
 * @returns Random key string containing alphanumeric and special characters
 *
 * @example
 * ```typescript
 * const key = generateEncryptionKey(); // 32 characters
 * const longKey = generateEncryptionKey(64); // 64 characters
 * ```
 *
 * Security notes:
 * - Uses crypto.getRandomValues() for cryptographically secure randomness
 * - Character set includes A-Z, a-z, 0-9, and special characters
 * - Default 32-character key provides 190+ bits of entropy
 * - Keys should be stored securely and never transmitted to server
 */
export function generateEncryptionKey(length: number = 32): string {
  // Character set: alphanumeric + safe special characters
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  let key = '';
  const array = new Uint8Array(length);

  // Use Web Crypto API for cryptographically secure random values
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    key += chars[array[i]! % chars.length];
  }

  return key;
}

/**
 * Validates if a string is a valid encryption key
 *
 * @param key - Key to validate
 * @param minLength - Minimum required length (default: 32)
 * @returns true if key is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = validateEncryptionKey('my-32-character-key-here!!!!!'); // true
 * const isInvalid = validateEncryptionKey('short'); // false
 * ```
 */
export function validateEncryptionKey(
  key: string,
  minLength: number = 32
): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (key.length < minLength) {
    return false;
  }

  return true;
}

/**
 * Key Generator utilities
 */
export const KeyGenerator = {
  generate: generateEncryptionKey,
  validate: validateEncryptionKey,
};
