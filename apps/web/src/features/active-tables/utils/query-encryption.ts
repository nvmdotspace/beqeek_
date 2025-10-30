// TODO Phase 1: Implement buildEncryptedPayload in encryption-core or move to app-specific
// import { buildEncryptedPayload, type FieldEncryptionConfig, type EncryptedPayload } from '@workspace/encryption-core';
import type { ActiveFieldConfig } from '../types';
import {
  getEncryptionTypeForField,
  isEncryptableField,
  isValidEncryptionKey,
} from '@workspace/active-tables-core';

// Temporary type stubs until Phase 1
type EncryptedPayload = any;
type FieldEncryptionConfig = any;
const buildEncryptedPayload = async (..._args: any[]): Promise<any> => ({});

/**
 * Query-level encryption utilities for Active Tables
 * Integrates encryption-core's buildEncryptedPayload with React Query layer
 *
 * Follows the pattern from html-module:
 * - Encrypt data BEFORE API calls (in mutation functions)
 * - Decrypt data AFTER API responses (in query functions)
 */

/**
 * Error class for encryption failures
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Convert Active Table field configs to encryption-core format
 * Maps ActiveFieldConfig to FieldEncryptionConfig with proper encryption types
 * TODO Phase 1: Re-enable when FieldEncryptionConfig is available
 */
export function buildFieldConfigsMap(
  fields: ActiveFieldConfig[]
): Map<string, any> {
  const map = new Map<string, any>();

  fields.forEach((field) => {
    // Skip fields that don't need encryption
    if (!isEncryptableField(field)) {
      return;
    }

    const encType = getEncryptionTypeForField(field.type);

    // Determine if field should be searchable
    // Following html-module pattern: text fields and numbers are searchable
    const searchable =
      encType === 'AES-256-CBC' || encType === 'OPE' || encType === 'HMAC-SHA256';

    // OPE fields preserve order for range queries
    const orderPreserving = encType === 'OPE';

    map.set(field.name, {
      enabled: true,
      type: encType,
      searchable,
      orderPreserving,
      e2ee: true,
      keyRotation: false,
    });
  });

  return map;
}

/**
 * Build encryption keys map
 * Currently using same key for all fields (from table's encryptionKey)
 * Future: Support per-field key rotation
 */
export function buildEncryptionKeysMap(
  fields: ActiveFieldConfig[],
  encryptionKey: string
): Map<string, string> {
  const map = new Map<string, string>();

  fields.forEach((field) => {
    if (isEncryptableField(field)) {
      map.set(field.name, encryptionKey);
    }
  });

  return map;
}

/**
 * Encrypt record data for mutations
 * Uses buildEncryptedPayload from encryption-core to generate:
 * - record: encrypted field values
 * - hashed_keywords: search tokens for full-text search on encrypted data
 * - record_hashes: field-level integrity hashes
 * - record_hash: overall record integrity hash
 *
 * @param rawData - Plain record data from form/UI
 * @param fields - Table field configurations
 * @param encryptionKey - 32-char encryption key from localStorage
 * @returns EncryptedPayload ready to send to API
 * @throws EncryptionError if encryption fails
 */
export async function encryptRecordForMutation(
  rawData: Record<string, any>,
  fields: ActiveFieldConfig[],
  encryptionKey: string
): Promise<EncryptedPayload> {
  if (!encryptionKey) {
    throw new EncryptionError('Encryption key not provided');
  }

  if (!fields || fields.length === 0) {
    throw new EncryptionError('Field configurations not provided');
  }

  try {
    // Build field configs and keys maps
    const fieldConfigsMap = buildFieldConfigsMap(fields);
    const encryptionKeysMap = buildEncryptionKeysMap(fields, encryptionKey);

    // Use encryption-core's buildEncryptedPayload
    // packAesInRecord: true matches html-module format (IV prepended to ciphertext)
    const encryptedPayload = await buildEncryptedPayload(
      rawData,
      fieldConfigsMap,
      encryptionKeysMap,
      { packAesInRecord: true }
    );

    return encryptedPayload;
  } catch (error) {
    console.error('Record encryption failed:', error);
    throw new EncryptionError(
      'Failed to encrypt record data',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Extract encrypted field data from EncryptedPayload
 * Converts EncryptedData objects to format expected by API
 * (base64 strings for AES, hex strings for HMAC, special format for OPE)
 */
export function extractEncryptedRecord(
  encryptedPayload: EncryptedPayload
): Record<string, any> {
  const record: Record<string, any> = {};

  for (const [fieldName, encryptedValue] of Object.entries(encryptedPayload.record)) {
    if (Array.isArray(encryptedValue)) {
      // Handle array values (SELECT_LIST, CHECKBOX_LIST)
      record[fieldName] = encryptedValue.map((item: any) => item.data);
    } else {
      // Handle single values
      record[fieldName] = (encryptedValue as any).data;
    }
  }

  return record;
}

/**
 * Prepare encrypted payload for API request
 * Formats the EncryptedPayload into the structure expected by the backend
 *
 * @param encryptedPayload - Result from buildEncryptedPayload
 * @returns Object ready to send in API request body
 */
export function prepareEncryptedRequest(encryptedPayload: EncryptedPayload): {
  record: Record<string, any>;
  hashed_keywords: Record<string, string[]>;
  record_hashes: Record<string, string | string[]>;
  record_hash: string;
} {
  return {
    record: extractEncryptedRecord(encryptedPayload),
    hashed_keywords: encryptedPayload.hashed_keywords,
    record_hashes: encryptedPayload.record_hashes,
    record_hash: encryptedPayload.record_hash,
  };
}

// NOTE: isValidEncryptionKey is now imported from @workspace/active-tables-core
// Remove duplicate implementation to maintain single source of truth
