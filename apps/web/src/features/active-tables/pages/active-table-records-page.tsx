import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Plus, Search, FileText, Shield } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';

import { useActiveTable } from '../hooks/use-active-tables';
import { useInfiniteActiveTableRecords } from '../hooks/use-infinite-active-table-records';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useUpdateRecordField } from '../hooks/use-update-record';
import { useListContext } from '../hooks/use-list-context';
import { useScrollShortcuts } from '../hooks/use-scroll-shortcuts';
import { useDeleteRecord } from '../hooks/use-delete-record';
import { useWorkspaceUsersWithPrefetch } from '@/features/workspace-users/hooks/use-workspace-users-with-prefetch';
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';
import { KanbanBoard, GanttChartView, RecordList, type TableRecord, type Table } from '@workspace/active-tables-core';
import { ROUTES } from '@/shared/route-paths';
import { RECORD_LIST_LAYOUT_GENERIC_TABLE } from '@workspace/beqeek-shared';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent } from '@workspace/ui/components/card';
import { TabsContent } from '@workspace/ui/components/tabs';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';

// Components
import { ErrorCard } from '@/components/error-display';
import { CreateRecordDialog } from '../components/record-form/create-record-dialog';
import { UpdateRecordDialog } from '../components/record-form/update-record-dialog';
import { InfiniteScrollTrigger } from '../components/infinite-scroll-trigger';
import { RecordsLoadingSkeleton } from '../components/records-loading-skeleton';
import { RecordsEndIndicator } from '../components/records-end-indicator';
import { RecordsErrorBanner } from '../components/records-error-banner';
import { RecordsLiveAnnouncer } from '../components/records-live-announcer';
import { QuickFiltersBar, type QuickFilterValue } from '../components/quick-filters-bar';
import { ViewModeSelector, type ViewMode } from '../components/view-mode-selector';
import { ViewConfigSelector } from '../components/view-config-selector';

const LoadingState = () => (
  <Stack space="space-100">
    <Skeleton className="h-12 w-full rounded-xl" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </Stack>
);

// Type-safe route API for records route
const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_RECORDS);

// Search params type from route definition
interface RecordsSearchParams {
  view?: 'list' | 'kanban' | 'gantt';
  screen?: string;
  filters?: string; // JSON string of QuickFilterValue[]
  sort?: string;
  search?: string;
  page?: number;
}

export const ActiveTableRecordsPage = () => {
  const navigate = route.useNavigate();
  const { tableId, workspaceId, locale } = route.useParams();
  const searchParams = route.useSearch() as RecordsSearchParams;
  const listContext = useListContext();

  // Prefetch workspace users on page load for instant field input availability
  useWorkspaceUsersWithPrefetch(workspaceId);

  // Fetch workspace users for display in record list (user reference fields)
  const { data: workspaceUsers } = useGetWorkspaceUsers(workspaceId, {
    query: 'BASIC_WITH_AVATAR',
  });

  // View mode and config from URL
  const viewMode: ViewMode = (searchParams.view as ViewMode) || 'list';
  const screenId = searchParams.screen;

  // Fetch table configuration first
  const tableQuery = useActiveTable(workspaceId, tableId);
  const table = tableQuery.data?.data;
  const tableLoading = tableQuery.isLoading;
  const tableError = tableQuery.error;

  // Initialize encryption hook
  const encryption = useTableEncryption(workspaceId ?? '', tableId, table?.config);

  // Quick filters state - initialize from URL
  const [quickFilters, setQuickFilters] = useState<QuickFilterValue[]>(() => {
    try {
      const filtersParam = searchParams.filters;
      return filtersParam ? JSON.parse(decodeURIComponent(filtersParam)) : [];
    } catch {
      return [];
    }
  });

  // Search query state - initialize from URL
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.search || '';
  });

  // Local search input state for immediate UI updates without URL changes
  const [localSearchInput, setLocalSearchInput] = useState(() => {
    return searchParams.search || '';
  });

  // Function to commit search (update both state and URL)
  const commitSearch = useCallback(
    (searchValue: string) => {
      const trimmedValue = searchValue.trim();
      setSearchQuery(trimmedValue);
      setLocalSearchInput(trimmedValue);

      const searchParam = trimmedValue || undefined;
      const currentSearchParam = searchParams.search;

      if (searchParam !== currentSearchParam) {
        navigate({
          to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
          params: { locale, workspaceId, tableId },
          search: {
            ...searchParams,
            search: searchParam,
          },
          replace: true,
        });
      }
    },
    [navigate, locale, workspaceId, tableId, searchParams],
  );

  // Sync filters with URL
  useEffect(() => {
    const filtersParam = quickFilters.length > 0 ? encodeURIComponent(JSON.stringify(quickFilters)) : undefined;

    // Only update URL if filters actually changed
    const currentFiltersParam = searchParams.filters;
    if (filtersParam !== currentFiltersParam) {
      navigate({
        to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
        params: { locale, workspaceId, tableId },
        search: {
          ...searchParams,
          filters: filtersParam,
        },
        replace: true, // Use replace to avoid adding to history
      });
    }
  }, [quickFilters, navigate, locale, workspaceId, tableId, searchParams]);

  // Sync local search input and searchQuery when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlSearchValue = searchParams.search || '';
    setLocalSearchInput(urlSearchValue);
    setSearchQuery(urlSearchValue);
  }, [searchParams.search]);

  // Convert quick filters to API filtering format with encryption
  const apiFilters = useMemo(() => {
    if (quickFilters.length === 0 && !searchQuery.trim()) {
      return undefined;
    }

    const filtering: any = {};

    // Add quick filters (encryption handled by the hook for E2E tables)
    if (quickFilters.length > 0 && table?.config?.fields) {
      filtering.record = {};
      quickFilters.forEach((filter) => {
        const field = table.config.fields.find((f) => f.name === filter.fieldName);
        if (field) {
          filtering.record[filter.fieldName] = filter.value;
        }
      });
    }

    // Add search query (if supported by API)
    if (searchQuery.trim()) {
      filtering.fulltext = searchQuery.trim();
    }

    return filtering;
  }, [quickFilters, searchQuery, table?.config?.fields, table?.config?.e2eeEncryption, encryption.encryptionKey]);

  // Use infinite scroll hook for records with automatic decryption
  const {
    records,
    isLoading: recordsLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: recordsError,
    isDecrypting,
    isFilterChange,
  } = useInfiniteActiveTableRecords(workspaceId, tableId, table ?? null, {
    pageSize: 50,
    direction: 'desc',
    enabled: !!table?.config,
    encryptionKey: encryption.encryptionKey,
    filters: apiFilters,
  });

  // Initialize record update mutation for kanban DnD
  const updateRecordMutation = useUpdateRecordField(workspaceId ?? '', tableId ?? '', table ?? null);

  // Initialize delete record hook
  const { deleteRecord } = useDeleteRecord({
    workspaceId: workspaceId ?? '',
    tableId: tableId ?? '',
    table: table ?? null,
  });

  useScrollShortcuts({
    enabled: viewMode === 'list',
  });

  const displayTable: Table | null = table ?? null;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [recordToUpdate, setRecordToUpdate] = useState<TableRecord | null>(null);

  // Records are now filtered server-side, so we just use them directly
  const filteredRecords = records;

  // Get current view configurations
  const kanbanConfigs = displayTable?.config?.kanbanConfigs || [];
  const ganttConfigs = displayTable?.config?.ganttCharts || [];

  // Get current selected config or default to first
  const currentKanbanConfig = useMemo(() => {
    if (screenId && viewMode === 'kanban') {
      return kanbanConfigs.find((c) => c.kanbanScreenId === screenId) || kanbanConfigs[0];
    }
    return kanbanConfigs[0];
  }, [kanbanConfigs, screenId, viewMode]);

  const currentGanttConfig = useMemo(() => {
    if (screenId && viewMode === 'gantt') {
      return ganttConfigs.find((c) => c.ganttScreenId === screenId) || ganttConfigs[0];
    }
    return ganttConfigs[0];
  }, [ganttConfigs, screenId, viewMode]);

  const handleBack = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL,
      params: { locale, workspaceId, tableId },
    });
  };

  const handleCreateRecord = () => {
    // Blur the button to prevent aria-hidden focus warning
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = (recordId: string) => {
    handleViewRecord(recordId);
  };

  const handleViewRecord = (recordOrId: TableRecord | string) => {
    const id = typeof recordOrId === 'string' ? recordOrId : recordOrId.id;

    listContext.save({
      recordIds: filteredRecords.map((r) => r.id),
      search: searchParams,
      timestamp: Date.now(),
    });

    navigate({
      to: ROUTES.ACTIVE_TABLES.RECORD_DETAIL,
      params: { locale, workspaceId, tableId, recordId: id },
    });
  };

  const handleUpdateRecord = (recordId: string) => {
    // Find the record to update
    const record = filteredRecords.find((r) => r.id === recordId);
    if (record) {
      setRecordToUpdate(record);
      setIsUpdateDialogOpen(true);
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    deleteRecord(recordId);
  };

  const handleCustomAction = (actionId: string, recordId: string) => {
    // TODO: Implement custom action execution
    console.log('Custom action triggered:', { actionId, recordId });
    // This will be implemented when custom actions API is ready
  };

  const handleRecordMove = (recordId: string, newStatus: string) => {
    if (!table || !currentKanbanConfig) return;

    if (table.config.e2eeEncryption && !encryption.isKeyValid) return;

    updateRecordMutation.mutate(
      {
        recordId,
        fieldName: currentKanbanConfig.statusField,
        newValue: newStatus,
      },
      {
        onSuccess: () => {
          console.log('[Kanban API] ✅ Record updated successfully');
        },
        onError: (error) => {
          console.error('[Kanban API] ❌ Failed to update record:', error);
        },
      },
    );
  };

  const handleViewModeChange = (mode: ViewMode) => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId },
      search: { ...searchParams, view: mode },
    });
  };

  const handleScreenConfigChange = (configId: string) => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId },
      search: { ...searchParams, screen: configId },
    });
  };

  const isInitialPageLoading = tableLoading && !table;
  const isInitialRecordListLoading = (recordsLoading || isDecrypting) && filteredRecords.length === 0;
  const isFilterLoading = isFilterChange && isFetching;
  const shouldShowRecordListLoading = isInitialRecordListLoading;
  const showFilterOverlay = isFilterLoading && filteredRecords.length > 0;

  if (isInitialPageLoading) {
    return (
      <Box padding="space-300">
        <Stack space="space-300">
          <Inline space="space-050" as="button">
            <Button variant="ghost" onClick={handleBack}>
              <Inline space="space-050" align="center">
                <ArrowLeft className="h-4 w-4" />
                Back to Table
              </Inline>
            </Button>
          </Inline>
          <LoadingState />
        </Stack>
      </Box>
    );
  }

  // Error state
  if (tableError) {
    return (
      <Box padding="space-300">
        <Stack space="space-300">
          <Button variant="ghost" onClick={handleBack}>
            <Inline space="space-050" align="center">
              <ArrowLeft className="h-4 w-4" />
              Back to Table
            </Inline>
          </Button>
          <ErrorCard
            error={tableError}
            onRetry={() => window.location.reload()}
            onBack={handleBack}
            showDetails={import.meta.env.DEV}
          />
        </Stack>
      </Box>
    );
  }

  if (!displayTable) {
    return (
      <Box padding="space-300">
        <Stack space="space-300">
          <Button variant="ghost" onClick={handleBack}>
            <Inline space="space-050" align="center">
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Inline>
          </Button>
          <Card className="border-destructive/40 bg-destructive/10">
            <CardContent>
              <Box padding="space-300">
                <p className="text-destructive">Table not found</p>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    );
  }

  if (recordsError) {
    return (
      <Box padding="space-300">
        <Stack space="space-300">
          <Button variant="ghost" onClick={handleBack}>
            <Inline space="space-050" align="center">
              <ArrowLeft className="h-4 w-4" />
              Back to Table
            </Inline>
          </Button>
          <ErrorCard
            error={recordsError}
            onRetry={() => window.location.reload()}
            onBack={handleBack}
            showDetails={import.meta.env.DEV}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box padding="space-300">
      <Stack space="space-300">
        {/* ARIA Live Region for Screen Readers */}
        <RecordsLiveAnnouncer
          isLoading={recordsLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          error={recordsError}
          recordCount={filteredRecords.length}
        />

        {/* Header Section - Matching Active Tables pattern */}
        <Stack space="space-300">
          {/* TODO: Migrate to primitives when responsive gap support is added */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Stack space="space-025">
              <Inline space="space-050" align="center">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Heading level={1}>{displayTable.name || 'Records'}</Heading>
              </Inline>
              <Text size="small" color="muted">
                {displayTable.description || 'Quản lý bản ghi'}
              </Text>
            </Stack>

            <Inline space="space-050">
              <Button onClick={handleCreateRecord} size="sm">
                <Inline space="space-050" align="center">
                  <Plus className="h-4 w-4" />
                  Tạo bản ghi
                </Inline>
              </Button>
            </Inline>
          </div>

          {/* Stats badges */}
          <Inline space="space-075" wrap>
            <Badge variant="outline">
              <Inline space="space-050" align="center">
                <FileText className="h-3.5 w-3.5" />
                <span>{filteredRecords.length} bản ghi</span>
              </Inline>
            </Badge>
            {encryption.isE2EEEnabled && (
              <Badge
                variant="outline"
                className={
                  encryption.keyValidationStatus === 'valid'
                    ? 'border-success text-success'
                    : 'border-warning text-warning'
                }
              >
                <Inline space="space-050" align="center">
                  <Shield className="h-3.5 w-3.5" />
                  <span>{encryption.keyValidationStatus === 'valid' ? 'E2EE Active' : 'E2EE (Key Required)'}</span>
                </Inline>
              </Badge>
            )}
          </Inline>
        </Stack>

        {/* Encryption Warning */}
        {encryption.isE2EEEnabled && encryption.keyValidationStatus !== 'valid' && (
          <Card className="border-warning bg-warning-subtle">
            <CardContent>
              <Box padding="space-100">
                <p className="text-sm text-warning">
                  Encryption key is required to view encrypted data. Please go back to the table detail page to enter
                  your encryption key.
                </p>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Quick Filters Bar */}
        {displayTable && (
          <QuickFiltersBar
            table={displayTable}
            filters={quickFilters}
            onFilterChange={setQuickFilters}
            workspaceUsers={workspaceUsers}
          />
        )}

        {/* View Controls - Matching Active Tables pattern */}
        <Box padding="space-100" backgroundColor="card" borderRadius="xl" border="default" className="shadow-sm">
          <Stack space="space-075">
            {/* View Mode Selector + Search */}
            {/* TODO: Migrate to primitives when responsive gap support is added */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <ViewModeSelector table={displayTable} currentMode={viewMode} onModeChange={handleViewModeChange} />

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm bản ghi..."
                  value={localSearchInput}
                  onChange={(e) => setLocalSearchInput(e.target.value)}
                  onBlur={(e) => commitSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      commitSearch(e.currentTarget.value);
                    }
                  }}
                  className="h-10 rounded-lg border-border/60 pl-8"
                />
              </div>
            </div>

            {/* View Config Selector (Kanban/Gantt only) */}
            {viewMode === 'kanban' && kanbanConfigs.length > 1 && (
              <ViewConfigSelector
                type="kanban"
                configs={kanbanConfigs}
                currentConfigId={currentKanbanConfig?.kanbanScreenId || ''}
                onConfigChange={handleScreenConfigChange}
              />
            )}

            {viewMode === 'gantt' && ganttConfigs.length > 1 && (
              <ViewConfigSelector
                type="gantt"
                configs={ganttConfigs}
                currentConfigId={currentGanttConfig?.ganttScreenId || ''}
                onConfigChange={handleScreenConfigChange}
              />
            )}
          </Stack>
        </Box>

        {/* Content Area */}
        <Stack space="space-100">
          {/* List View */}
          {viewMode === 'list' && (
            <>
              <div className="relative">
                {showFilterOverlay && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <Inline space="space-050" align="center" className="text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <span className="text-sm">Đang tải...</span>
                    </Inline>
                  </div>
                )}
                <RecordList
                  table={displayTable}
                  records={filteredRecords}
                  config={displayTable.config.recordListConfig || { layout: RECORD_LIST_LAYOUT_GENERIC_TABLE }}
                  loading={shouldShowRecordListLoading}
                  onRecordClick={(record) => handleViewRecord(record)}
                  onUpdateRecord={handleUpdateRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onCustomAction={handleCustomAction}
                  encryptionKey={encryption.encryptionKey || undefined}
                  workspaceUsers={workspaceUsers}
                />
              </div>

              {/* Infinite scroll components */}
              {recordsError && (
                <RecordsErrorBanner
                  error={recordsError}
                  onRetry={() => fetchNextPage()}
                  isRetrying={isFetchingNextPage}
                />
              )}

              {isFetchingNextPage && (
                <RecordsLoadingSkeleton rowCount={3} columnCount={displayTable.config?.fields?.length || 5} />
              )}

              {!recordsError && hasNextPage && !isFetchingNextPage && (
                <InfiniteScrollTrigger
                  onLoadMore={fetchNextPage}
                  hasMore={hasNextPage}
                  isLoading={isFetchingNextPage}
                />
              )}

              {!hasNextPage && filteredRecords.length > 0 && (
                <RecordsEndIndicator
                  recordCount={filteredRecords.length}
                  onBackToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              )}
            </>
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && currentKanbanConfig && displayTable.config && (
            <KanbanBoard
              table={displayTable}
              records={filteredRecords}
              config={currentKanbanConfig}
              onRecordMove={handleRecordMove}
              onRecordClick={handleViewRecord}
              workspaceUsers={workspaceUsers}
              className="gap-2 sm:gap-4"
              messages={{
                loading: 'Loading...',
                dropHere: 'Drop cards here',
                error: 'Error',
                records: 'records',
              }}
            />
          )}

          {/* Gantt View */}
          {viewMode === 'gantt' && currentGanttConfig && displayTable.config && (
            <Card>
              <CardContent>
                <Box padding="space-100">
                  <GanttChartView
                    table={displayTable}
                    records={filteredRecords}
                    config={currentGanttConfig}
                    onTaskClick={handleViewRecord}
                    showProgress={true}
                    showToday={true}
                    className="min-h-[400px] sm:min-h-[500px]"
                    messages={{
                      loading: 'Loading timeline...',
                      noRecordsFound: 'No tasks to display',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* Create Record Dialog */}
        {displayTable && (
          <CreateRecordDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            table={displayTable}
            workspaceId={workspaceId}
            tableId={tableId}
            onSuccess={handleCreateSuccess}
          />
        )}

        {/* Update Record Dialog */}
        {displayTable && recordToUpdate && (
          <UpdateRecordDialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
            table={displayTable}
            record={recordToUpdate}
            workspaceId={workspaceId}
            tableId={tableId}
            onSuccess={() => {
              // Optional: refresh or navigate after update
              console.log('Record updated successfully');
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default ActiveTableRecordsPage;
