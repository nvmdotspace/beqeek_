/**
 * Common type definitions for Active Tables
 */

import type { TableConfig } from './config.js';

// ============================================
// Work Group
// ============================================

/**
 * Work Group (collection of tables)
 */
export interface WorkGroup {
  /** Unique work group ID */
  id: string;

  /** Work group name */
  name: string;

  /** Optional description */
  description?: string;

  /** Optional configuration */
  config?: unknown[];
}

// ============================================
// Active Table
// ============================================

/**
 * Active Table metadata and configuration
 */
export interface Table {
  /** Unique table ID */
  id: string;

  /** Table name */
  name: string;

  /** Parent work group ID */
  workGroupId: string;

  /** Table type/category */
  tableType: string;

  /** Optional description */
  description?: string;

  /** Complete table configuration */
  config: TableConfig;

  /** Creation timestamp (ISO 8601) */
  createdAt?: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt?: string;
}

// ============================================
// Type Guards
// ============================================

/**
 * Check if object is a valid work group
 */
export function isValidWorkGroup(obj: unknown): obj is WorkGroup {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const candidate = obj as Partial<WorkGroup>;
  return typeof candidate.id === 'string' && typeof candidate.name === 'string';
}

/**
 * Check if object is a valid table
 */
export function isValidTable(obj: unknown): obj is Table {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const candidate = obj as Partial<Table>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.workGroupId === 'string' &&
    candidate.config !== undefined &&
    typeof candidate.config === 'object'
  );
}
