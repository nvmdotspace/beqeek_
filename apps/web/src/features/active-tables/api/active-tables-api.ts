import { apiRequest } from '@/shared/api/http-client';

import type {
  ActiveTablesResponse,
  ActiveWorkGroupsResponse,
  ActiveTable,
  ActiveTableConfig,
  ActiveTableRecord,
} from '../types';

// Endpoints
const workGroupsEndpoint = (workspaceId: string) => `/api/workspace/${workspaceId}/workflow/get/active_work_groups`;
const tablesEndpoint = (workspaceId: string) => `/api/workspace/${workspaceId}/workflow/get/active_tables`;
const tableDetailEndpoint = (workspaceId: string, tableId: string) =>
  `/api/workspace/${workspaceId}/workflow/get/active_tables/${tableId}`;
const tableRecordsEndpoint = (workspaceId: string, tableId: string) =>
  `/api/workspace/${workspaceId}/workflow/get/active_tables/${tableId}/records`;
const createTableEndpoint = (workspaceId: string) => `/api/workspace/${workspaceId}/workflow/post/active_tables`;
const updateTableEndpoint = (workspaceId: string, tableId: string) =>
  `/api/workspace/${workspaceId}/workflow/patch/active_tables/${tableId}`;
const deleteTableEndpoint = (workspaceId: string, tableId: string) =>
  `/api/workspace/${workspaceId}/workflow/delete/active_tables/${tableId}`;

// Read operations
export const getActiveWorkGroups = (workspaceId: string) =>
  apiRequest<ActiveWorkGroupsResponse>({
    url: workGroupsEndpoint(workspaceId),
    method: 'POST',
  });

export const getActiveTables = (workspaceId: string) =>
  apiRequest<ActiveTablesResponse>({
    url: tablesEndpoint(workspaceId),
    method: 'POST',
  });

export const getActiveTable = (workspaceId: string, tableId: string) =>
  apiRequest<{ data: ActiveTable }>({
    url: tableDetailEndpoint(workspaceId, tableId),
    method: 'POST',
  });

// Create operations
export interface CreateTableRequest {
  data: {
    name: string;
    workGroupId: string;
    tableType: string;
    description?: string;
    config: ActiveTableConfig;
  };
}

export const createActiveTable = (workspaceId: string, request: CreateTableRequest) =>
  apiRequest<{ data: { id: string } }>({
    url: createTableEndpoint(workspaceId),
    method: 'POST',
    data: request,
  });

// Update operations
export interface UpdateTableRequest {
  data: Partial<{
    name: string;
    workGroupId: string;
    tableType: string;
    description: string;
    config: ActiveTableConfig;
  }>;
}

export const updateActiveTable = (workspaceId: string, tableId: string, request: UpdateTableRequest) =>
  apiRequest<{ message: string }>({
    url: updateTableEndpoint(workspaceId, tableId),
    method: 'POST',
    data: request,
  });

// Delete operations
export const deleteActiveTable = (workspaceId: string, tableId: string) =>
  apiRequest<{ message: string }>({
    url: deleteTableEndpoint(workspaceId, tableId),
    method: 'POST',
    data: {},
  });

// Records operations
export interface RecordQueryRequest {
  paging?: 'cursor';
  filtering?: Record<string, unknown>;
  next_id?: string | null;
  previous_id?: string | null;
  direction?: 'asc' | 'desc';
  limit?: number;
  group?: string | null;
}

export interface ActiveTableRecordsResponse {
  data: ActiveTableRecord[];
  next_id?: string | null;
  previous_id?: string | null;
}

export const getActiveTableRecords = (workspaceId: string, tableId: string, request: RecordQueryRequest = {}) =>
  apiRequest<ActiveTableRecordsResponse>({
    url: tableRecordsEndpoint(workspaceId, tableId),
    method: 'POST',
    data: request,
  });
