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
 *
 * Usage:
 * ```typescript
 * import { FIELD_TYPE_SHORT_TEXT, isValidFieldType } from '@workspace/beqeek-shared';
 * import { ACTION_TYPE_CREATE, getValidPermissionsForActionType } from '@workspace/beqeek-shared';
 * ```
 */

// Export all constants
export * from './constants/index.js';

// Export all validators
export * from './validators/index.js';
