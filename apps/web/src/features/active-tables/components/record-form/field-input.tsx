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
import { useMemo, useState, useEffect } from 'react';
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';
import { createFetchRecordsFunction, createFetchRecordsByIdsFunction } from '../../hooks/use-list-table-records';
import { useQuery } from '@tanstack/react-query';
import { getActiveTable } from '../../api/active-tables-api';

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
  // Support both referenceTableId (spec) and referencedTableId (legacy)
  const referenceTableId = field.referenceTableId || field.referencedTableId;
  const additionalCondition = field.additionalCondition;

  // ⭐ Fetch referenced table metadata for decryption
  const { data: referencedTableData } = useQuery({
    queryKey: ['active-table', workspaceId, referenceTableId],
    queryFn: () => getActiveTable(workspaceId, referenceTableId!),
    enabled: !!referenceTableId && isReferenceField(field.type),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const referencedTable = referencedTableData?.data;

  // Get encryption key for referenced table
  const encryptionKey = useMemo(() => {
    if (!referencedTable) return null;
    if (referencedTable.config.e2eeEncryption) {
      // E2EE mode: get from localStorage
      return localStorage.getItem(`table_${referenceTableId}_encryption_key`);
    }
    // Server-side encryption: will be handled by the referenced table's config
    return null;
  }, [referencedTable, referenceTableId]);

  const fetchRecords = useMemo(() => {
    if (!referenceTableId || !isReferenceField(field.type) || !referencedTable) {
      return undefined;
    }
    return createFetchRecordsFunction(
      workspaceId,
      referenceTableId,
      additionalCondition,
      referencedTable,
      encryptionKey,
    );
  }, [workspaceId, referenceTableId, additionalCondition, referencedTable, encryptionKey, field.type]);

  // Create fetchRecordsByIds function for fetching initial selected records
  const fetchRecordsByIds = useMemo(() => {
    if (!referenceTableId || !isReferenceField(field.type) || !referencedTable) {
      return undefined;
    }
    return createFetchRecordsByIdsFunction(workspaceId, referenceTableId, referencedTable, encryptionKey);
  }, [workspaceId, referenceTableId, referencedTable, encryptionKey, field.type]);

  // Fetch initial selected records for display
  const [initialRecords, setInitialRecords] = useState<Array<{ id: string; [key: string]: unknown }>>([]);

  useEffect(() => {
    const loadInitialRecords = async () => {
      const selectedValue = form.getValues(field.name);

      // No selected value or no fetchRecordsByIds function
      if (!fetchRecordsByIds || !selectedValue) {
        return;
      }

      try {
        // Get selected IDs (single or multiple)
        const selectedIds = Array.isArray(selectedValue) ? selectedValue : [selectedValue];

        // Filter out null/undefined values
        const validIds = selectedIds.filter((id) => id != null && id !== '');

        if (validIds.length === 0) {
          return;
        }

        console.log('[FieldInput] Fetching initial records by IDs:', {
          fieldName: field.name,
          selectedIds: validIds,
        });

        // ⭐ Fetch ONLY the selected records by IDs (source code pattern)
        const selectedRecords = await fetchRecordsByIds(validIds);

        console.log('[FieldInput] Initial records loaded:', {
          fieldName: field.name,
          recordsCount: selectedRecords.length,
          sampleRecord: selectedRecords[0],
        });

        setInitialRecords(selectedRecords);
      } catch (error) {
        console.error('[FieldInput] Failed to load initial records:', error);
      }
    };

    loadInitialRecords();
  }, [fetchRecordsByIds, field.name, form]);

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
            initialRecords={initialRecords}
            referencedTableName={field.referencedTableName || table.name || 'records'}
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
