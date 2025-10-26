import type { FieldType, FieldDefinition, FieldEncryptionConfig } from '@workspace/encryption-core';

// Table configuration types
export interface TableConfig {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  fields: FieldDefinition[];
  encryptionEnabled: boolean;
  e2eeEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  settings: TableSettings;
}

export interface TableSettings {
  allowExport: boolean;
  allowImport: boolean;
  maxRecords: number;
  defaultSortField?: string;
  defaultSortOrder: 'asc' | 'desc';
  viewSettings: ViewSettings;
}

export interface ViewSettings {
  defaultView: 'table' | 'grid' | 'kanban' | 'calendar';
  defaultPageSize: number;
  showRowNumbers: boolean;
  enableFilters: boolean;
  enableSearch: boolean;
  enableSorting: boolean;
}

// Record types
export interface TableRecord {
  id: string;
  tableId: string;
  data: Record<string, any>;
  encryptedData?: Record<string, any>;
  searchIndexes?: Record<string, string[]>;
  record_hashes?: Record<string, string | string[]>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
  metadata: RecordMetadata;
}

export interface RecordMetadata {
  encryptionVersion: string;
  fieldVersions: Record<string, string>;
  checksum?: string;
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'read';
  fieldChanges?: FieldChange[];
  ipAddress?: string;
  userAgent?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  encrypted: boolean;
}

// Encrypted record types
export interface EncryptedRecord {
  id: string;
  tableId: string;
  encryptedData: Record<string, any>;
  searchIndexes: Record<string, string[]>;
  metadata: RecordMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// Search types
export interface SearchQuery {
  tableId: string;
  query: string;
  filters?: SearchFilter[];
  sort?: SortOption[];
  limit?: number;
  offset?: number;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
  value: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchResult {
  records: TableRecord[];
  totalCount: number;
  facets?: SearchFacet[];
  suggestions?: string[];
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
    selected?: boolean;
  }>;
}

// Import/Export types
export interface ImportConfig {
  tableId: string;
  format: 'csv' | 'xlsx' | 'json';
  mapping: FieldMapping[];
  options: ImportOptions;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
  encryption?: {
    enabled: boolean;
    type: string;
  };
}

export interface ImportOptions {
  skipFirstRow: boolean;
  overwriteExisting: boolean;
  validateOnly: boolean;
  batchSize: number;
  errorHandling: 'stop' | 'skip' | 'log';
}

export interface ExportConfig {
  tableId: string;
  format: 'csv' | 'xlsx' | 'json';
  fields: string[];
  filters?: SearchFilter[];
  includeHeaders: boolean;
  includeMetadata: boolean;
  decryptData: boolean;
}

export interface ExportResult {
  data: string | ArrayBuffer;
  filename: string;
  mimeType: string;
  recordCount: number;
  fieldCount: number;
}

// API types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  value: any;
  rule: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  value: any;
  message: string;
  code: string;
}

// Permission types
export interface TablePermission {
  userId: string;
  tableId: string;
  permissions: Permission[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export type Permission =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'manage_fields'
  | 'manage_permissions'
  | 'view_encrypted'
  | 'manage_encryption';

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  encryptionEnabled: boolean;
  e2eeEnabled: boolean;
  defaultEncryptionSettings: Record<FieldType, FieldEncryptionConfig>;
  keyRotationPolicy: {
    enabled: boolean;
    interval: number; // days
    notifyBefore: number; // days
  };
}

// Event types
export interface TableEvent {
  type: 'table_created' | 'table_updated' | 'table_deleted' | 'field_added' | 'field_updated' | 'field_deleted';
  tableId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

export interface RecordEvent {
  type: 'record_created' | 'record_updated' | 'record_deleted';
  tableId: string;
  recordId: string;
  userId: string;
  timestamp: Date;
  changes?: FieldChange[];
}

// Request interfaces
export interface CreateTableRequest {
  name: string;
  description?: string;
  workspaceId: string;
  fields: any[];
  encryptionEnabled?: boolean;
  e2eeEnabled?: boolean;
}

export interface UpdateTableRequest {
  name?: string;
  description?: string;
  fields?: any[];
  settings?: any;
}

export interface CreateRecordRequest {
  tableId: string;
  data: Record<string, any>;
  createdBy: string;
}

export interface UpdateRecordRequest {
  data: Record<string, any>;
  updatedBy: string;
  version?: number;
}

// API Client Interface
export interface ActiveTablesApiClient {
  get<T = any>(url: string, config?: any): Promise<{ data: T }>;
  post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }>;
  put<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }>;
  delete(url: string, config?: any): Promise<void>;
}

// Error types
export class ActiveTablesError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ActiveTablesError';
  }
}

export class EncryptionError extends ActiveTablesError {
  constructor(message: string, details?: any) {
    super(message, 'ENCRYPTION_ERROR', details);
    this.name = 'EncryptionError';
  }
}

export class ValidationError extends ActiveTablesError {
  constructor(message: string, public validationErrors: ValidationError[]) {
    super(message, 'VALIDATION_ERROR', { validationErrors });
    this.name = 'ValidationError';
  }
}

export class PermissionError extends ActiveTablesError {
  constructor(message: string, public requiredPermission: string) {
    super(message, 'PERMISSION_ERROR', { requiredPermission });
    this.name = 'PermissionError';
  }
}