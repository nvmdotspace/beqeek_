import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import CryptoJS from 'crypto-js';

import {
  createActiveTable,
  updateActiveTable,
  deleteActiveTable,
  type CreateTableRequest,
  type UpdateTableRequest,
} from '../api/active-tables-api';
import type { TableFormData } from '../components/table-management-dialog';
import { TEXT_FIELD_TYPES, initDefaultActions } from '@workspace/beqeek-shared';
import {
  RECORD_LIST_LAYOUT_GENERIC_TABLE,
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  COMMENTS_POSITION_RIGHT_PANEL,
} from '@workspace/beqeek-shared/constants/layouts';
// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

export interface UseTableManagementOptions {
  workspaceId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface UseTableManagementReturn {
  createTable: (data: TableFormData) => Promise<void>;
  updateTable: (tableId: string, data: TableFormData) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Generate triple SHA256 hash for encryption authentication
 * Based on api-integration-create-active-table.md specification
 */
function hashKeyForAuth(key: string): string {
  let hash = key;
  for (let i = 0; i < 3; i++) {
    hash = CryptoJS.SHA256(hash).toString();
  }
  return hash;
}

/**
 * Auto-generate hashed keyword fields from text-type fields
 * These fields will be indexed for full-text search on encrypted data
 */
function generateHashedKeywordFields(fields: TableFormData['fields']): string[] {
  return fields.filter((field) => TEXT_FIELD_TYPES.includes(field.type as any)).map((field) => field.name);
}

/**
 * Localize field labels and options before sending to API
 * Converts i18n keys to actual localized text
 */
function localizeFields(fields: TableFormData['fields']): TableFormData['fields'] {
  return fields.map((field) => {
    // Localize label
    const localizedLabel = m[field.label as keyof typeof m]?.() || field.label;

    // Localize placeholder if exists
    const localizedPlaceholder = field.placeholder
      ? m[field.placeholder as keyof typeof m]?.() || field.placeholder
      : field.placeholder;

    // Base localized field
    const localizedField = {
      ...field,
      label: localizedLabel,
      placeholder: localizedPlaceholder,
    };

    // Localize options if they exist
    if ('options' in field && field.options) {
      return {
        ...localizedField,
        options: field.options.map((option) => ({
          ...option,
          text: m[option.text as keyof typeof m]?.() || option.text,
        })),
      };
    }

    return localizedField;
  });
}

export function useTableManagement({
  workspaceId,
  onSuccess,
  onError,
}: UseTableManagementOptions): UseTableManagementReturn {
  const queryClient = useQueryClient();

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (data: TableFormData) => {
      // Localize field labels and options to actual text (not i18n keys)
      const localizedFields = localizeFields(data.fields);

      // Auto-generate hashed keyword fields for searchable text fields
      const hashedKeywordFields = generateHashedKeywordFields(localizedFields);

      // Generate encryption auth key using triple SHA256
      const encryptionAuthKey = data.encryptionKey ? hashKeyForAuth(data.encryptionKey) : '';

      // CRITICAL: If E2EE is enabled, do NOT send encryption key to server
      const encryptionKey = data.e2eeEncryption ? '' : data.encryptionKey || '';

      // Generate default actions (8 system actions with UUID v7)
      // Note: Action names are i18n keys that need to be localized
      const defaultActions = initDefaultActions().map((action) => ({
        ...action,
        name: m[action.name as keyof typeof m]?.() || action.name, // Localize action names
      }));

      const request: CreateTableRequest = {
        data: {
          name: data.name,
          workGroupId: data.workGroupId,
          tableType: data.tableType,
          description: data.description,
          config: {
            title: data.name,
            fields: localizedFields, // Use localized fields with actual text
            e2eeEncryption: data.e2eeEncryption,
            encryptionKey, // Empty string if E2EE enabled (zero-knowledge)
            actions: defaultActions, // 8 default actions with UUID v7
            quickFilters: [],
            tableLimit: 1000,
            hashedKeywordFields, // Auto-generated from text fields
            defaultSort: 'desc',
            kanbanConfigs: [],
            recordListConfig: {
              layout: RECORD_LIST_LAYOUT_GENERIC_TABLE,
              titleField: localizedFields[0]?.name || 'id',
              subLineFields: [],
              tailFields: [],
            },
            recordDetailConfig: {
              layout: RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
              commentsPosition: COMMENTS_POSITION_RIGHT_PANEL,
              titleField: localizedFields[0]?.name || 'id',
              subLineFields: [],
              tailFields: [],
            },
            permissionsConfig: [],
            ganttCharts: [],
            encryptionAuthKey, // Triple SHA256 hash for validation
          },
        },
      };

      return await createActiveTable(workspaceId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['active-tables', workspaceId] });
      onSuccess?.('Table created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create table:', error);

      // Extract error message from response
      let errorMessage = 'Failed to create table. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      onError?.(errorMessage);
    },
  });

  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: async ({ tableId, data }: { tableId: string; data: TableFormData }) => {
      // Localize field labels and options to actual text (not i18n keys)
      const localizedFields = localizeFields(data.fields);

      // Auto-generate hashed keyword fields for searchable text fields
      const hashedKeywordFields = generateHashedKeywordFields(localizedFields);

      // Generate encryption auth key using triple SHA256
      const encryptionAuthKey = data.encryptionKey ? hashKeyForAuth(data.encryptionKey) : '';

      // CRITICAL: If E2EE is enabled, do NOT send encryption key to server
      const encryptionKey = data.e2eeEncryption ? '' : data.encryptionKey || '';

      // Generate default actions (8 system actions with UUID v7)
      // Note: Action names are i18n keys that need to be localized
      const defaultActions = initDefaultActions().map((action) => ({
        ...action,
        name: m[action.name as keyof typeof m]?.() || action.name, // Localize action names
      }));

      const request: UpdateTableRequest = {
        data: {
          name: data.name,
          workGroupId: data.workGroupId,
          tableType: data.tableType,
          description: data.description,
          config: {
            title: data.name,
            fields: localizedFields, // Use localized fields with actual text
            e2eeEncryption: data.e2eeEncryption,
            encryptionKey, // Empty string if E2EE enabled (zero-knowledge)
            actions: defaultActions, // 8 default actions with UUID v7
            quickFilters: [],
            tableLimit: 1000,
            hashedKeywordFields, // Auto-generated from text fields
            defaultSort: 'desc',
            kanbanConfigs: [],
            recordListConfig: {
              layout: RECORD_LIST_LAYOUT_GENERIC_TABLE,
              titleField: localizedFields[0]?.name || 'id',
              subLineFields: [],
              tailFields: [],
            },
            recordDetailConfig: {
              layout: RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
              commentsPosition: COMMENTS_POSITION_RIGHT_PANEL,
              titleField: localizedFields[0]?.name || 'id',
              subLineFields: [],
              tailFields: [],
            },
            permissionsConfig: [],
            ganttCharts: [],
            encryptionAuthKey, // Triple SHA256 hash for validation
          },
        },
      };

      return await updateActiveTable(workspaceId, tableId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['active-tables', workspaceId] });
      onSuccess?.('Table updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update table:', error);

      // Extract error message from response
      let errorMessage = 'Failed to update table. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      onError?.(errorMessage);
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return await deleteActiveTable(workspaceId, tableId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['active-tables', workspaceId] });
      onSuccess?.('Table deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete table:', error);
      onError?.('Failed to delete table. Please try again.');
    },
  });

  // Action methods
  const createTable = useCallback(
    async (data: TableFormData) => {
      await createTableMutation.mutateAsync(data);
    },
    [createTableMutation],
  );

  const updateTable = useCallback(
    async (tableId: string, data: TableFormData) => {
      await updateTableMutation.mutateAsync({ tableId, data });
    },
    [updateTableMutation],
  );

  const deleteTable = useCallback(
    async (tableId: string) => {
      await deleteTableMutation.mutateAsync(tableId);
    },
    [deleteTableMutation],
  );

  return {
    createTable,
    updateTable,
    deleteTable,
    isCreating: createTableMutation.isPending,
    isUpdating: updateTableMutation.isPending,
    isDeleting: deleteTableMutation.isPending,
  };
}
