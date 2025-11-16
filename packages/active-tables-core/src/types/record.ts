/**
 * Record type definitions for Active Tables
 *
 * Records are individual data entries in an Active Table
 */

// ============================================
// Record Permissions
// ============================================

/**
 * Permissions for a specific record
 * Supports both standard actions and custom actions (custom_<actionId>)
 */
export interface RecordPermissions {
  /** Can view/read the record */
  access: boolean;

  /** Can edit/update the record */
  update: boolean;

  /** Can delete the record */
  delete?: boolean;

  /** Custom action permissions (dynamic keys: custom_<actionId>) */
  [key: `custom_${string}`]: boolean;
}

// ============================================
// Record
// ============================================

/**
 * A single record in an Active Table
 */
export interface TableRecord {
  /** Unique record ID */
  id: string;

  /** Record data (field_name -> value mapping) */
  record: Record<string, unknown>;

  /** Alias for record data (for convenience) */
  data?: Record<string, unknown>;

  /** User ID who created the record */
  createdBy?: string;

  /** User ID who last updated the record */
  updatedBy?: string;

  /** Creation timestamp (ISO 8601) */
  createdAt?: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt?: string;

  /** Per-field update timestamps (field_name -> ISO 8601) */
  valueUpdatedAt?: Record<string, string>;

  /** User IDs related to this record (for collaboration) */
  relatedUserIds?: string[];

  /** User IDs assigned to this record (for tasks) */
  assignedUserIds?: string[];

  /** Encrypted field hashes (for E2EE search) */
  record_hashes?: Record<string, string | string[]>;

  /** Hashed keywords for full-text search (E2EE) */
  hashed_keywords?: string[];

  /** User permissions for this record */
  permissions?: RecordPermissions;
}

// ============================================
// Comments
// ============================================

/**
 * Comment on a record
 */
export interface RecordComment {
  /** Unique comment ID */
  id: string;

  /** Comment content */
  content: string;

  /** User ID who created the comment */
  userId: string;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

// ============================================
// Type Guards
// ============================================

/**
 * Check if object is a valid record
 */
export function isValidRecord(obj: unknown): obj is TableRecord {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const candidate = obj as Partial<TableRecord>;
  return typeof candidate.id === 'string' && candidate.record !== undefined && typeof candidate.record === 'object';
}

/**
 * Check if record has E2EE metadata
 */
export function isEncryptedRecord(record: TableRecord): boolean {
  return !!(record.record_hashes || record.hashed_keywords);
}

/**
 * Check if user has permission to perform action on record
 * @param record - The record to check permissions for
 * @param action - Standard action ('access', 'update', 'delete') or custom action key
 */
export function hasPermission(record: TableRecord, action: string): boolean {
  if (!record.permissions) {
    return false; // No permissions = deny by default
  }

  return record.permissions[action as keyof RecordPermissions] ?? false;
}
