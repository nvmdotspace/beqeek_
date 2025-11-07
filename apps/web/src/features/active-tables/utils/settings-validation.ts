/**
 * Settings Validation Utilities
 *
 * Provides validation functions for Active Table settings sections.
 * These validations run before save to ensure data integrity.
 */

import type { TableConfig } from '@workspace/active-tables-core';
import type { RecordListConfig, RecordDetailConfig, KanbanConfig, GanttChart } from '../types';
import { RECORD_LIST_LAYOUT_HEAD_COLUMN } from '@workspace/beqeek-shared/constants/layouts';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate List View Configuration
 */
export function validateListViewConfig(config: RecordListConfig | undefined): ValidationError[] {
  if (!config) return [];

  const errors: ValidationError[] = [];

  if (config.layout === RECORD_LIST_LAYOUT_HEAD_COLUMN) {
    if (!config.titleField || config.titleField.trim() === '') {
      errors.push({
        field: 'titleField',
        message: 'Title field is required for Head Column layout',
      });
    }
  }

  // Note: displayFields validation removed - generic-table layout is optional
  // If not configured, the system will use a default table view

  return errors;
}

/**
 * Validate Detail View Configuration
 */
export function validateDetailViewConfig(config: RecordDetailConfig | undefined): ValidationError[] {
  if (!config) return [];

  const errors: ValidationError[] = [];

  // Detail view configuration is optional - no required fields
  // The system provides sensible defaults if fields are not specified

  return errors;
}

/**
 * Validate Kanban Configuration
 */
export function validateKanbanConfig(config: KanbanConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.screenName || config.screenName.trim() === '') {
    errors.push({
      field: 'screenName',
      message: 'Kanban screen name is required',
    });
  }

  if (!config.statusField || config.statusField.trim() === '') {
    errors.push({
      field: 'statusField',
      message: 'Status field is required for Kanban view',
    });
  }

  if (!config.kanbanHeadlineField || config.kanbanHeadlineField.trim() === '') {
    errors.push({
      field: 'kanbanHeadlineField',
      message: 'Headline field is required for Kanban cards',
    });
  }

  return errors;
}

/**
 * Validate Gantt Configuration
 */
export function validateGanttConfig(config: GanttChart): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.screenName || config.screenName.trim() === '') {
    errors.push({
      field: 'screenName',
      message: 'Gantt screen name is required',
    });
  }

  if (!config.taskNameField || config.taskNameField.trim() === '') {
    errors.push({
      field: 'taskNameField',
      message: 'Task name field is required',
    });
  }

  if (!config.startDateField || config.startDateField.trim() === '') {
    errors.push({
      field: 'startDateField',
      message: 'Start date field is required',
    });
  }

  if (!config.endDateField || config.endDateField.trim() === '') {
    errors.push({
      field: 'endDateField',
      message: 'End date field is required',
    });
  }

  return errors;
}

/**
 * Validate entire TableConfig before save
 */
export function validateTableConfig(config: TableConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate list view
  if (config.recordListConfig) {
    errors.push(...validateListViewConfig(config.recordListConfig as RecordListConfig));
  }

  // Validate detail view (optional, so no errors expected)
  if (config.recordDetailConfig) {
    errors.push(...validateDetailViewConfig(config.recordDetailConfig as RecordDetailConfig));
  }

  // Validate kanban configs
  if (config.kanbanConfigs && Array.isArray(config.kanbanConfigs)) {
    config.kanbanConfigs.forEach((kanbanConfig, index) => {
      const kanbanErrors = validateKanbanConfig(kanbanConfig as KanbanConfig);
      errors.push(
        ...kanbanErrors.map((err) => ({
          field: `kanbanConfigs[${index}].${err.field}`,
          message: err.message,
        })),
      );
    });
  }

  // Validate gantt configs
  if (config.ganttCharts && Array.isArray(config.ganttCharts)) {
    (config.ganttCharts as GanttChart[]).forEach((ganttConfig, index) => {
      const ganttErrors = validateGanttConfig(ganttConfig);
      errors.push(
        ...ganttErrors.map((err) => ({
          field: `ganttCharts[${index}].${err.field}`,
          message: err.message,
        })),
      );
    });
  }

  return errors;
}

/**
 * Check if config has validation errors
 */
export function hasValidationErrors(config: TableConfig): boolean {
  return validateTableConfig(config).length > 0;
}
