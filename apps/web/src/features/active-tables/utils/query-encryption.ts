// TODO Phase 1: Implement buildEncryptedPayload in encryption-core or move to app-specific
// import { buildEncryptedPayload, type FieldEncryptionConfig, type EncryptedPayload } from '@workspace/encryption-core';
import type { ActiveFieldConfig } from '../types';
import { getEncryptionTypeForField, isEncryptableField } from '@workspace/active-tables-core';

// Temporary type stubs until Phase 1
type EncryptedFieldData = { data: unknown } | Array<{ data: unknown }>;

interface FieldEncryptionConfig {
  enabled: boolean;
  type: string;
  searchable: boolean;
  orderPreserving: boolean;
  e2ee: boolean;
  keyRotation: boolean;
}

interface EncryptedPayload {
  record: Record<string, EncryptedFieldData>;
  hashed_keywords: Record<string, string[]>;
  record_hashes: Record<string, string | string[]>;
  record_hash: string;
}

const buildEncryptedPayload = async (
  _rawData: Record<string, unknown>,
  _fieldConfigs: Map<string, FieldEncryptionConfig>,
  _encryptionKeys: Map<string, string>,
  _options?: { packAesInRecord?: boolean },
): Promise<EncryptedPayload> => ({
  record: {},
  hashed_keywords: {},
  record_hashes: {},
  record_hash: '',
});

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
    public readonly cause?: Error,
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
export function buildFieldConfigsMap(fields: ActiveFieldConfig[]): Map<string, FieldEncryptionConfig> {
  const map = new Map<string, FieldEncryptionConfig>();

  fields.forEach((field) => {
    // Skip fields that don't need encryption
    if (!isEncryptableField(field)) {
      return;
    }

    const encType = getEncryptionTypeForField(field.type);

    // Determine if field should be searchable
    // Following html-module pattern: text fields and numbers are searchable
    const searchable = encType === 'AES-256-CBC' || encType === 'OPE' || encType === 'HMAC-SHA256';

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
export function buildEncryptionKeysMap(fields: ActiveFieldConfig[], encryptionKey: string): Map<string, string> {
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
  rawData: Record<string, unknown>,
  fields: ActiveFieldConfig[],
  encryptionKey: string,
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
    const encryptedPayload = await buildEncryptedPayload(rawData, fieldConfigsMap, encryptionKeysMap, {
      packAesInRecord: true,
    });

    return encryptedPayload;
  } catch (error) {
    console.error('Record encryption failed:', error);
    throw new EncryptionError('Failed to encrypt record data', undefined, error instanceof Error ? error : undefined);
  }
}

/**
 * Extract encrypted field data from EncryptedPayload
 * Converts EncryptedData objects to format expected by API
 * (base64 strings for AES, hex strings for HMAC, special format for OPE)
 */
export function extractEncryptedRecord(encryptedPayload: EncryptedPayload): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const [fieldName, encryptedValue] of Object.entries(encryptedPayload.record)) {
    if (Array.isArray(encryptedValue)) {
      // Handle array values (SELECT_LIST, CHECKBOX_LIST)
      record[fieldName] = encryptedValue.map((item) =>
        typeof item === 'object' && item !== null && 'data' in item ? item.data : item,
      );
    } else if (typeof encryptedValue === 'object' && encryptedValue !== null && 'data' in encryptedValue) {
      record[fieldName] = encryptedValue.data;
    } else {
      record[fieldName] = encryptedValue;
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
  record: Record<string, unknown>;
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
