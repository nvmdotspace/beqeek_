/**
 * Record Detail Configuration Utilities
 *
 * Helpers for building and validating recordDetailConfig
 */

import type { RecordDetailConfig, FieldConfig } from '@workspace/active-tables-core';
import {
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  COMMENTS_POSITION_RIGHT_PANEL,
} from '@workspace/beqeek-shared/constants/layouts';

/**
 * Build recordDetailConfig with safe defaults
 */
export function buildRecordDetailConfig(
  baseConfig: RecordDetailConfig | undefined,
  fields: FieldConfig[],
): RecordDetailConfig {
  const firstField = fields[0]?.name ?? '';

  return {
    // Layout defaults
    layout: baseConfig?.layout || RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
    commentsPosition: baseConfig?.commentsPosition || COMMENTS_POSITION_RIGHT_PANEL,

    // Required fields with fallbacks
    titleField: baseConfig?.titleField || firstField,
    subLineFields: baseConfig?.subLineFields || [],
    tailFields: baseConfig?.tailFields || [],

    // Optional two-column fields
    column1Fields: baseConfig?.column1Fields || [],
    column2Fields: baseConfig?.column2Fields || [],
  };
}

/**
 * Validate that configured fields exist in table schema
 */
export function validateDetailConfig(
  config: RecordDetailConfig,
  fields: FieldConfig[],
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const fieldNames = new Set(fields.map((f) => f.name));

  // Check title field
  if (!fieldNames.has(config.titleField)) {
    errors.push(`Title field "${config.titleField}" not found in table schema`);
  }

  // Check other fields
  const allConfigFields = [
    ...config.subLineFields,
    ...config.tailFields,
    ...(config.column1Fields || []),
    ...(config.column2Fields || []),
  ];

  allConfigFields.forEach((fieldName) => {
    if (!fieldNames.has(fieldName)) {
      errors.push(`Field "${fieldName}" not found in table schema`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
