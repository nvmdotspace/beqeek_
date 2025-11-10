/**
 * Simplified Field Input Component
 *
 * Wrapper around FieldRenderer from active-tables-core for use with React Hook Form
 * Reduces code from 325 lines to ~100 lines by leveraging existing components
 *
 * Week 2: Enhanced with async fetchRecords function for reference fields
 */

import { Controller, UseFormReturn } from 'react-hook-form';
import { FieldRenderer } from '@workspace/active-tables-core';
import type { FieldConfig, Table } from '@workspace/active-tables-core';
import {
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
} from '@workspace/beqeek-shared';
import { useMemo } from 'react';
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';
import { createFetchRecordsFunction } from '../../hooks/use-list-table-records';

interface FieldInputProps {
  field: FieldConfig;
  form: UseFormReturn<any>;
  table: Table;
  workspaceId: string;
  disabled?: boolean;
  /** Mark as first field for auto-focus */
  autoFocus?: boolean;
}

export function FieldInput({ field, form, table, workspaceId, disabled = false, autoFocus = false }: FieldInputProps) {
  // Fetch workspace users for user reference fields
  // Use CREATE_RECORD_FORM preset: only fetches id,fullName (minimal fields for dropdown)
  const {
    data: workspaceUsersData,
    isLoading,
    error,
  } = useGetWorkspaceUsers(workspaceId, {
    query: 'BASIC_WITH_AVATAR',
    reactQueryOptions: {
      enabled: isUserField(field.type),
    },
  });

  // Week 2: Create fetchRecords function for async select
  const referencedTableId = (field as any).referencedTableId;
  const fetchRecords = useMemo(() => {
    if (!referencedTableId || !isReferenceField(field.type)) {
      return undefined;
    }
    return createFetchRecordsFunction(workspaceId, referencedTableId);
  }, [workspaceId, referencedTableId, field.type]);

  return (
    <Controller
      name={field.name}
      control={form.control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
      }}
      render={({ field: formField, fieldState }) => (
        <div data-field-name={field.name} data-autofocus={autoFocus}>
          <FieldRenderer
            field={field}
            value={formField.value}
            onChange={formField.onChange}
            mode="edit"
            disabled={disabled || form.formState.isSubmitting}
            error={fieldState.error?.message}
            table={table}
            workspaceUsers={workspaceUsersData || []}
            // Week 2: Pass fetchRecords function for async select
            fetchRecords={fetchRecords}
            referencedTableName={(field as any).referencedTableName || 'records'}
          />
        </div>
      )}
    />
  );
}

/**
 * Check if field type is a user reference field
 */
function isUserField(type: string): boolean {
  const userFieldTypes = [FIELD_TYPE_SELECT_ONE_WORKSPACE_USER, FIELD_TYPE_SELECT_LIST_WORKSPACE_USER];
  return userFieldTypes.includes(type as any);
}

/**
 * Check if field type is a record reference field
 */
function isReferenceField(type: string): boolean {
  const referenceFieldTypes = [FIELD_TYPE_SELECT_ONE_RECORD, FIELD_TYPE_SELECT_LIST_RECORD];
  return referenceFieldTypes.includes(type as any);
}
