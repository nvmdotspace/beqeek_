/**
 * Configuration type definitions for Active Tables
 *
 * These types define how Active Tables are displayed and configured
 */

import type { FieldConfig } from './field.js';
import type { ActionConfig, QuickFilterConfig } from './action.js';

// ============================================
// View Layout Configurations
// ============================================

/**
 * Configuration for Kanban board view
 */
export interface KanbanConfig {
  /** Unique kanban screen ID */
  kanbanScreenId: string;

  /** Display name for this kanban view */
  screenName: string;

  /** Optional description */
  screenDescription?: string;

  /** Field name to use for columns (status field) */
  statusField: string;

  /** Field name to use as card headline */
  kanbanHeadlineField: string;

  /** Field names to display in card body */
  displayFields: string[];

  /** Optional column styling */
  columnStyles?: {
    value: string;
    color: string;
  }[];
}

/**
 * Configuration for Gantt chart view
 */
export interface GanttConfig {
  /** Unique gantt screen ID */
  ganttScreenId: string;

  /** Display name for this gantt view */
  screenName: string;

  /** Optional description */
  screenDescription?: string;

  /** Field name for task name */
  taskNameField: string;

  /** Field name for start date */
  startDateField: string;

  /** Field name for end date */
  endDateField: string;

  /** Optional field name for progress (0-100) */
  progressField?: string;

  /** Optional field name for dependencies */
  dependencyField?: string;
}

/**
 * Configuration for Record List view (table/card layout)
 * Supports two layout patterns:
 * 1. generic-table: Uses displayFields array
 * 2. head-column: Uses titleField, subLineFields, tailFields
 */
export interface RecordListConfig {
  /** Layout type: 'generic-table' | 'table' | 'head-column' | 'card' | 'compact' */
  layout: string;

  /** Field names to display (for generic-table layout) */
  displayFields?: string[];

  /** Field name to use as title (for head-column layout) */
  titleField?: string;

  /** Field names to display as subline (for head-column layout) */
  subLineFields?: string[];

  /** Field names to display at the end (for head-column layout) */
  tailFields?: string[];
}

/**
 * Configuration for Record Detail view
 */
export interface RecordDetailConfig {
  /** Layout type: 'head-detail' | 'single-column' | 'two-column' | 'two-columns' */
  layout: string;

  /** Comments position: 'right-panel' | 'right' | 'bottom' | 'none' */
  commentsPosition: string;

  /** Field name for title */
  titleField: string;

  /** Field names for subline (below title) */
  subLineFields: string[];

  /** Field names for tail fields (single column layout) */
  tailFields: string[];

  /** Field names for column 1 (two column layout) */
  column1Fields?: string[];

  /** Field names for column 2 (two column layout) */
  column2Fields?: string[];
}

// ============================================
// Permissions Configuration
// ============================================

/**
 * Permission for a specific action
 */
export interface PermissionAction {
  /** Action ID to grant permission for */
  actionId: string;

  /** Permission level: 'allow' | 'deny' | 'conditional' */
  permission: string;
}

/**
 * Permissions configuration for a team/role
 */
export interface PermissionsConfig {
  /** Team ID this config applies to */
  teamId: string;

  /** Role ID this config applies to */
  roleId: string;

  /** List of action permissions */
  actions: PermissionAction[];
}

// ============================================
// Table Configuration
// ============================================

/**
 * Complete configuration for an Active Table
 */
export interface TableConfig {
  /** Table title */
  title: string;

  /** Field definitions */
  fields: FieldConfig[];

  /** Available actions */
  actions: ActionConfig[];

  /** Quick filter buttons */
  quickFilters: QuickFilterConfig[];

  /** Maximum records per query */
  tableLimit: number;

  /** Enable end-to-end encryption */
  e2eeEncryption: boolean;

  /** Field names to hash for keyword search (E2EE) */
  hashedKeywordFields: string[];

  /** Default sort direction */
  defaultSort: 'asc' | 'desc';

  /** Kanban view configurations */
  kanbanConfigs: KanbanConfig[];

  /** Record list view configuration */
  recordListConfig?: RecordListConfig;

  /** Record detail view configuration */
  recordDetailConfig?: RecordDetailConfig;

  /** Permissions configurations */
  permissionsConfig: PermissionsConfig[];

  /** Gantt chart configurations */
  ganttCharts: GanttConfig[];

  /** Encryption key (stored locally, never sent to server) */
  encryptionKey?: string;

  /** Encryption auth key (SHA256 hash stored on server) */
  encryptionAuthKey: string;
}

// ============================================
// Type Guards
// ============================================

/**
 * Check if config has E2EE enabled
 */
export function isE2EEEnabled(config: TableConfig): boolean {
  return config.e2eeEncryption === true;
}

/**
 * Check if field should be hashed for keyword search
 */
export function isKeywordField(config: TableConfig, fieldName: string): boolean {
  return config.hashedKeywordFields?.includes(fieldName) ?? false;
}

/**
 * Get kanban config by screen ID
 */
export function getKanbanConfig(config: TableConfig, screenId: string): KanbanConfig | undefined {
  return config.kanbanConfigs?.find((k) => k.kanbanScreenId === screenId);
}

/**
 * Get gantt config by screen ID
 */
export function getGanttConfig(config: TableConfig, screenId: string): GanttConfig | undefined {
  return config.ganttCharts?.find((g) => g.ganttScreenId === screenId);
}

// ============================================
// Legacy Type Aliases (for backward compatibility)
// ============================================

/**
 * @deprecated Use TableConfig instead
 */
export type ActiveTableConfig = TableConfig;

/**
 * @deprecated Use GanttConfig instead
 */
export type GanttChart = GanttConfig;
