/**
 * usePermissions Hook
 *
 * Hook for checking record permissions
 */

import { useMemo } from 'react';
import type { TableRecord, RecordPermissions } from '../types/record.js';
import { hasPermission } from '../types/record.js';

export interface UsePermissionsOptions {
  record?: TableRecord;
}

export interface UsePermissionsReturn {
  canAccess: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  permissions: RecordPermissions | null;
}

/**
 * Hook for checking record permissions
 *
 * @example
 * ```tsx
 * const { canUpdate, canDelete } = usePermissions({ record });
 *
 * return (
 *   <>
 *     {canUpdate && <button>Edit</button>}
 *     {canDelete && <button>Delete</button>}
 *   </>
 * );
 * ```
 */
export function usePermissions(options: UsePermissionsOptions): UsePermissionsReturn {
  const { record } = options;

  const permissions = useMemo(() => record?.permissions ?? null, [record]);

  const canAccess = useMemo(() => (record ? hasPermission(record, 'access') : false), [record]);

  const canUpdate = useMemo(() => (record ? hasPermission(record, 'update') : false), [record]);

  const canDelete = useMemo(() => (record ? hasPermission(record, 'delete') : false), [record]);

  return {
    canAccess,
    canUpdate,
    canDelete,
    permissions,
  };
}
