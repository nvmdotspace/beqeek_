/**
 * Permission Checker Utilities
 *
 * Client-side permission checking for records and actions
 */

import type { TableRecord } from '../types/record.js';
import type { ActionConfig } from '../types/action.js';
import type { PermissionsConfig, PermissionAction } from '../types/config.js';

// ============================================
// Record Permissions
// ============================================

/**
 * Check if user can access record
 */
export function canAccessRecord(record: TableRecord): boolean {
  return record.permissions?.access ?? false;
}

/**
 * Check if user can update record
 */
export function canUpdateRecord(record: TableRecord): boolean {
  return record.permissions?.update ?? false;
}

/**
 * Check if user can delete record
 */
export function canDeleteRecord(record: TableRecord): boolean {
  return record.permissions?.delete ?? false;
}

// ============================================
// Action Permissions
// ============================================

/**
 * Check if user can perform action
 *
 * @param actionId - Action ID to check
 * @param teamId - User's team ID
 * @param roleId - User's role ID
 * @param permissionsConfig - Table permissions configuration
 */
export function canPerformAction(
  actionId: string,
  teamId: string,
  roleId: string,
  permissionsConfig: PermissionsConfig[]
): boolean {
  // Find matching permission config
  const config = permissionsConfig.find(
    (c) => c.teamId === teamId && c.roleId === roleId
  );

  if (!config) {
    return false; // No config = deny by default
  }

  // Find action permission
  const actionPerm = config.actions.find((a) => a.actionId === actionId);

  if (!actionPerm) {
    return false; // No permission defined = deny
  }

  return actionPerm.permission === 'allow';
}

/**
 * Filter actions based on permissions
 *
 * @param actions - All available actions
 * @param teamId - User's team ID
 * @param roleId - User's role ID
 * @param permissionsConfig - Table permissions configuration
 * @returns Filtered actions that user can perform
 */
export function filterAllowedActions(
  actions: ActionConfig[],
  teamId: string,
  roleId: string,
  permissionsConfig: PermissionsConfig[]
): ActionConfig[] {
  return actions.filter((action) =>
    canPerformAction(action.actionId, teamId, roleId, permissionsConfig)
  );
}

// ============================================
// Bulk Permission Checking
// ============================================

/**
 * Check if user can perform bulk operation on records
 *
 * @param records - Records to check
 * @param operation - Operation type
 * @returns True if user can perform operation on ALL records
 */
export function canPerformBulkOperation(
  records: TableRecord[],
  operation: 'update' | 'delete'
): boolean {
  return records.every((record) => {
    if (operation === 'update') {
      return canUpdateRecord(record);
    }
    if (operation === 'delete') {
      return canDeleteRecord(record);
    }
    return false;
  });
}

/**
 * Filter records that user can perform operation on
 *
 * @param records - All records
 * @param operation - Operation type
 * @returns Records that user has permission for
 */
export function filterRecordsByPermission(
  records: TableRecord[],
  operation: 'access' | 'update' | 'delete'
): TableRecord[] {
  return records.filter((record) => {
    if (operation === 'access') {
      return canAccessRecord(record);
    }
    if (operation === 'update') {
      return canUpdateRecord(record);
    }
    if (operation === 'delete') {
      return canDeleteRecord(record);
    }
    return false;
  });
}
