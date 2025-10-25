import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { RecordManager } from '@workspace/active-tables-core';
import type {
  TableRecord,
  SearchQuery,
  SearchResult,
  CreateRecordRequest,
  UpdateRecordRequest,
  ImportConfig,
  ExportConfig,
  ExportResult
} from '@workspace/active-tables-core';

export interface UseRecordManagerOptions {
  apiClient: any;
  tableId: string;
}

export interface UseRecordManagerReturn {
  // Queries
  records: TableRecord[] | undefined;
  isLoadingRecords: boolean;
  recordsError: Error | null;
  totalCount: number | undefined;

  // Search
  searchResults: SearchResult | undefined;
  isSearching: boolean;
  searchError: Error | null;

  // Mutations
  createRecordMutation: any;
  updateRecordMutation: any;
  deleteRecordMutation: any;
  bulkCreateMutation: any;
  bulkUpdateMutation: any;
  searchMutation: any;
  exportMutation: any;
  importMutation: any;

  // Actions
  createRecord: (request: CreateRecordRequest) => Promise<TableRecord>;
  updateRecord: (recordId: string, request: UpdateRecordRequest) => Promise<TableRecord>;
  deleteRecord: (recordId: string) => Promise<void>;
  getRecord: (recordId: string) => Promise<TableRecord | null>;
  listRecords: (options?: any) => Promise<{ records: TableRecord[]; totalCount: number }>;
  searchRecords: (query: SearchQuery) => Promise<SearchResult>;
  bulkCreateRecords: (records: Array<{ data: any; createdBy: string }>) => Promise<any>;
  bulkUpdateRecords: (updates: Array<{ recordId: string; data: any; updatedBy: string }>) => Promise<any>;
  exportRecords: (config: ExportConfig) => Promise<ExportResult>;
  importRecords: (config: ImportConfig) => Promise<any>;
  refreshRecords: () => void;
  loadMoreRecords: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function useRecordManager(options: UseRecordManagerOptions): UseRecordManagerReturn {
  const { apiClient, tableId } = options;
  const queryClient = useQueryClient();

  const recordManager = new RecordManager(apiClient);

  // Query for records list with pagination
  const {
    data: recordsData,
    isLoading: isLoadingRecords,
    error: recordsError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['records', tableId],
    queryFn: ({ pageParam = 0 }) =>
      recordManager.listRecords(tableId, { offset: pageParam * 25, limit: 25 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.records.length < 25) return undefined;
      return allPages.length;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Flatten records from all pages
  const records = recordsData?.pages.flatMap(page => page.records) || [];
  const totalCount = recordsData?.pages[0]?.totalCount;

  // Get single record
  const getRecord = useCallback(async (recordId: string): Promise<TableRecord | null> => {
    return recordManager.getRecord(recordId, tableId);
  }, [recordManager, tableId]);

  // Create record mutation
  const createRecordMutation = useMutation({
    mutationFn: (request: CreateRecordRequest) => recordManager.createRecord(request),
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: ['records', tableId] });
      queryClient.setQueryData(['record', newRecord.id], newRecord);
    },
    onError: (error) => {
      console.error('Failed to create record:', error);
    }
  });

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: ({ recordId, request }: { recordId: string; request: UpdateRecordRequest }) =>
      recordManager.updateRecord(recordId, request),
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({ queryKey: ['records', tableId] });
      queryClient.setQueryData(['record', updatedRecord.id], updatedRecord);
    },
    onError: (error) => {
      console.error('Failed to update record:', error);
    }
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: (recordId: string) => recordManager.deleteRecord(recordId, tableId),
    onSuccess: (_, recordId) => {
      queryClient.invalidateQueries({ queryKey: ['records', tableId] });
      queryClient.removeQueries({ queryKey: ['record', recordId] });
    },
    onError: (error) => {
      console.error('Failed to delete record:', error);
    }
  });

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (records: Array<{ data: any; createdBy: string }>) =>
      recordManager.bulkCreateRecords(tableId, records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', tableId] });
    },
    onError: (error) => {
      console.error('Failed to bulk create records:', error);
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: Array<{ recordId: string; data: any; updatedBy: string }>) =>
      recordManager.bulkUpdateRecords(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', tableId] });
    },
    onError: (error) => {
      console.error('Failed to bulk update records:', error);
    }
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: (query: SearchQuery) => recordManager.searchRecords(query),
    onError: (error) => {
      console.error('Failed to search records:', error);
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (config: ExportConfig) => recordManager.exportRecords(config),
    onError: (error) => {
      console.error('Failed to export records:', error);
    }
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (config: ImportConfig) => recordManager.importRecords(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', tableId] });
    },
    onError: (error) => {
      console.error('Failed to import records:', error);
    }
  });

  // Action methods
  const createRecord = useCallback(async (request: CreateRecordRequest): Promise<TableRecord> => {
    return createRecordMutation.mutateAsync(request);
  }, [createRecordMutation]);

  const updateRecord = useCallback(async (
    recordId: string,
    request: UpdateRecordRequest
  ): Promise<TableRecord> => {
    return updateRecordMutation.mutateAsync({ recordId, request });
  }, [updateRecordMutation]);

  const deleteRecord = useCallback(async (recordId: string): Promise<void> => {
    return deleteRecordMutation.mutateAsync(recordId);
  }, [deleteRecordMutation]);

  const listRecords = useCallback(async (options?: any) => {
    return recordManager.listRecords(tableId, options);
  }, [recordManager, tableId]);

  const searchRecords = useCallback(async (query: SearchQuery): Promise<SearchResult> => {
    return searchMutation.mutateAsync(query);
  }, [searchMutation]);

  const bulkCreateRecords = useCallback(async (
    records: Array<{ data: any; createdBy: string }>
  ) => {
    return bulkCreateMutation.mutateAsync(records);
  }, [bulkCreateMutation]);

  const bulkUpdateRecords = useCallback(async (
    updates: Array<{ recordId: string; data: any; updatedBy: string }>
  ) => {
    return bulkUpdateMutation.mutateAsync(updates);
  }, [bulkUpdateMutation]);

  const exportRecords = useCallback(async (config: ExportConfig): Promise<ExportResult> => {
    return exportMutation.mutateAsync(config);
  }, [exportMutation]);

  const importRecords = useCallback(async (config: ImportConfig) => {
    return importMutation.mutateAsync(config);
  }, [importMutation]);

  const refreshRecords = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['records', tableId] });
  }, [queryClient, tableId]);

  const loadMoreRecords = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  return {
    // Queries
    records,
    isLoadingRecords,
    recordsError,
    totalCount,

    // Search
    searchResults: searchMutation.data,
    isSearching: searchMutation.isPending,
    searchError: searchMutation.error,

    // Mutations
    createRecordMutation,
    updateRecordMutation,
    deleteRecordMutation,
    bulkCreateMutation,
    bulkUpdateMutation,
    searchMutation,
    exportMutation,
    importMutation,

    // Actions
    createRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    listRecords,
    searchRecords,
    bulkCreateRecords,
    bulkUpdateRecords,
    exportRecords,
    importRecords,
    refreshRecords,
    loadMoreRecords,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage
  };
}
