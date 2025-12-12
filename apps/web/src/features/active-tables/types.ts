export interface ActiveWorkGroup {
  id: string;
  name: string;
  description?: string;
  config?: unknown[];
}

export interface ActiveTableOption {
  text: string;
  value: string;
  text_color?: string;
  background_color?: string;
}

import type { FieldConfig } from '@workspace/active-tables-core';

export interface ActiveFieldConfig extends FieldConfig {
  referenceTableId?: string;
  referenceField?: string;
  additionalCondition?: string;
}

export interface ActiveTableAction {
  name: string;
  type: string;
  icon?: string;
  actionId: string;
}

export interface ActiveTableQuickFilter {
  fieldName: string;
}

/**
 * Filtering operators for API queries
 * Based on AlchemistRestfulApi library
 */
export type FilterOperator =
  | 'eq' // Equal
  | 'ne' // Not equal
  | 'lt' // Less than
  | 'gt' // Greater than
  | 'lte' // Less than or equal
  | 'gte' // Greater than or equal
  | 'in' // In array
  | 'not_in' // Not in array
  | 'between' // Between two values
  | 'not_between'; // Not between two values

/**
 * Field filter with optional operator
 * Format: fieldName or fieldName:operator
 * Examples: "status", "status:eq", "priority:in"
 */
export type FieldFilterKey = string;

/**
 * Filter value can be a single value or array (for 'in', 'not_in', 'between', 'not_between')
 */
export type FilterValue = string | number | boolean | null | Array<string | number>;

/**
 * Record filtering group
 * Filters on custom field data
 * Format: filtering[record][fieldName:operator] = value
 */
export type RecordFiltering = Record<FieldFilterKey, FilterValue>;

/**
 * Value updated at filtering group
 * Filters on when a field's current value was last updated
 * Format: filtering[valueUpdatedAt][fieldName:operator] = datetime
 */
export type ValueUpdatedAtFiltering = Record<FieldFilterKey, string>;

/**
 * Historical value updated at filtering group
 * Filters on when a field was changed FROM a specific historical value
 * Must be used with historicalValue filter
 * Format: filtering[historicalValueUpdatedAt][fieldName:operator] = datetime
 */
export type HistoricalValueUpdatedAtFiltering = Record<FieldFilterKey, string>;

/**
 * Complete filtering structure for Active Records API
 * Based on doc-get-active-records.md
 *
 * Filtering Groups:
 * - id: Filter by record ID (supports eq, in)
 * - fulltext: Full-text search (hashed keywords for E2EE tables)
 * - record: Filter by field values (supports various operators based on encryption type)
 * - valueUpdatedAt: Filter by when a field's current value was updated
 * - historicalValueUpdatedAt: Filter by when a field was changed from a historical value
 * - historicalValue: Specify the historical value to filter by (used with historicalValueUpdatedAt)
 *
 * @example
 * // Filter by status field (E2EE - uses hash)
 * {
 *   record: {
 *     status: "20bc534fb1cdf23178878ddbf795f550f76eb149475ec0b6d3eea85194c81322"
 *   }
 * }
 *
 * @example
 * // Filter by assignee (unencrypted reference field - uses raw ID)
 * {
 *   record: {
 *     assignee: "806145710083801089"
 *   }
 * }
 *
 * @example
 * // Full-text search (E2EE - uses hashed keywords)
 * {
 *   fulltext: "hash1 hash2 hash3"
 * }
 *
 * @example
 * // Filter by record IDs
 * {
 *   id: {
 *     "id:in": ["732878538910205329", "732878538910205330"]
 *   }
 * }
 */
export interface ActiveRecordsFiltering {
  /** Filter by record ID(s) */
  id?: Record<FieldFilterKey, FilterValue>;
  /** Full-text search (hashed keywords for E2EE) */
  fulltext?: string;
  /** Filter by field values */
  record?: RecordFiltering;
  /** Filter by when field values were last updated */
  valueUpdatedAt?: ValueUpdatedAtFiltering;
  /** Filter by when field was changed from a historical value (requires historicalValue) */
  historicalValueUpdatedAt?: HistoricalValueUpdatedAtFiltering;
  /** Historical value to filter by (used with historicalValueUpdatedAt) */
  historicalValue?: string;
}

export interface KanbanConfig {
  kanbanScreenId: string;
  screenName: string;
  screenDescription?: string;
  statusField: string;
  kanbanHeadlineField: string;
  displayFields: string[];
  columnStyles?: {
    value: string;
    color: string;
  }[];
}

export interface RecordListConfig {
  layout: string;
  titleField: string;
  subLineFields: string[];
  tailFields: string[];
  displayFields?: string[];
}

export interface RecordDetailConfig {
  layout: string;
  commentsPosition: string;
  titleField: string;
  subLineFields: string[];
  tailFields: string[];
  // Optional fields for two-column layout
  column1Fields?: string[];
  column2Fields?: string[];
}

export interface PermissionAction {
  actionId: string;
  permission: string;
}

export interface PermissionsConfig {
  teamId: string;
  roleId: string;
  actions: PermissionAction[];
}

export interface GanttChart {
  ganttScreenId: string;
  screenName: string;
  screenDescription?: string;
  taskNameField: string;
  startDateField: string;
  endDateField: string;
  progressField?: string;
  dependencyField?: string;
  statusField?: string;
  statusCompleteValue?: string;
}

export interface ActiveTableConfig {
  title: string;
  fields: ActiveFieldConfig[];
  actions: ActiveTableAction[];
  quickFilters: ActiveTableQuickFilter[];
  tableLimit: number;
  e2eeEncryption: boolean;
  hashedKeywordFields: string[];
  defaultSort: 'asc' | 'desc';
  kanbanConfigs: KanbanConfig[];
  recordListConfig: RecordListConfig;
  recordDetailConfig: RecordDetailConfig;
  permissionsConfig: PermissionsConfig[];
  ganttCharts: GanttChart[];
  encryptionKey?: string;
  encryptionAuthKey: string;
}

export interface ActiveTable {
  id: string;
  name: string;
  workGroupId: string;
  tableType: string;
  description?: string;
  config: ActiveTableConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveWorkGroupsResponse {
  data: ActiveWorkGroup[];
  limit?: number;
  sort?: Record<string, unknown>;
}

export interface ActiveTablesResponse {
  data: ActiveTable[];
  limit?: number;
  sort?: Record<string, unknown>;
}

export interface ActiveTableRecordPermissions {
  access: boolean;
  update: boolean;
  delete?: boolean;
  comment_create?: boolean;
  comment_access?: boolean;
  comment_update?: boolean;
  comment_delete?: boolean;
  [key: `custom_${string}`]: boolean; // Support custom actions
}

export interface ActiveTableRecord {
  id: string;
  record: Record<string, unknown>;
  data?: Record<string, unknown>; // Alias for record data (for compatibility with @workspace/active-tables-core)
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  valueUpdatedAt?: Record<string, string>;
  relatedUserIds?: string[];
  assignedUserIds?: string[];
  record_hashes?: Record<string, string | string[]>;
  hashed_keywords?: string[];
  permissions?: ActiveTableRecordPermissions;
}

export interface ActiveRecordsResponse {
  data: ActiveTableRecord[];
  next_id?: string | null;
  previous_id?: string | null;
  limit?: number;
  offset?: number;
}
