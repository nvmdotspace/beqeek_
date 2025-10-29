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

// Legacy types for table encryption
export interface FieldOption {
  value: string;
  text: string;
  text_color?: string;
  background_color?: string;
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  required: boolean;
  options?: FieldOption[];
  // Reference fields
  referenceTableId?: string;
  referenceLabelField?: string;
  additionalCondition?: string;
}

export interface TableConfig {
  id?: string;
  name?: string;
  description?: string;
  tableType?: string;
  e2eeEncryption?: boolean;
  encryptionKey?: string;
  encryptionAuthKey?: string;
  limit?: number;
  defaultSort?: 'asc' | 'desc';
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

export interface TableDetail {
  id: string;
  name: string;
  workGroupId?: string;
  tableType?: string;
  description?: string;
  config: TableConfig;
}

export type FieldType =
  // Text fields
  | 'SHORT_TEXT'
  | 'RICH_TEXT'
  | 'TEXT'
  | 'EMAIL'
  | 'URL'
  // Time fields
  | 'DATE'
  | 'DATETIME'
  | 'TIME'
  | 'YEAR'
  | 'MONTH'
  | 'DAY'
  | 'HOUR'
  | 'MINUTE'
  | 'SECOND'
  // Number fields
  | 'INTEGER'
  | 'NUMERIC'
  // Selection fields
  | 'CHECKBOX_YES_NO'
  | 'CHECKBOX_ONE'
  | 'CHECKBOX_LIST'
  | 'SELECT_ONE'
  | 'SELECT_LIST'
  // Reference fields
  | 'SELECT_ONE_RECORD'
  | 'SELECT_LIST_RECORD'
  | 'SELECT_ONE_WORKSPACE_USER'
  | 'SELECT_LIST_WORKSPACE_USER'
  // Special fields
  | 'FIRST_REFERENCE_RECORD';

export interface RecordData {
  [fieldName: string]: any;
}

export interface HashedKeywords {
  [fieldName: string]: string[];
}

export interface RecordHashes {
  [fieldName: string]: string | string[];
}