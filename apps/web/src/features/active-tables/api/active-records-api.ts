import { apiRequest } from '@/shared/api/http-client';

import type { ActiveRecordsResponse, ActiveTableRecord } from '../types';

export interface FetchActiveRecordsParams {
  workspaceId: string;
  tableId: string;
  limit?: number;
  offset?: number;
  pagingMode?: 'offset' | 'cursor';
  cursor?: string | null;
  filters?: Record<string, any>;
  sorting?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

// Endpoints
const recordsEndpoint = (workspaceId: string, tableId: string) =>
  `/api/workspace/${workspaceId}/workflow/get/active_tables/${tableId}/records`;
const createRecordEndpoint = (workspaceId: string, tableId: string) =>
  `/api/workspace/${workspaceId}/workflow/post/active_tables/${tableId}/records`;
const updateRecordEndpoint = (workspaceId: string, tableId: string, recordId: string) =>
  `/api/workspace/${workspaceId}/workflow/patch/active_tables/${tableId}/records/${recordId}`;
const deleteRecordEndpoint = (workspaceId: string, tableId: string, recordId: string) =>
  `/api/workspace/${workspaceId}/workflow/delete/active_tables/${tableId}/records/${recordId}`;

// Read operations
export const fetchActiveTableRecords = ({
  workspaceId,
  tableId,
  limit = 25,
  offset = 0,
  pagingMode = 'offset',
  cursor,
  filters,
  sorting,
}: FetchActiveRecordsParams) =>
  apiRequest<ActiveRecordsResponse>({
    url: recordsEndpoint(workspaceId, tableId),
    method: 'POST',
    data:
      pagingMode === 'cursor'
        ? {
            paging: 'cursor',
            limit,
            next_id: cursor ?? undefined,
            filtering: filters,
            sorting,
          }
        : {
            limit,
            offset,
            filtering: filters,
            sorting,
          },
  });

// Create operations
export interface CreateRecordRequest {
  record: Record<string, any>;
  hashed_keywords?: Record<string, any>;
  record_hashes?: Record<string, any>;
}

export const createActiveTableRecord = (
  workspaceId: string,
  tableId: string,
  request: CreateRecordRequest
) =>
  apiRequest<{ data: { id: string } }>({
    url: createRecordEndpoint(workspaceId, tableId),
    method: 'POST',
    data: request,
  });

// Update operations
export interface UpdateRecordRequest {
  record: Record<string, any>;
  hashed_keywords?: Record<string, any>;
  record_hashes?: Record<string, any>;
}

export const updateActiveTableRecord = (
  workspaceId: string,
  tableId: string,
  recordId: string,
  request: UpdateRecordRequest
) =>
  apiRequest<{ message: string }>({
    url: updateRecordEndpoint(workspaceId, tableId, recordId),
    method: 'POST',
    data: request,
  });

// Delete operations
export const deleteActiveTableRecord = (workspaceId: string, tableId: string, recordId: string) =>
  apiRequest<{ message: string }>({
    url: deleteRecordEndpoint(workspaceId, tableId, recordId),
    method: 'POST',
    data: {},
  });
