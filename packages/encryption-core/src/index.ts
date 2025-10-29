/**
 * @workspace/encryption-core
 *
 * Legacy-compatible encryption library - 1:1 TypeScript port of JavaScript implementation
 * from active-table-records.blade.php
 *
 * This package provides client-side encryption for Active Tables with support for:
 * - AES-256-CBC encryption for text fields
 * - Order-Preserving Encryption (OPE) for numbers and dates
 * - HMAC-SHA256 hashing for select fields
 * - Vietnamese text tokenization and searchable keyword hashing
 */

// Core encryption orchestrator - Routes field encryption to appropriate algorithms
export { CommonUtils } from './common-utils.js';

// Encryption algorithms - Legacy-compatible implementations
export { AES256 } from './algorithms/aes-256.js';
export { OPE, OPEncryptor } from './algorithms/ope.js';
export { HMAC } from './algorithms/hmac.js';

// Legacy-compatible types for Active Tables
export type {
  FieldConfig,
  FieldOption,
  TableConfig,
  TableDetail,
  FieldType,
  RecordData,
  HashedKeywords,
  RecordHashes,
} from './types.js';

// Core encryption types
export type {
  EncryptionKey,
  EncryptedData,
  EncryptionType,
  KeyDerivationOptions,
  StorageConfig,
} from './types.js';
