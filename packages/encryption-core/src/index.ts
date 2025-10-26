// Encryption algorithms
export { AES256 } from './algorithms/aes-256';
export { OPE } from './algorithms/ope';
export { HMAC } from './algorithms/hmac';

// Key management
export { KeyManager } from './key-management/key-manager';
export { KeyDerivation } from './key-management/key-derivation';
export { E2EE } from './key-management/e2ee';

// Storage
export { SecureStorage } from './storage/secure-storage';
export { StorageManager } from './storage/storage-manager';

// Field types
export * from './field-types';

// Search
export { EncryptedSearch } from './search/encrypted-search';

// Payload
export {
  buildEncryptedRecord,
  buildHashedKeywords,
  buildRecordHashes,
  buildEncryptedPayload,
  buildTotalRecordHash,
  verifyRecordIntegrity
} from './payload/payload-builder';
export type {
  EncryptedPayload,
  HashedKeywords,
  RecordHashes,
  EncryptedRecord
} from './payload/payload-builder';

// Types
export type {
  EncryptionKey,
  EncryptedData,
  EncryptionType
} from './types';