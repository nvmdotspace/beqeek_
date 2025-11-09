/**
 * Table Configuration Helper Functions
 *
 * Utility functions to work with table configurations
 */

import { TABLE_CONFIGS } from './table-configs.js';
import type { FieldDefaultValue, TableConfig, TableFieldConfig } from '../types/table-config-types.js';
import type { TableType } from '../constants/table-types.js';
import { TABLE_TYPE_BLANK } from '../constants/table-types.js';

// ============================================
// Core Helpers
// ============================================

/**
 * Get configuration for a specific table type
 *
 * @param tableType - The table type identifier
 * @returns Table configuration or BLANK config if not found
 *
 * @example
 * ```typescript
 * const config = getTableConfig('JOB_TITLE');
 * console.log(config.title); // 'tableType_jobTitle_name'
 * ```
 */
export function getTableConfig(tableType: TableType): TableConfig {
  const config = TABLE_CONFIGS[tableType];
  if (!config) {
    // Fallback to BLANK config (should always exist)
    const blankConfig = TABLE_CONFIGS[TABLE_TYPE_BLANK];
    if (!blankConfig) {
      throw new Error('BLANK table config not found - this should never happen');
    }
    return blankConfig;
  }
  return config;
}

/**
 * Get fields for a specific table type
 *
 * @param tableType - The table type identifier
 * @returns Array of field configurations
 *
 * @example
 * ```typescript
 * const fields = getTableFields('JOB_TITLE');
 * console.log(fields.length); // 4
 * ```
 */
export function getTableFields(tableType: TableType): TableFieldConfig[] {
  const config = getTableConfig(tableType);
  return config.fields;
}

/**
 * Get a specific field by name from a table type
 *
 * @param tableType - The table type identifier
 * @param fieldName - The field name to find
 * @returns Field configuration or undefined if not found
 *
 * @example
 * ```typescript
 * const statusField = getTableField('JOB_TITLE', 'status');
 * console.log(statusField?.type); // 'SELECT_ONE'
 * ```
 */
export function getTableField(tableType: TableType, fieldName: string): TableFieldConfig | undefined {
  const fields = getTableFields(tableType);
  return fields.find((field) => field.name === fieldName);
}

/**
 * Check if a table type has kanban configurations
 *
 * @param tableType - The table type identifier
 * @returns True if table has kanban configs
 *
 * @example
 * ```typescript
 * hasKanbanConfigs('TASK_EISENHOWER'); // true
 * hasKanbanConfigs('BLANK'); // false
 * ```
 */
export function hasKanbanConfigs(tableType: TableType): boolean {
  const config = getTableConfig(tableType);
  return config.kanbanConfigs.length > 0;
}

/**
 * Check if a table type has gantt configurations
 *
 * @param tableType - The table type identifier
 * @returns True if table has gantt configs
 *
 * @example
 * ```typescript
 * hasGanttConfigs('TASK_EISENHOWER'); // true
 * hasGanttConfigs('JOB_TITLE'); // false
 * ```
 */
export function hasGanttConfigs(tableType: TableType): boolean {
  const config = getTableConfig(tableType);
  return config.ganttCharts.length > 0;
}

/**
 * Get searchable field names for a table type
 *
 * @param tableType - The table type identifier
 * @returns Array of field names that are indexed for search
 *
 * @example
 * ```typescript
 * const searchableFields = getSearchableFields('JOB_TITLE');
 * // ['job_title_name', 'job_title_code']
 * ```
 */
export function getSearchableFields(tableType: TableType): string[] {
  const config = getTableConfig(tableType);
  return config.hashedKeywordFields;
}

/**
 * Get required fields for a table type
 *
 * @param tableType - The table type identifier
 * @returns Array of required field configurations
 *
 * @example
 * ```typescript
 * const requiredFields = getRequiredFields('JOB_TITLE');
 * console.log(requiredFields.length); // 3
 * ```
 */
export function getRequiredFields(tableType: TableType): TableFieldConfig[] {
  const fields = getTableFields(tableType);
  return fields.filter((field) => field.required);
}

/**
 * Get optional fields for a table type
 *
 * @param tableType - The table type identifier
 * @returns Array of optional field configurations
 *
 * @example
 * ```typescript
 * const optionalFields = getOptionalFields('JOB_TITLE');
 * console.log(optionalFields.length); // 1
 * ```
 */
export function getOptionalFields(tableType: TableType): TableFieldConfig[] {
  const fields = getTableFields(tableType);
  return fields.filter((field) => !field.required);
}

// ============================================
// Reference Resolution Helpers
// ============================================

/**
 * Check if a table config has reference fields with placeholders
 *
 * @param tableType - The table type identifier
 * @returns True if table has placeholder references
 *
 * @example
 * ```typescript
 * hasPlaceholderReferences('WORK_PROCESS'); // true (has {EMPLOYEE_PROFILE})
 * hasPlaceholderReferences('JOB_TITLE'); // false
 * ```
 */
export function hasPlaceholderReferences(tableType: TableType): boolean {
  const fields = getTableFields(tableType);
  return fields.some((field) => {
    if ('referenceTableId' in field) {
      return field.referenceTableId.startsWith('{') && field.referenceTableId.endsWith('}');
    }
    return false;
  });
}

/**
 * Get list of placeholder references from a table config
 *
 * @param tableType - The table type identifier
 * @returns Array of placeholder reference identifiers (e.g., ['EMPLOYEE_PROFILE', 'DEPARTMENT'])
 *
 * @example
 * ```typescript
 * const placeholders = getPlaceholderReferences('WORK_PROCESS');
 * // ['EMPLOYEE_PROFILE', 'DEPARTMENT', 'JOB_TITLE', 'SALARY_SETUP']
 * ```
 */
export function getPlaceholderReferences(tableType: TableType): string[] {
  const fields = getTableFields(tableType);
  const placeholders: string[] = [];

  fields.forEach((field) => {
    if ('referenceTableId' in field) {
      const ref = field.referenceTableId;
      if (ref.startsWith('{') && ref.endsWith('}')) {
        const placeholder = ref.slice(1, -1);
        if (!placeholders.includes(placeholder)) {
          placeholders.push(placeholder);
        }
      }
    }
  });

  return placeholders;
}

/**
 * Resolve placeholder references in a table config with actual table IDs
 *
 * @param tableType - The table type identifier
 * @param referenceMap - Map of placeholder names to actual table IDs
 * @returns Table configuration with resolved references
 *
 * @example
 * ```typescript
 * const resolved = resolvePlaceholderReferences('WORK_PROCESS', {
 *   EMPLOYEE_PROFILE: '123456789',
 *   DEPARTMENT: '987654321',
 *   JOB_TITLE: '555666777',
 *   SALARY_SETUP: '111222333'
 * });
 * // Returns config with actual IDs instead of {EMPLOYEE_PROFILE}
 * ```
 */
export function resolvePlaceholderReferences(tableType: TableType, referenceMap: Record<string, string>): TableConfig {
  const config = getTableConfig(tableType);

  // Deep clone to avoid mutating original config
  const resolvedConfig: TableConfig = JSON.parse(JSON.stringify(config));

  // Resolve references in fields
  resolvedConfig.fields = resolvedConfig.fields.map((field) => {
    if ('referenceTableId' in field) {
      const ref = field.referenceTableId;
      if (ref.startsWith('{') && ref.endsWith('}')) {
        const placeholder = ref.slice(1, -1);
        if (referenceMap[placeholder]) {
          return {
            ...field,
            referenceTableId: referenceMap[placeholder],
          };
        }
      }
    }
    return field;
  });

  return resolvedConfig;
}

// ============================================
// Metadata Helpers
// ============================================

/**
 * Get table limit (max records for pagination)
 *
 * @param tableType - The table type identifier
 * @returns Table limit number
 */
export function getTableLimit(tableType: TableType): number {
  const config = getTableConfig(tableType);
  return config.tableLimit;
}

/**
 * Get default sort order for a table type
 *
 * @param tableType - The table type identifier
 * @returns Sort order ('asc' or 'desc')
 */
export function getDefaultSort(tableType: TableType): 'asc' | 'desc' {
  const config = getTableConfig(tableType);
  return config.defaultSort;
}

/**
 * Check if a table type has E2EE encryption enabled by default
 *
 * @param tableType - The table type identifier
 * @returns True if E2EE is enabled
 */
export function hasE2EEEncryption(tableType: TableType): boolean {
  const config = getTableConfig(tableType);
  return config.e2eeEncryption === true;
}

// ============================================
// Field Type Filtering Helpers
// ============================================

/**
 * Get fields of a specific type from a table
 *
 * @param tableType - The table type identifier
 * @param fieldType - The field type to filter by
 * @returns Array of fields matching the type
 *
 * @example
 * ```typescript
 * const selectFields = getFieldsByType('WORK_PROCESS', 'SELECT_ONE');
 * console.log(selectFields.length); // 3 (salary grades)
 * ```
 */
export function getFieldsByType(tableType: TableType, fieldType: string): TableFieldConfig[] {
  const fields = getTableFields(tableType);
  return fields.filter((field) => field.type === fieldType);
}

/**
 * Get all reference fields (SELECT_ONE_RECORD, SELECT_LIST_RECORD, etc.) from a table
 *
 * @param tableType - The table type identifier
 * @returns Array of reference field configurations
 *
 * @example
 * ```typescript
 * const refFields = getReferenceFields('WORK_PROCESS');
 * console.log(refFields.length); // 4 (employee, dept, job, salary)
 * ```
 */
export function getReferenceFields(tableType: TableType): TableFieldConfig[] {
  const fields = getTableFields(tableType);
  return fields.filter((field) => 'referenceTableId' in field);
}

/**
 * Get all select fields (with options) from a table
 *
 * @param tableType - The table type identifier
 * @returns Array of select field configurations
 *
 * @example
 * ```typescript
 * const selectFields = getSelectFields('TASK_EISENHOWER');
 * console.log(selectFields.length); // 3 (matrix, evaluation, status)
 * ```
 */
export function getSelectFields(tableType: TableType): TableFieldConfig[] {
  const fields = getTableFields(tableType);
  return fields.filter((field) => 'options' in field);
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate that all required fields are present in a data object
 *
 * @param tableType - The table type identifier
 * @param data - Data object to validate
 * @returns Object with `valid` boolean and array of `missingFields`
 *
 * @example
 * ```typescript
 * const result = validateRequiredFields('JOB_TITLE', {
 *   job_title_name: 'Manager'
 *   // missing job_title_code and status
 * });
 * console.log(result.valid); // false
 * console.log(result.missingFields); // ['job_title_code', 'status']
 * ```
 */
type TableRecordData = Record<string, FieldDefaultValue | undefined>;

export function validateRequiredFields(
  tableType: TableType,
  data: TableRecordData,
): { valid: boolean; missingFields: string[] } {
  const requiredFields = getRequiredFields(tableType);
  const missingFields = requiredFields
    .filter((field) => {
      const value = data[field.name];
      return value === undefined || value === null || value === '';
    })
    .map((field) => field.name);

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

// ============================================
// Utility Exports
// ============================================

/**
 * Get all available table types
 *
 * @returns Array of all table type identifiers
 */
export function getAllTableTypes(): TableType[] {
  return Object.keys(TABLE_CONFIGS) as TableType[];
}

/**
 * Check if a table type exists in configs
 *
 * @param tableType - The table type identifier to check
 * @returns True if table type exists
 */
export function tableTypeExists(tableType: string): tableType is TableType {
  return tableType in TABLE_CONFIGS;
}

/**
 * Get count of fields for a table type
 *
 * @param tableType - The table type identifier
 * @returns Number of fields in the table
 */
export function getFieldCount(tableType: TableType): number {
  return getTableFields(tableType).length;
}

/**
 * Get table configuration statistics
 *
 * @param tableType - The table type identifier
 * @returns Object with stats about the table config
 *
 * @example
 * ```typescript
 * const stats = getTableStats('TASK_EISENHOWER');
 * // {
 * //   fieldCount: 8,
 * //   requiredFieldCount: 2,
 * //   optionalFieldCount: 6,
 * //   hasKanban: true,
 * //   hasGantt: true,
 * //   searchableFieldCount: 2,
 * //   referenceFieldCount: 1
 * // }
 * ```
 */
export function getTableStats(tableType: TableType) {
  const config = getTableConfig(tableType);
  const fields = config.fields;

  return {
    fieldCount: fields.length,
    requiredFieldCount: fields.filter((f) => f.required).length,
    optionalFieldCount: fields.filter((f) => !f.required).length,
    hasKanban: config.kanbanConfigs.length > 0,
    kanbanViewCount: config.kanbanConfigs.length,
    hasGantt: config.ganttCharts.length > 0,
    ganttViewCount: config.ganttCharts.length,
    searchableFieldCount: config.hashedKeywordFields.length,
    referenceFieldCount: fields.filter((f) => 'referenceTableId' in f).length,
    quickFilterCount: config.quickFilters.length,
    hasE2EE: config.e2eeEncryption === true,
    tableLimit: config.tableLimit,
    defaultSort: config.defaultSort,
  };
}
