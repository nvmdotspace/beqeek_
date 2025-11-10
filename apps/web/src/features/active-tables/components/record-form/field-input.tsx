/**
 * Simplified Field Input Component
 *
 * Wrapper around FieldRenderer from active-tables-core for use with React Hook Form
 * Reduces code from 325 lines to ~127 lines by leveraging existing components
 *
 * Week 2: Enhanced with async fetchRecords function for reference fields
 */

import { Controller, UseFormReturn } from 'react-hook-form';
import { FieldRenderer } from '@workspace/active-tables-core';
import { useQuery } from '@tanstack/react-query';
import type { FieldConfig, Table } from '@workspace/active-tables-core';
import {
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
} from '@workspace/beqeek-shared';
import { useCallback } from 'react';

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
  const { data: workspaceUsersData } = useQuery({
    queryKey: ['workspace-users', workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}/workspace/get/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to fetch workspace users');
      const result = await response.json();
      return result.data?.users || [];
    },
    enabled: isUserField(field.type),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Week 2: Create fetchRecords function for async select
  const referencedTableId = (field as any).referencedTableId;
  const fetchRecords = useCallback(
    async (query: string, page: number) => {
      if (!referencedTableId) {
        return { records: [], hasMore: false };
      }

      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/workflow/post/active_tables/${referencedTableId}/records`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              page,
              per_page: 50, // Fetch 50 records at a time
              search: query || undefined,
            }),
          },
        );

        if (!response.ok) throw new Error('Failed to fetch reference records');

        const result = await response.json();
        const records = result.data?.records || [];
        const totalRecords = result.data?.total || 0;

        // Calculate if there are more records
        const hasMore = page * 50 < totalRecords;

        return { records, hasMore };
      } catch (error) {
        console.error('Failed to fetch records:', error);
        throw error;
      }
    },
    [workspaceId, referencedTableId],
  );

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
            workspaceUsers={workspaceUsersData}
            // Week 2: Pass fetchRecords function for async select
            fetchRecords={isReferenceField(field.type) ? fetchRecords : undefined}
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
