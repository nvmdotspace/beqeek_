import { useQuery } from '@tanstack/react-query';
import { TableManager } from '@workspace/active-tables-core';
import type { TableConfig } from '@workspace/active-tables-core';

export interface UseTableOptions {
  apiClient: any;
  tableId: string;
  enabled?: boolean;
}

export interface UseTableReturn {
  table: TableConfig | undefined;
  isLoading: boolean;
  error: Error | null;
  notFound: boolean;

  // Actions
  refetch: () => void;
}

export function useTable(options: UseTableOptions): UseTableReturn {
  const { apiClient, tableId, enabled = true } = options;

  const tableManager = new TableManager(apiClient);

  const {
    data: table,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['table', tableId],
    queryFn: () => tableManager.getTable(tableId),
    enabled: enabled && !!tableId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const notFound = !!error &&
    typeof error === 'object' &&
    'status' in error &&
    error.status === 404;

  return {
    table: table || undefined,
    isLoading,
    error,
    notFound,
    refetch
  };
}
