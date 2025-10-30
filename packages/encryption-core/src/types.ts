/**
 * Import field types and constants from beqeek-shared
 * Ensures consistency across the entire system
 */
import type { FieldType, SortOrder } from '@workspace/beqeek-shared';

// Re-export FieldType for backward compatibility
export type { FieldType };

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

// ============================================
// Active Table Types
// ============================================

/**
 * Field option for SELECT and CHECKBOX field types
 * Per spec: Section 2.2.2.d
 */
export interface FieldOption {
  value: string;
  text: string;
  text_color?: string;
  background_color?: string;
}

/**
 * Field configuration
 * Per spec: Section 2.2
 */
export interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  required: boolean;
  // For SELECT and CHECKBOX fields
  options?: FieldOption[];
  // For reference fields
  referenceTableId?: string;
  referenceLabelField?: string;
  additionalCondition?: string;
}

/**
 * Table configuration
 * Per spec: Section 2.1
 */
export interface TableConfig {
  id?: string;
  name?: string;
  description?: string;
  tableType?: string;
  e2eeEncryption?: boolean;
  encryptionKey?: string;
  encryptionAuthKey?: string;
  limit?: number;
  defaultSort?: SortOrder;
  hashedKeywordFields?: string[];
  fields: FieldConfig[];
  actions?: any[];
  recordListConfig?: any;
  recordDetailConfig?: any;
  quickFilters?: any[];
  kanbanConfigs?: any[];
  ganttCharts?: any[];
  permissionsConfig?: any[];
}

/**
 * Table detail with metadata
 */
export interface TableDetail {
  id: string;
  name: string;
  workGroupId?: string;
  tableType?: string;
  description?: string;
  config: TableConfig;
}

/**
 * Record data structure
 */
export interface RecordData {
  [fieldName: string]: any;
}

/**
 * Hashed keywords for searchable encryption
 */
export interface HashedKeywords {
  [fieldName: string]: string[];
}

/**
 * Record hashes for field-level encryption
 */
export interface RecordHashes {
  [fieldName: string]: string | string[];
}