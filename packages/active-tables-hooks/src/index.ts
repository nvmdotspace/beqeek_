// Core hooks
export { useEncryption } from './useEncryption';
export { useTableManager } from './useTableManager';
export { useRecordManager } from './useRecordManager';

// Storage hooks
export { useLocalStorage } from './useLocalStorage';

// Table hooks
export { useTable } from './useTable';

// Re-export from packages for convenience
// Selective re-exports from encryption-core to avoid name conflicts
export {
  AES256,
  OPE,
  HMAC,
  KeyManager,
  KeyDerivation,
  E2EE,
  SecureStorage,
  StorageManager,
  EncryptedSearch,
  buildEncryptedRecord,
  buildHashedKeywords,
  buildRecordHashes,
  buildEncryptedPayload
} from '@workspace/encryption-core';
export type {
  EncryptedPayload,
  HashedKeywords,
  RecordHashes,
  EncryptionKey,
  EncryptedData,
  EncryptionType,
  FieldType,
  FieldDefinition,
  FieldEncryptionConfig,
  // Provide alias to avoid collision with active-tables-core's EncryptedRecord
  EncryptedRecord as PayloadEncryptedRecord
} from '@workspace/encryption-core';

// Full re-export from active-tables-core
export * from '@workspace/active-tables-core';
