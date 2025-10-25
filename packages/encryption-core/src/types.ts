export type EncryptionType = 'AES-256-CBC' | 'OPE' | 'HMAC-SHA256' | 'NONE';

export interface EncryptionKey {
  key: string;
  iv?: string;
  salt?: string;
  algorithm: EncryptionType;
}

export interface EncryptedData {
  data: string;
  iv?: string;
  salt?: string;
  algorithm: EncryptionType;
  metadata?: Record<string, any>;
}

// FieldEncryptionConfig is exported from field-types/index.ts

export interface KeyDerivationOptions {
  iterations?: number;
  keyLength?: number;
  hashFunction?: string;
}

export interface StorageConfig {
  prefix: string;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
}