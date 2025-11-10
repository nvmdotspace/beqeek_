import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';

import { useActiveTable } from '../hooks/use-active-tables';
import { useInfiniteActiveTableRecords } from '../hooks/use-infinite-active-table-records';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useUpdateRecordField } from '../hooks/use-update-record';
import { useListContext } from '../hooks/use-list-context';
import { useScrollShortcuts } from '../hooks/use-scroll-shortcuts';
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

// Components
import { ErrorCard } from '@/components/error-display';
import { CreateRecordDialog } from '../components/record-form/create-record-dialog';
import { InfiniteScrollTrigger } from '../components/infinite-scroll-trigger';
import { RecordsLoadingSkeleton } from '../components/records-loading-skeleton';
import { RecordsEndIndicator } from '../components/records-end-indicator';
import { RecordsErrorBanner } from '../components/records-error-banner';
import { RecordsLiveAnnouncer } from '../components/records-live-announcer';
import { QuickFiltersBar, type QuickFilterValue } from '../components/quick-filters-bar';
import { ViewModeSelector, type ViewMode } from '../components/view-mode-selector';
import { ViewConfigSelector } from '../components/view-config-selector';

const LoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full rounded-xl" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

// Type-safe route API for records route
const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_RECORDS);

export const ActiveTableRecordsPage = () => {
  const navigate = route.useNavigate();
  const { tableId, workspaceId, locale } = route.useParams();
  const searchParams = route.useSearch();
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

  // Quick filters state
  const [quickFilters, setQuickFilters] = useState<QuickFilterValue[]>([]);

  // Use infinite scroll hook for records with automatic decryption
  const {
    records,
    isLoading: recordsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: recordsError,
    isDecrypting,
  } = useInfiniteActiveTableRecords(workspaceId, tableId, table ?? null, {
    pageSize: 50,
    direction: 'desc',
    enabled: !!table?.config,
    encryptionKey: encryption.encryptionKey,
  });

  // Initialize record update mutation for kanban DnD
  const updateRecordMutation = useUpdateRecordField(workspaceId ?? '', tableId ?? '', table ?? null);
  useScrollShortcuts({
    enabled: viewMode === 'list',
  });

  const displayTable: Table | null = table ?? null;

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Apply quick filters and search
  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Apply quick filters
    if (quickFilters.length > 0) {
      filtered = filtered.filter((record) => {
        return quickFilters.every((filter) => {
          const fieldValue = record.record?.[filter.fieldName] ?? record.data?.[filter.fieldName];

          if (Array.isArray(filter.value)) {
            return filter.value.includes(String(fieldValue));
          }

          return String(fieldValue) === String(filter.value);
        });
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        return Object.values(record.record).some((value) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === 'number') {
            return value.toString().includes(query);
          }
          return false;
        });
      });
    }

    return filtered;
  }, [records, quickFilters, searchQuery]);

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

  const isLoading = tableLoading || recordsLoading;
  const isInitialRecordListLoading = (recordsLoading || isDecrypting) && filteredRecords.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Table
        </Button>
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (tableError) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Table
        </Button>
        <ErrorCard
          error={tableError}
          onRetry={() => window.location.reload()}
          onBack={handleBack}
          showDetails={import.meta.env.DEV}
        />
      </div>
    );
  }

  if (!displayTable) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">Table not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recordsError) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Table
        </Button>
        <ErrorCard
          error={recordsError}
          onRetry={() => window.location.reload()}
          onBack={handleBack}
          showDetails={import.meta.env.DEV}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ARIA Live Region for Screen Readers */}
      <RecordsLiveAnnouncer
        isLoading={recordsLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        error={recordsError}
        recordCount={filteredRecords.length}
      />

      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background px-3 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Table</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{displayTable.name || 'Records'}</h1>
            {displayTable.description && (
              <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {displayTable.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {encryption.isE2EEEnabled && (
              <Badge
                variant="outline"
                className={
                  encryption.keyValidationStatus === 'valid'
                    ? 'border-green-500 text-green-700 text-xs'
                    : 'border-yellow-500 text-yellow-700 text-xs'
                }
              >
                {encryption.keyValidationStatus === 'valid' ? 'E2EE Active' : 'E2EE (Key Required)'}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {filteredRecords.length} records
            </Badge>
          </div>
        </div>
      </div>

      {/* Encryption Warning */}
      {encryption.isE2EEEnabled && encryption.keyValidationStatus !== 'valid' && (
        <div className="flex-shrink-0 px-3 sm:px-6 py-3">
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800">
                Encryption key is required to view encrypted data. Please go back to the table detail page to enter your
                encryption key.
              </p>
            </CardContent>
          </Card>
        </div>
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

      {/* View Controls */}
      <div className="flex-shrink-0 border-b border-border bg-background px-3 sm:px-6 py-3">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* View Mode Selector + Search + Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <ViewModeSelector table={displayTable} currentMode={viewMode} onModeChange={handleViewModeChange} />

            <div className="flex items-center gap-2 flex-1 sm:max-w-md">
              {/* Search (all views) */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>

              {/* New Record Button */}
              <Button onClick={handleCreateRecord} size="sm" className="text-xs sm:text-sm shrink-0">
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">New Record</span>
                <span className="sm:hidden">New</span>
              </Button>
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
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* List View */}
        {viewMode === 'list' && (
          <div className="p-3 sm:p-6">
            <RecordList
              table={displayTable}
              records={filteredRecords}
              config={displayTable.config.recordListConfig || { layout: RECORD_LIST_LAYOUT_GENERIC_TABLE }}
              loading={isInitialRecordListLoading}
              onRecordClick={(record) => handleViewRecord(record)}
              encryptionKey={encryption.encryptionKey || undefined}
              workspaceUsers={workspaceUsers}
            />

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
              <InfiniteScrollTrigger onLoadMore={fetchNextPage} hasMore={hasNextPage} isLoading={isFetchingNextPage} />
            )}

            {!hasNextPage && filteredRecords.length > 0 && (
              <RecordsEndIndicator
                recordCount={filteredRecords.length}
                onBackToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            )}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && currentKanbanConfig && displayTable.config && (
          <div className="p-3 sm:p-6">
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
          </div>
        )}

        {/* Gantt View */}
        {viewMode === 'gantt' && currentGanttConfig && displayTable.config && (
          <div className="p-3 sm:p-6">
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ActiveTableRecordsPage;
