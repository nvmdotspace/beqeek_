import { apiRequest } from '@/shared/api/http-client';

import type { ActiveRecordsResponse } from '../types';

export interface FetchActiveRecordsParams {
  workspaceId: string;
  tableId: string;
  limit?: number;
  offset?: number;
  pagingMode?: 'offset' | 'cursor';
  cursor?: string | null;
}

const recordsEndpoint = ({ workspaceId, tableId }: { workspaceId: string; tableId: string }) =>
  `/api/workspaces/${workspaceId}/active_tables/${tableId}/records`;

export const fetchActiveTableRecords = ({
  workspaceId,
  tableId,
  limit = 25,
  offset = 0,
  pagingMode = 'offset',
  cursor,
}: FetchActiveRecordsParams) =>
  apiRequest<ActiveRecordsResponse>({
    url: recordsEndpoint({ workspaceId, tableId }),
    method: 'POST',
    data:
      pagingMode === 'cursor'
        ? {
            paging: 'cursor',
            limit,
            next_id: cursor ?? undefined,
          }
        : {
            limit,
            offset,
          },
  });
