/**
 * Table Configuration Type Definitions
 *
 * Complete type definitions for Active Table configurations.
 * Based on table-type-templates-reference.md
 */

import type { FieldType } from '../constants/field-types.js';
import type { Permission } from '../constants/permissions.js';
import type { TableType } from '../constants/table-types.js';

/**
 * Supported default value primitive types for table fields
 */
export type FieldDefaultValue = string | number | boolean | string[] | null;

// ============================================
// Field Configuration Types
// ============================================

/**
 * Field option for SELECT/CHECKBOX types
 */
export interface FieldOption {
  text: string; // i18n key or actual text
  value: string;
  text_color: string; // hex color
  background_color: string; // hex color
}

/**
 * Base field configuration
 */
export interface BaseFieldConfig {
  type: FieldType;
  label: string; // i18n key
  name: string;
  placeholder?: string; // i18n key
  defaultValue?: FieldDefaultValue;
  required: boolean;
  /**
   * Number of decimal places for NUMERIC fields
   * Default: 2 for NUMERIC, 0 for INTEGER
   * Range: 0-10
   */
  decimalPlaces?: number;
}

/**
 * Field configuration with options (for SELECT/CHECKBOX types)
 */
export interface FieldConfigWithOptions extends BaseFieldConfig {
  options: FieldOption[];
}

/**
 * Field configuration with reference (for RECORD types)
 */
export interface FieldConfigWithReference extends BaseFieldConfig {
  referenceTableId: string; // Can be placeholder like "{EMPLOYEE_PROFILE}"
  referenceField?: string;
  referenceLabelField: string; // Field to display from referenced table
  additionalCondition?: string;
}

/**
 * Union type for all field configurations
 */
export type TableFieldConfig = BaseFieldConfig | FieldConfigWithOptions | FieldConfigWithReference;

// ============================================
// Quick Filter Configuration
// ============================================

export interface QuickFilterConfig {
  fieldName: string;
}

// ============================================
// Kanban Configuration
// ============================================

export interface KanbanConfig {
  kanbanScreenId: string; // UUID v7
  screenName: string; // i18n key
  screenDescription?: string; // i18n key
  statusField: string; // Field name to group by
  kanbanHeadlineField: string; // Field to display as card title
  displayFields: string[]; // Fields to show in card
}

// ============================================
// Gantt Configuration
// ============================================

export interface GanttConfig {
  ganttScreenId: string; // UUID v7
  screenName: string; // i18n key
  screenDescription?: string; // i18n key
  taskNameField: string;
  startDateField: string;
  endDateField: string;
  progressField?: string;
  dependencyField?: string;
}

// ============================================
// Record List Configuration
// ============================================

/**
 * Generic table layout - shows fields in table columns
 */
export interface RecordListGenericTableConfig {
  layout: 'generic-table';
  displayFields: string[];
}

/**
 * Head-column layout - shows records in card style
 */
export interface RecordListHeadColumnConfig {
  layout: 'head-column';
  titleField: string;
  subLineFields: string[];
  tailFields?: string[];
}

export type RecordListConfig = RecordListGenericTableConfig | RecordListHeadColumnConfig;

// ============================================
// Record Detail Configuration
// ============================================

/**
 * Head-detail layout
 */
export interface RecordDetailHeadConfig {
  layout: 'head-detail';
  commentsPosition: 'right-panel' | 'bottom' | 'hidden';
  headTitleField: string;
  headSubLineFields: string[];
  rowTailFields: string[];
}

/**
 * Two-column detail layout
 */
export interface RecordDetailTwoColumnConfig {
  layout: 'two-column-detail';
  commentsPosition: 'right-panel' | 'bottom' | 'hidden';
  headTitleField: string;
  headSubLineFields: string[];
  column1Fields: string[];
  column2Fields: string[];
}

export type RecordDetailConfig = RecordDetailHeadConfig | RecordDetailTwoColumnConfig;

// ============================================
// Action Configuration (placeholder)
// ============================================

export type TableActionType =
  | 'create'
  | 'access'
  | 'update'
  | 'delete'
  | 'custom'
  | 'comment_create'
  | 'comment_access'
  | 'comment_update'
  | 'comment_delete';

export interface ActionConfig {
  actionId: string;
  name: string;
  type: TableActionType;
  description?: string;
  icon?: string;
  config?: Record<string, unknown>;
}

// ============================================
// Permission Configuration (placeholder)
// ============================================

export interface PermissionRule {
  actionId: string;
  permission: Permission;
}

export interface PermissionConfig {
  teamId: string;
  roleId: string;
  actions: PermissionRule[];
}

// ============================================
// Main Table Configuration
// ============================================

/**
 * Complete configuration for a table template
 */
export interface TableConfig {
  /**
   * Table type identifier
   */
  type: TableType;

  /**
   * Table title (i18n key)
   */
  title: string;

  /**
   * Predefined fields for this table type
   */
  fields: TableFieldConfig[];

  /**
   * Action configurations (usually empty, auto-generated)
   */
  actions: ActionConfig[];

  /**
   * Quick filter configurations
   */
  quickFilters: QuickFilterConfig[];

  /**
   * Maximum number of records (for pagination)
   */
  tableLimit: number;

  /**
   * Default sort order
   */
  defaultSort: 'asc' | 'desc';

  /**
   * Enable end-to-end encryption
   */
  e2eeEncryption?: boolean;

  /**
   * Fields to index for full-text search
   */
  hashedKeywordFields: string[];

  /**
   * Kanban view configurations
   */
  kanbanConfigs: KanbanConfig[];

  /**
   * Gantt chart configurations
   */
  ganttCharts: GanttConfig[];

  /**
   * Record list view configuration
   */
  recordListConfig: RecordListConfig | null;

  /**
   * Record detail view configuration
   */
  recordDetailConfig: RecordDetailConfig | null;

  /**
   * Permission configurations (usually configured after creation)
   */
  permissionsConfig: PermissionConfig[];
}

// ============================================
// Helper Type Guards
// ============================================

export function hasOptions(field: TableFieldConfig): field is FieldConfigWithOptions {
  return 'options' in field;
}

export function hasReference(field: TableFieldConfig): field is FieldConfigWithReference {
  return 'referenceTableId' in field;
}

export function isGenericTableLayout(config: RecordListConfig): config is RecordListGenericTableConfig {
  return config.layout === 'generic-table';
}

export function isHeadColumnLayout(config: RecordListConfig): config is RecordListHeadColumnConfig {
  return config.layout === 'head-column';
}

export function isHeadDetailLayout(config: RecordDetailConfig): config is RecordDetailHeadConfig {
  return config.layout === 'head-detail';
}

export function isTwoColumnLayout(config: RecordDetailConfig): config is RecordDetailTwoColumnConfig {
  return config.layout === 'two-column-detail';
}
