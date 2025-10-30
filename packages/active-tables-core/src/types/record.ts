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
 */
export interface RecordPermissions {
  /** Can view/read the record */
  access: boolean;

  /** Can edit/update the record */
  update: boolean;

  /** Can delete the record */
  delete?: boolean;
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
// Type Guards
// ============================================

/**
 * Check if object is a valid record
 */
export function isValidRecord(obj: any): obj is TableRecord {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.record &&
    typeof obj.record === 'object'
  );
}

/**
 * Check if record has E2EE metadata
 */
export function isEncryptedRecord(record: TableRecord): boolean {
  return !!(record.record_hashes || record.hashed_keywords);
}

/**
 * Check if user has permission to perform action on record
 */
export function hasPermission(
  record: TableRecord,
  action: 'access' | 'update' | 'delete'
): boolean {
  if (!record.permissions) {
    return false; // No permissions = deny by default
  }

  return record.permissions[action] ?? false;
}

// ============================================
// Legacy Type Aliases (for backward compatibility)
// ============================================

/**
 * @deprecated Use TableRecord instead
 */
export type ActiveTableRecord = TableRecord;

/**
 * @deprecated Use RecordPermissions instead
 */
export type ActiveTableRecordPermissions = RecordPermissions;
