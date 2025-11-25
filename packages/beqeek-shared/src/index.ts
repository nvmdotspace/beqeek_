/**
 * @workspace/beqeek-shared
 *
 * Shared constants, types, and utilities for the Beqeek platform.
 * Based on active-table-config-functional-spec.md
 *
 * This package provides:
 * - Field type constants and validators
 * - Action type constants and validators
 * - Permission constants and validators
 * - Layout constants and validators
 * - Table type configurations (35 predefined templates)
 * - Type definitions for table configs
 * - Helper functions for working with table configs
 *
 * Usage:
 * ```typescript
 * // Import constants
 * import { FIELD_TYPE_SHORT_TEXT, isValidFieldType } from '@workspace/beqeek-shared';
 * import { ACTION_TYPE_CREATE, getValidPermissionsForActionType } from '@workspace/beqeek-shared';
 *
 * // Import table configs
 * import { TABLE_CONFIGS, getTableConfig } from '@workspace/beqeek-shared/configs';
 * import type { TableConfig, TableFieldConfig } from '@workspace/beqeek-shared/types';
 * ```
 */

// Export all constants
export * from './constants/index.js';

// Export all validators
export * from './validators/index.js';

// Export all configs (can also be imported from '@workspace/beqeek-shared/configs')
export * from './configs/index.js';

// Export all types (can also be imported from '@workspace/beqeek-shared/types')
export * from './types/index.js';

// Export utilities
export * from './utils/uuid-generator.js';
export * from './utils/default-actions.js';
export * from './utils/html-utils.js';
