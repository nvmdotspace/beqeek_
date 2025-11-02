/**
 * Field Encryption Utilities
 *
 * Provides functions to encrypt field values based on field type
 * following the E2EE architecture analyzed from production API.
 *
 * Key insights:
 * - SELECT_ONE fields use HMAC-SHA256 for deterministic equality checks
 * - Server never sees plaintext values
 * - Encryption key stored only in client localStorage
 */

import CryptoJS from 'crypto-js';
import type { FieldType } from '@workspace/beqeek-shared';

/**
 * Encrypt a field value based on its type
 *
 * @param value - The plaintext value to encrypt
 * @param fieldType - The field type determining encryption method
 * @param encryptionKey - 32-character encryption key from localStorage
 * @returns Encrypted value as hex string
 */
export function encryptFieldValue(value: any, fieldType: FieldType, encryptionKey: string): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const stringValue = String(value);

  switch (fieldType) {
    case 'SELECT_ONE':
    case 'SELECT_ONE_WORKSPACE_USER':
    case 'SELECT_ONE_RECORD':
      // HMAC-SHA256 for equality checks
      // Benefits: Deterministic (same input = same hash), one-way, keyed
      // Allows server to filter records by status using hash equality
      return CryptoJS.HmacSHA256(stringValue, encryptionKey).toString();

    case 'SHORT_TEXT':
    case 'RICH_TEXT':
    case 'LONG_TEXT':
      // AES-256-CBC for full encryption
      // Server cannot decrypt without key
      return CryptoJS.AES.encrypt(stringValue, encryptionKey).toString();

    case 'INTEGER':
    case 'NUMERIC':
    case 'DECIMAL':
      // HMAC for now (loses ordering capability)
      // TODO: Implement OPE (Order-Preserving Encryption) for range queries
      return CryptoJS.HmacSHA256(stringValue, encryptionKey).toString();

    case 'DATE':
    case 'DATETIME':
    case 'TIME':
      // HMAC for now (loses ordering capability)
      // TODO: Implement OPE for date range queries
      return CryptoJS.HmacSHA256(stringValue, encryptionKey).toString();

    case 'BOOLEAN':
    case 'CHECKBOX':
      // HMAC for boolean values
      return CryptoJS.HmacSHA256(stringValue, encryptionKey).toString();

    default:
      // Default to AES encryption for unknown types
      return CryptoJS.AES.encrypt(stringValue, encryptionKey).toString();
  }
}

/**
 * Build encrypted update payload for PATCH record API
 *
 * Matches production request format:
 * {
 *   record: { fieldName: "encrypted_value" },
 *   hashed_keywords: {},
 *   record_hashes: { fieldName: "hash" }
 * }
 *
 * @param fieldName - Name of the field being updated
 * @param newValue - New plaintext value
 * @param fieldSchema - Field configuration with type info
 * @param encryptionKey - Encryption key from localStorage
 * @param hashedKeywordFields - Array of field names that need keyword hashing for search
 * @returns Encrypted payload ready for API
 */
export function buildEncryptedUpdatePayload(
  fieldName: string,
  newValue: any,
  fieldSchema: { type: FieldType },
  encryptionKey: string,
  hashedKeywordFields: string[] = [],
) {
  const encrypted = encryptFieldValue(newValue, fieldSchema.type, encryptionKey);

  const payload: {
    record: Record<string, any>;
    hashed_keywords: Record<string, any>;
    record_hashes: Record<string, any>;
  } = {
    record: { [fieldName]: encrypted },
    hashed_keywords: {},
    record_hashes: {},
  };

  // For SELECT_* fields, always add to record_hashes for equality queries
  // This matches production behavior where record_hashes contains the same hash as record
  if (
    fieldSchema.type === 'SELECT_ONE' ||
    fieldSchema.type === 'SELECT_ONE_WORKSPACE_USER' ||
    fieldSchema.type === 'SELECT_ONE_RECORD'
  ) {
    payload.record_hashes[fieldName] = encrypted;
  }

  // For OPE fields (numbers, dates), add to record_hashes for range queries
  if (
    fieldSchema.type === 'INTEGER' ||
    fieldSchema.type === 'NUMERIC' ||
    fieldSchema.type === 'DECIMAL' ||
    fieldSchema.type === 'DATE' ||
    fieldSchema.type === 'DATETIME' ||
    fieldSchema.type === 'TIME'
  ) {
    payload.record_hashes[fieldName] = encrypted;
  }

  // Only add to hashed_keywords if field is in the list (for full-text search)
  // In production example, this was empty {} for gender field
  if (hashedKeywordFields.includes(fieldName)) {
    payload.hashed_keywords[fieldName] = encrypted;
  }

  return payload;
}

/**
 * Build plaintext update payload for non-encrypted tables
 *
 * @param fieldName - Name of the field being updated
 * @param newValue - New value
 * @returns Payload with plaintext value
 */
export function buildPlaintextUpdatePayload(fieldName: string, newValue: any) {
  return {
    record: { [fieldName]: newValue },
    hashed_keywords: {},
    record_hashes: {},
  };
}
