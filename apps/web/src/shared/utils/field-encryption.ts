/**
 * Field Encryption Utilities
 *
 * Provides functions to encrypt field values based on field type
 * following the E2EE architecture analyzed from production API.
 *
 * Key insights:
 * - SELECT_ONE fields use HMAC-SHA256 for deterministic equality checks
 * - Numbers/dates use OPE (Order-Preserving Encryption) for range queries
 * - Text fields use AES-256-CBC for full encryption
 * - Server never sees plaintext values
 * - Encryption key stored only in client localStorage
 *
 * This module delegates to CommonUtils from @workspace/encryption-core
 * to ensure consistency across the application.
 */

import { CommonUtils, AES256, OPE, HMAC } from '@workspace/encryption-core';
import type { FieldType } from '@workspace/beqeek-shared';

/**
 * Encrypt a field value based on its type
 *
 * @param value - The plaintext value to encrypt
 * @param fieldType - The field type determining encryption method
 * @param encryptionKey - 32-character encryption key from localStorage
 * @returns Encrypted value (string or string array for list fields)
 */
export function encryptFieldValue(
  value: unknown,
  fieldType: FieldType,
  encryptionKey: string,
): string | string[] | unknown {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  // Text fields - AES-256-CBC encryption
  if (CommonUtils.encryptFields().includes(fieldType)) {
    return AES256.encrypt(String(value), encryptionKey);
  }

  // Number/Date fields - OPE (Order-Preserving Encryption)
  if (CommonUtils.opeEncryptFields().includes(fieldType)) {
    if (!OPE.ope) {
      OPE.ope = new OPE(encryptionKey);
    }

    const stringValue = String(value);
    if (fieldType === 'DATE') {
      return OPE.ope.encryptStringDate(stringValue);
    } else if (fieldType === 'DATETIME') {
      return OPE.ope.encryptStringDatetime(stringValue);
    } else if (fieldType === 'TIME') {
      return OPE.ope.encryptString(stringValue);
    } else if (fieldType === 'NUMERIC') {
      return OPE.ope.encryptDecimal(stringValue);
    } else if (fieldType === 'INTEGER') {
      return OPE.ope.encryptInt(stringValue);
    } else {
      // Other time fields (YEAR, MONTH, DAY, HOUR, MINUTE, SECOND)
      return OPE.ope.encryptInt(stringValue);
    }
  }

  // Select/Checkbox fields - HMAC-SHA256 hashing
  if (CommonUtils.hashEncryptFields().includes(fieldType)) {
    // Array fields
    if (fieldType === 'CHECKBOX_LIST' || fieldType === 'SELECT_LIST') {
      if (Array.isArray(value)) {
        return HMAC.hashArray(value, encryptionKey);
      }
      return value;
    }

    // Single value fields
    return HMAC.hash(String(value), encryptionKey);
  }

  // Reference fields - no encryption
  if (CommonUtils.noneEncryptFields().includes(fieldType)) {
    return value;
  }

  // Default: return original value
  return value;
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
  newValue: unknown,
  fieldSchema: { type: FieldType },
  encryptionKey: string,
  hashedKeywordFields: string[] = [],
): {
  record: Record<string, string | string[]>;
  hashed_keywords: Record<string, string | string[]>;
  record_hashes: Record<string, string | string[]>;
} {
  const encrypted = encryptFieldValue(newValue, fieldSchema.type, encryptionKey);

  const payload: {
    record: Record<string, string | string[]>;
    hashed_keywords: Record<string, string | string[]>;
    record_hashes: Record<string, string | string[]>;
  } = {
    record: { [fieldName]: encrypted as string | string[] },
    hashed_keywords: {},
    record_hashes: {},
  };

  // Generate record hashes for all non-reference fields
  if (!CommonUtils.noneEncryptFields().includes(fieldSchema.type)) {
    if (Array.isArray(newValue)) {
      payload.record_hashes[fieldName] = HMAC.hashArray(newValue, encryptionKey);
    } else if (newValue !== null && newValue !== undefined && newValue !== '') {
      payload.record_hashes[fieldName] = HMAC.hash(String(newValue), encryptionKey);
    }
  }

  // Add to hashed_keywords if field is in the list (for full-text search)
  // Used for searchable text fields
  if (hashedKeywordFields.includes(fieldName) && newValue) {
    if (Array.isArray(newValue)) {
      payload.hashed_keywords[fieldName] = HMAC.hashArray(newValue, encryptionKey);
    } else {
      const keywords = CommonUtils.hashKeyword(String(newValue), encryptionKey);
      if (keywords.length > 0) {
        payload.hashed_keywords[fieldName] = keywords;
      }
    }
  }

  return payload;
}

/**
 * Note: buildPlaintextUpdatePayload was removed.
 *
 * According to encryption-modes-corrected.md, BOTH encryption modes
 * (server-side and E2EE) require client-side encryption before sending.
 * The only difference is WHERE the encryption key comes from:
 * - Server-side: table.config.encryptionKey
 * - E2EE: localStorage
 *
 * Both modes use buildEncryptedUpdatePayload().
 */
