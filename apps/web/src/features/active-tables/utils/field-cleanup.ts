/**
 * Utility functions for cleaning up field references when fields are deleted
 *
 * When a field is deleted, all references to it in the table configuration
 * must be cleaned up to maintain data consistency and prevent validation errors.
 */

import type { TableConfig } from '@workspace/active-tables-core';

/**
 * Find all configuration locations where a field is referenced
 *
 * @param fieldName - Name of the field to check
 * @param config - Table configuration
 * @returns Array of locations where the field is used
 */
export function findFieldReferences(
  fieldName: string,
  config: TableConfig,
): Array<{ location: string; details: string }> {
  const references: Array<{ location: string; details: string }> = [];

  // Check kanban configurations
  if (config.kanbanConfigs) {
    config.kanbanConfigs.forEach((kanban, index) => {
      if (kanban.statusField === fieldName) {
        references.push({
          location: 'Kanban Settings',
          details: `Screen "${kanban.screenName}" uses this field as status field`,
        });
      }
      if (kanban.kanbanHeadlineField === fieldName) {
        references.push({
          location: 'Kanban Settings',
          details: `Screen "${kanban.screenName}" uses this field as headline field`,
        });
      }
      if (kanban.displayFields?.includes(fieldName)) {
        references.push({
          location: 'Kanban Settings',
          details: `Screen "${kanban.screenName}" includes this field in display fields`,
        });
      }
    });
  }

  // Check gantt configurations
  if (config.ganttCharts) {
    config.ganttCharts.forEach((gantt, index) => {
      if (gantt.taskNameField === fieldName) {
        references.push({
          location: 'Gantt Settings',
          details: `Chart "${gantt.screenName || `Chart ${index + 1}`}" uses this field as task name`,
        });
      }
      if (gantt.startDateField === fieldName) {
        references.push({
          location: 'Gantt Settings',
          details: `Chart "${gantt.screenName || `Chart ${index + 1}`}" uses this field as start date`,
        });
      }
      if (gantt.endDateField === fieldName) {
        references.push({
          location: 'Gantt Settings',
          details: `Chart "${gantt.screenName || `Chart ${index + 1}`}" uses this field as end date`,
        });
      }
    });
  }

  // Check record list configuration
  if (config.recordListConfig) {
    const listConfig = config.recordListConfig;
    if (listConfig.titleField === fieldName) {
      references.push({
        location: 'List View Settings',
        details: 'Used as title field in list view',
      });
    }
    if (listConfig.subLineFields?.includes(fieldName)) {
      references.push({
        location: 'List View Settings',
        details: 'Included in subline fields',
      });
    }
    if (listConfig.tailFields?.includes(fieldName)) {
      references.push({
        location: 'List View Settings',
        details: 'Included in tail fields',
      });
    }
  }

  // Check record detail configuration
  if (config.recordDetailConfig) {
    const detailConfig = config.recordDetailConfig;
    if (detailConfig.titleField === fieldName) {
      references.push({
        location: 'Detail View Settings',
        details: 'Used as title field',
      });
    }
    if (detailConfig.subLineFields?.includes(fieldName)) {
      references.push({
        location: 'Detail View Settings',
        details: 'Included in sub-line fields',
      });
    }
    if (detailConfig.tailFields?.includes(fieldName)) {
      references.push({
        location: 'Detail View Settings',
        details: 'Included in tail fields',
      });
    }
    if (detailConfig.column1Fields?.includes(fieldName)) {
      references.push({
        location: 'Detail View Settings',
        details: 'Included in column 1 fields',
      });
    }
    if (detailConfig.column2Fields?.includes(fieldName)) {
      references.push({
        location: 'Detail View Settings',
        details: 'Included in column 2 fields',
      });
    }
  }

  // Check quick filters
  if (config.quickFilters) {
    config.quickFilters.forEach((filter) => {
      if (filter.fieldName === fieldName) {
        references.push({
          location: 'Quick Filters',
          details: `Filter "${filter.label || 'Unnamed'}" uses this field`,
        });
      }
    });
  }

  // Check hashed keyword fields (for E2EE)
  if (config.hashedKeywordFields?.includes(fieldName)) {
    references.push({
      location: 'Encryption Settings',
      details: 'Used in hashed keyword fields',
    });
  }

  return references;
}

/**
 * Clean up all references to a deleted field from the configuration
 *
 * @param fieldName - Name of the field being deleted
 * @param config - Current table configuration
 * @returns Updated configuration with all references removed
 */
export function cleanupFieldReferences(fieldName: string, config: TableConfig): TableConfig {
  const updatedConfig = { ...config };

  // Clean up kanban configurations
  if (updatedConfig.kanbanConfigs) {
    updatedConfig.kanbanConfigs = updatedConfig.kanbanConfigs
      .map((kanban) => ({
        ...kanban,
        // Clear status field if it matches
        statusField: kanban.statusField === fieldName ? '' : kanban.statusField,
        // Clear headline field if it matches
        kanbanHeadlineField: kanban.kanbanHeadlineField === fieldName ? '' : kanban.kanbanHeadlineField,
        // Remove from display fields
        displayFields: kanban.displayFields?.filter((f) => f !== fieldName) || [],
      }))
      // Remove kanban configs that have empty required fields
      .filter((kanban) => kanban.statusField && kanban.kanbanHeadlineField);
  }

  // Clean up gantt configurations
  if (updatedConfig.ganttCharts) {
    updatedConfig.ganttCharts = updatedConfig.ganttCharts
      .map((gantt) => ({
        ...gantt,
        // Clear task name if it matches
        taskNameField: gantt.taskNameField === fieldName ? '' : gantt.taskNameField,
        // Clear start date if it matches
        startDateField: gantt.startDateField === fieldName ? '' : gantt.startDateField,
        // Clear end date if it matches
        endDateField: gantt.endDateField === fieldName ? '' : gantt.endDateField,
      }))
      // Remove gantt configs that have empty required fields
      .filter((gantt) => gantt.taskNameField && gantt.startDateField && gantt.endDateField);
  }

  // Clean up record list configuration
  if (updatedConfig.recordListConfig) {
    const listConfig = updatedConfig.recordListConfig;
    updatedConfig.recordListConfig = {
      ...listConfig,
      // Clear title field if it matches
      titleField: listConfig.titleField === fieldName ? '' : listConfig.titleField,
      // Remove from subline fields
      subLineFields: listConfig.subLineFields?.filter((f) => f !== fieldName) || [],
      // Remove from tail fields
      tailFields: listConfig.tailFields?.filter((f) => f !== fieldName) || [],
    };
  }

  // Clean up record detail configuration
  if (updatedConfig.recordDetailConfig) {
    const detailConfig = updatedConfig.recordDetailConfig;
    updatedConfig.recordDetailConfig = {
      ...detailConfig,
      // Clear title field if it matches
      titleField: detailConfig.titleField === fieldName ? '' : detailConfig.titleField,
      // Remove from various field arrays
      subLineFields: detailConfig.subLineFields?.filter((f) => f !== fieldName) || [],
      tailFields: detailConfig.tailFields?.filter((f) => f !== fieldName) || [],
      column1Fields: detailConfig.column1Fields?.filter((f) => f !== fieldName) || [],
      column2Fields: detailConfig.column2Fields?.filter((f) => f !== fieldName) || [],
    };
  }

  // Clean up quick filters
  if (updatedConfig.quickFilters) {
    updatedConfig.quickFilters = updatedConfig.quickFilters.filter((filter) => filter.fieldName !== fieldName);
  }

  // Clean up hashed keyword fields
  if (updatedConfig.hashedKeywordFields) {
    updatedConfig.hashedKeywordFields = updatedConfig.hashedKeywordFields.filter((f) => f !== fieldName);
  }

  return updatedConfig;
}

/**
 * Check if a field is safe to delete (has no references)
 *
 * @param fieldName - Name of the field to check
 * @param config - Table configuration
 * @returns true if field has no references and is safe to delete
 */
export function isFieldSafeToDelete(fieldName: string, config: TableConfig): boolean {
  const references = findFieldReferences(fieldName, config);
  return references.length === 0;
}
