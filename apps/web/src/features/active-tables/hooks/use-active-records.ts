import { useCallback, useMemo, useState } from 'react';

import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';

import { fetchActiveTableRecords } from '../api/active-records-api';
import type { ActiveRecordsResponse, ActiveTableRecord } from '../types';

export interface UseActiveRecordsOptions {
  workspaceId?: string;
  tableId?: string;
  pageSize?: number;
}

export interface UseActiveRecordsResult {
  records: ActiveTableRecord[];
  response: ActiveRecordsResponse | undefined;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  loadNext: () => void;
  loadPrevious: () => void;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useActiveTableRecords = (options: UseActiveRecordsOptions): UseActiveRecordsResult => {
  const { workspaceId, tableId, pageSize = 25 } = options;
  const [page, setPage] = useState(0);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const enabled = Boolean(isAuthenticated && workspaceId && tableId);

  const queryResult = useQueryWithAuth({
    queryKey: ['active-table-records', workspaceId, tableId, page, pageSize],
    queryFn: () =>
      fetchActiveTableRecords({
        workspaceId: workspaceId!,
        tableId: tableId!,
        limit: pageSize,
        offset: page * pageSize,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  });

  const records = useMemo(() => queryResult.data?.data ?? [], [queryResult.data]);

  const loadNext = useCallback(() => {
    if (!queryResult.data?.data?.length) return;
    setPage((prev) => prev + 1);
  }, [queryResult.data]);

  const loadPrevious = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const refetch = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  return {
    records,
    response: queryResult.data,
    page,
    pageSize,
    setPage,
    loadNext,
    loadPrevious,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: (queryResult.error as Error) ?? null,
    refetch,
  };
};
