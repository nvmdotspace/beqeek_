/**
 * Hook for updating Active Table configuration
 *
 * This hook provides functionality to update the entire table configuration
 * including fields, actions, quick filters, views (kanban, gantt, list, detail),
 * and permissions settings.
 *
 * Based on BA documentation in docs/BA/active-tables/settings/
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import type { Table, TableConfig } from '@workspace/active-tables-core';
import {
  RECORD_LIST_LAYOUT_HEAD_COLUMN,
  RECORD_LIST_LAYOUT_GENERIC_TABLE,
} from '@workspace/beqeek-shared/constants/layouts';

/**
 * Request payload for updating table configuration
 */
export interface UpdateTableConfigRequest {
  /** Table name */
  name: string;

  /** Work group ID */
  workGroupId: string;

  /** Table type */
  tableType: string;

  /** Table description */
  description?: string;

  /** Complete table configuration */
  config: TableConfig;
}

/**
 * Standard API response for table config updates
 */
interface UpdateTableConfigResponse {
  success: boolean;
  message: string;
  data?: {
    tableId: string;
    updatedAt: string;
  };
}

/**
 * Parameters for updating table configuration
 */
export interface UpdateTableConfigParams {
  /** Updated table configuration */
  config: TableConfig;

  /** Optional: Update table metadata */
  metadata?: {
    name?: string;
    workGroupId?: string;
    tableType?: string;
    description?: string;
  };
}

/**
 * Options for the hook
 */
export interface UseUpdateTableConfigOptions {
  /** Callback when update succeeds */
  onSuccess?: (data: UpdateTableConfigResponse) => void;

  /** Callback when update fails */
  onError?: (error: Error) => void;

  /** Callback before mutation starts */
  onMutate?: (params: UpdateTableConfigParams) => void;

  /** Callback after mutation completes (success or error) */
  onSettled?: () => void;
}

/**
 * Hook for updating Active Table configuration
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Table ID to update
 * @param table - Current table data (for optimistic updates)
 * @param options - Hook options for callbacks
 * @returns Mutation object with mutate, mutateAsync, isPending, etc.
 *
 * @example
 * ```tsx
 * const updateConfig = useUpdateTableConfig(workspaceId, tableId, table, {
 *   onSuccess: () => {
 *     toast.success('Table configuration updated successfully');
 *   },
 *   onError: (error) => {
 *     toast.error(`Failed to update: ${error.message}`);
 *   }
 * });
 *
 * // Update entire configuration
 * updateConfig.mutate({
 *   config: {
 *     ...table.config,
 *     fields: updatedFields,
 *     kanbanConfigs: updatedKanbanConfigs,
 *   },
 *   metadata: {
 *     name: 'New Table Name',
 *     description: 'Updated description'
 *   }
 * });
 * ```
 */
export function useUpdateTableConfig(
  workspaceId: string,
  tableId: string,
  table: Table | null,
  options?: UseUpdateTableConfigOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ config, metadata }: UpdateTableConfigParams) => {
      if (!table) {
        throw new Error('Table data not loaded');
      }

      const client = createActiveTablesApiClient(workspaceId);

      // Validate configuration
      validateTableConfig(config);

      // Build request payload
      // Using the single PATCH endpoint as documented in API-ENDPOINTS-ANALYSIS.md
      const request: UpdateTableConfigRequest = {
        name: metadata?.name ?? table.name,
        workGroupId: metadata?.workGroupId ?? table.workGroupId,
        tableType: metadata?.tableType ?? table.tableType,
        description: metadata?.description ?? table.description,
        config: {
          ...config,
          // Ensure encryption keys are handled properly
          // Never send actual encryption key if E2EE is enabled
          encryptionKey: config.e2eeEncryption ? '' : config.encryptionKey || '',
          // Auth key should be the triple SHA256 hash
          encryptionAuthKey: config.encryptionAuthKey || '',
        },
      };

      // API endpoint: PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
      // Note: Even though it's a PATCH operation, the API uses POST method
      const response = await client.post<UpdateTableConfigResponse>(`/workflow/patch/active_tables/${tableId}`, {
        ...request,
      } as Record<string, unknown>);

      return response.data;
    },

    onMutate: async (params) => {
      await queryClient.cancelQueries({
        queryKey: ['active-table', workspaceId, tableId],
      });

      const previousTable = queryClient.getQueryData<{ data: Table }>(['active-table', workspaceId, tableId]);
      if (table && previousTable) {
        queryClient.setQueryData(['active-table', workspaceId, tableId], {
          ...previousTable,
          data: {
            ...table,
            name: params.metadata?.name ?? table.name,
            workGroupId: params.metadata?.workGroupId ?? table.workGroupId,
            tableType: params.metadata?.tableType ?? table.tableType,
            description: params.metadata?.description ?? table.description,
            config: params.config,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      options?.onMutate?.(params);
      return { previousTable };
    },

    onError: (error, variables, context) => {
      if (context?.previousTable) {
        queryClient.setQueryData(['active-table', workspaceId, tableId], context.previousTable);
      }

      console.error('Failed to update table configuration:', error);
      options?.onError?.(error as Error);
    },

    onSuccess: (data) => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['active-table', workspaceId, tableId],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-tables', workspaceId],
      });

      // Call user's onSuccess if provided
      options?.onSuccess?.(data);
    },

    onSettled: () => {
      // Call user's onSettled if provided
      options?.onSettled?.();
    },
  });
}

/**
 * Validate table configuration before sending to API
 * Throws an error if configuration is invalid
 */
function validateTableConfig(config: TableConfig): void {
  // Validate required fields
  if (!config.title) {
    throw new Error('Table title is required');
  }

  if (!config.fields || !Array.isArray(config.fields)) {
    throw new Error('Table must have fields defined');
  }

  if (config.fields.length === 0) {
    throw new Error('Table must have at least one field');
  }

  // Validate field names are unique
  const fieldNames = new Set<string>();
  for (const field of config.fields) {
    if (!field.name) {
      throw new Error('All fields must have a name');
    }

    if (fieldNames.has(field.name)) {
      throw new Error(`Duplicate field name: ${field.name}`);
    }

    fieldNames.add(field.name);

    if (!field.type) {
      throw new Error(`Field "${field.name}" must have a type`);
    }

    if (!field.label) {
      throw new Error(`Field "${field.name}" must have a label`);
    }
  }

  // Validate kanban configurations
  // Note: We allow invalid field references in kanban configs to prevent blocking API calls
  // The UI will show warnings for invalid fields, but the config can still be saved
  if (config.kanbanConfigs && config.kanbanConfigs.length > 0) {
    for (const kanban of config.kanbanConfigs) {
      if (!kanban.statusField) {
        throw new Error('Kanban configuration must have a status field');
      }

      if (!kanban.kanbanHeadlineField) {
        throw new Error('Kanban configuration must have a headline field');
      }
    }
  }

  // Validate gantt configurations
  // Note: We allow invalid field references in gantt configs to prevent blocking API calls
  if (config.ganttCharts && config.ganttCharts.length > 0) {
    for (const gantt of config.ganttCharts) {
      if (!gantt.taskNameField) {
        throw new Error('Gantt configuration must have a task name field');
      }
      if (!gantt.startDateField || !gantt.endDateField) {
        throw new Error('Gantt configuration must have start and end date fields');
      }
    }
  }

  // Validate record list configuration
  // Note: We allow invalid field references to prevent blocking API calls
  if (config.recordListConfig) {
    const listConfig = config.recordListConfig as ExtendedRecordListConfig;

    if (listConfig.layout === RECORD_LIST_LAYOUT_HEAD_COLUMN) {
      if (!listConfig.titleField) {
        throw new Error('Record list configuration with head-column layout must have a title field');
      }
    } else if (listConfig.layout === RECORD_LIST_LAYOUT_GENERIC_TABLE) {
      // Generic table layout requires displayFields
      if (!listConfig.displayFields || !Array.isArray(listConfig.displayFields)) {
        throw new Error('Record list configuration with generic-table layout must have displayFields');
      }
    }
  }

  // Validate quick filters
  // Note: We allow invalid field references in quick filters to prevent blocking API calls
  // The UI will show warnings for invalid fields, but the config can still be saved
  if (config.quickFilters && config.quickFilters.length > 0) {
    for (const filter of config.quickFilters) {
      if (!filter.fieldName) {
        throw new Error('Quick filter must have a field name');
      }
    }
  }

  // Validate table limit
  if (config.tableLimit && (config.tableLimit < 1 || config.tableLimit > 100000)) {
    throw new Error('Table limit must be between 1 and 100000');
  }
}

/**
 * Helper function to build partial config updates
 * Useful when updating specific sections of configuration
 *
 * @example
 * ```tsx
 * // Update only fields
 * const updatedConfig = buildPartialConfigUpdate(table.config, {
 *   fields: newFields
 * });
 *
 * // Update only kanban configs
 * const updatedConfig = buildPartialConfigUpdate(table.config, {
 *   kanbanConfigs: newKanbanConfigs
 * });
 * ```
 */
export function buildPartialConfigUpdate(currentConfig: TableConfig, updates: Partial<TableConfig>): TableConfig {
  return {
    ...currentConfig,
    ...updates,
    // Preserve encryption settings
    e2eeEncryption: updates.e2eeEncryption ?? currentConfig.e2eeEncryption,
    encryptionKey: updates.encryptionKey ?? currentConfig.encryptionKey,
    encryptionAuthKey: updates.encryptionAuthKey ?? currentConfig.encryptionAuthKey,
  };
}
type ExtendedRecordListConfig = TableConfig['recordListConfig'] & {
  displayFields?: string[];
};

type _ExtendedRecordDetailConfig = TableConfig['recordDetailConfig'] & {
  headTitleField?: string;
  rowTailFields?: string[];
  column1Fields?: string[];
  column2Fields?: string[];
};
