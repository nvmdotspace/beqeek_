import type { FieldConfig } from '../types/index.js';
import CryptoJS from 'crypto-js';

/**
 * Encryption helper utilities for Active Tables
 * Handles field-type specific encryption/decryption logic
 */

/**
 * Determine encryption type based on field type
 * Following the mapping from the old HTML module and encryption-core defaults
 */
export function getEncryptionTypeForField(fieldType: string): 'AES-256-CBC' | 'OPE' | 'HMAC-SHA256' | 'NONE' {
  // Text fields use AES-256-CBC
  if (
    fieldType === 'SHORT_TEXT' ||
    fieldType === 'TEXT' ||
    fieldType === 'RICH_TEXT' ||
    fieldType === 'EMAIL' ||
    fieldType === 'URL' ||
    fieldType === 'PHONE'
  ) {
    return 'AES-256-CBC';
  }

  // Numeric and date fields use OPE (Order-Preserving Encryption)
  if (
    fieldType === 'INTEGER' ||
    fieldType === 'NUMERIC' ||
    fieldType === 'DATE' ||
    fieldType === 'DATETIME' ||
    fieldType === 'TIME' ||
    fieldType === 'YEAR' ||
    fieldType === 'MONTH' ||
    fieldType === 'DAY' ||
    fieldType === 'HOUR' ||
    fieldType === 'MINUTE' ||
    fieldType === 'SECOND' ||
    fieldType === 'CURRENCY' ||
    fieldType === 'PERCENTAGE' ||
    fieldType === 'RATING'
  ) {
    return 'OPE';
  }

  // Select fields use HMAC-SHA256 (one-way hash)
  if (
    fieldType === 'SELECT_ONE' ||
    fieldType === 'SELECT_LIST' ||
    fieldType === 'CHECKBOX_YES_NO' ||
    fieldType === 'CHECKBOX_ONE' ||
    fieldType === 'CHECKBOX_LIST'
  ) {
    return 'HMAC-SHA256';
  }

  // No encryption for other field types
  return 'NONE';
}

/**
 * Decrypt a single field value based on field type
 * @param value - Encrypted value from server
 * @param field - Field configuration
 * @param encryptionKey - 32-char encryption key (UTF-8 string)
 * @returns Decrypted value or original if not encrypted
 */
export async function decryptFieldValue(value: unknown, field: FieldConfig, encryptionKey: string): Promise<unknown> {
  if (!value || !encryptionKey) {
    return value;
  }

  const encryptionType = getEncryptionTypeForField(field.type);

  try {
    switch (encryptionType) {
      case 'AES-256-CBC':
        return decryptTextValue(value, encryptionKey);

      case 'OPE':
        // OPE uses format: ciphertext|strong_enc
        // Decrypt the strong_enc part to get original value
        return decryptOPEValue(value, encryptionKey);

      case 'HMAC-SHA256':
        // HMAC is one-way hash, need to match against options
        return await decryptSelectValue(value, field, encryptionKey);

      case 'NONE':
      default:
        return value;
    }
  } catch (error) {
    console.error(`Failed to decrypt field ${field.name}:`, error);
    return value; // Return original value on error
  }
}

/**
 * Decrypt AES-256-CBC encrypted text value
 * Value format from server: base64(iv + ciphertext) - IV prepended to ciphertext
 *
 * IMPORTANT: This matches the old HTML module implementation exactly:
 * - Key is parsed as UTF-8 string (not HEX)
 * - IV is first 16 bytes (4 words) of base64-decoded data
 * - Ciphertext is remaining bytes after IV
 */
async function decryptTextValue(encryptedValue: unknown, encryptionKey: string): Promise<string> {
  if (!encryptedValue || typeof encryptedValue !== 'string') {
    return String(encryptedValue);
  }

  try {
    // Check if value looks like base64 (basic validation)
    if (!/^[A-Za-z0-9+/]+=*$/.test(encryptedValue)) {
      // Not base64, might be unencrypted or invalid format
      return encryptedValue;
    }

    // Parse key as UTF-8 (32-char string), not HEX (64-char)
    // This matches the old HTML module: CryptoJS.enc.Utf8.parse(key)
    const keyBytes = CryptoJS.enc.Utf8.parse(encryptionKey);

    // Decode base64 encrypted data
    const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedValue);

    // Validate minimum length (IV + at least 1 block of ciphertext)
    if (encryptedWordArray.sigBytes < 32) {
      // Too short to be valid encrypted data (16 bytes IV + 16 bytes min ciphertext)
      return encryptedValue;
    }

    // Extract IV from first 16 bytes (4 words)
    const iv = CryptoJS.lib.WordArray.create(
      encryptedWordArray.words.slice(0, 4),
      16, // IV is always 16 bytes for AES-256-CBC
    );

    // Extract ciphertext from remaining bytes
    const ciphertext = CryptoJS.lib.WordArray.create(
      encryptedWordArray.words.slice(4),
      encryptedWordArray.sigBytes - 16,
    );

    // Decrypt using CryptoJS directly (matches old implementation)
    // Create CipherParams object with ciphertext
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyBytes, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Convert decrypted WordArray to UTF-8 string
    const result = decrypted.toString(CryptoJS.enc.Utf8);

    if (!result || result.trim() === '') {
      // Empty result - likely wrong key or corrupted data
      // Return original value to show user something went wrong
      return encryptedValue;
    }

    return result;
  } catch (error) {
    // Decryption failed - return original value instead of throwing
    // This allows the UI to continue working with partially decrypted data
    console.warn('AES decryption failed, keeping encrypted value:', error);
    return encryptedValue;
  }
}

/**
 * Decrypt OPE (Order-Preserving Encryption) value
 * OPE format: ciphertext|strong_enc
 * - ciphertext: Encrypted value preserving order (for sorting/comparison)
 * - strong_enc: AES-256 encrypted original value
 *
 * @param value - OPE encrypted value with format "ciphertext|strong_enc"
 * @param encryptionKey - 32-char encryption key (UTF-8 string)
 * @returns Decrypted original value or empty string if invalid format
 */
async function decryptOPEValue(value: unknown, encryptionKey: string): Promise<string> {
  if (!value || typeof value !== 'string' || !encryptionKey) {
    return value ? String(value) : '';
  }

  try {
    // OPE format: ciphertext|strong_enc
    const parts = value.split('|');

    if (parts.length !== 2) {
      // Not in OPE format - could be plain value or different encryption
      // Try to decrypt as plain AES first
      const plainDecrypted = await decryptTextValue(value, encryptionKey);
      // If decryption changed the value, use it; otherwise return original
      return plainDecrypted !== value ? plainDecrypted : value;
    }

    // parts[0] = ciphertext (for sorting)
    // parts[1] = strong_enc (AES-256 encrypted original value)
    const strongEnc = parts[1];

    if (!strongEnc || strongEnc.trim() === '') {
      // Empty strong_enc part, return original
      return value;
    }

    // Decrypt the strong_enc part using AES-256-CBC
    const decrypted = await decryptTextValue(strongEnc, encryptionKey);

    // If decryption returned the encrypted value unchanged, return original OPE value
    return decrypted === strongEnc ? value : decrypted;
  } catch (error) {
    // Decryption failed - return original value silently
    return value;
  }
}

/**
 * Decrypt HMAC-SHA256 hashed select values by matching against field options
 * HMAC values cannot be decrypted, only matched
 */
async function decryptSelectValue(
  hashedValue: unknown,
  field: FieldConfig,
  encryptionKey: string,
): Promise<string | string[]> {
  if (!hashedValue || !field.options) {
    return typeof hashedValue === 'string' || Array.isArray(hashedValue) ? hashedValue : String(hashedValue);
  }

  if (typeof hashedValue !== 'string' && !Array.isArray(hashedValue)) {
    return String(hashedValue);
  }

  // Handle array values (SELECT_LIST, CHECKBOX_LIST)
  if (Array.isArray(hashedValue)) {
    return await Promise.all(hashedValue.map((hash) => matchHashToOption(hash, field.options!, encryptionKey)));
  }

  // Handle single value (SELECT_ONE, CHECKBOX_ONE)
  return await matchHashToOption(hashedValue, field.options, encryptionKey);
}

/**
 * Match a HMAC hash to its corresponding option value
 */
async function matchHashToOption(
  hash: string,
  options: FieldConfig['options'],
  encryptionKey: string,
): Promise<string> {
  if (!options || !Array.isArray(options)) {
    return hash;
  }

  for (const option of options) {
    const optionHash = CryptoJS.HmacSHA256(option.value, encryptionKey).toString(CryptoJS.enc.Hex);
    if (optionHash === hash) {
      return option.value;
    }
  }

  // If no match found, return original hash
  return hash;
}

/**
 * Validate encryption key format
 * @param key - Encryption key to validate
 * @returns true if key is valid 32-char UTF-8 string (matching old HTML module format)
 */
export function isValidEncryptionKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  // Key must be 32 characters (UTF-8 string, not HEX)
  // This matches the old HTML module format where keys are stored as plain strings
  return key.length === 32;
}

/**
 * Validate encryption key against server's encryptionAuthKey
 * The auth key is SHA-256 hash of the encryption key
 * @param encryptionKey - User's encryption key
 * @param encryptionAuthKey - Server's auth key (SHA-256 hash)
 * @returns true if key is valid
 */
export function validateEncryptionKey(encryptionKey: string, encryptionAuthKey: string): boolean {
  if (!encryptionKey || !encryptionAuthKey) {
    return false;
  }

  try {
    // Compute SHA-256 hash of encryption key
    const computedAuthKey = CryptoJS.SHA256(encryptionKey).toString(CryptoJS.enc.Hex);

    // Compare with server's auth key
    return computedAuthKey === encryptionAuthKey;
  } catch (error) {
    console.error('Key validation failed:', error);
    return false;
  }
}

/**
 * Check if field requires encryption
 */
export function isEncryptableField(field: FieldConfig): boolean {
  const encryptionType = getEncryptionTypeForField(field.type);
  return encryptionType !== 'NONE';
}

/**
 * Get localStorage key for storing encryption key
 * @param workspaceId - Workspace ID
 * @param tableId - Table ID
 */
export function getEncryptionKeyStorageKey(workspaceId: string, tableId: string): string {
  return `e2ee_key_${workspaceId}_${tableId}`;
}
