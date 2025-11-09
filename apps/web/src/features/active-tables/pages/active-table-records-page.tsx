import { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Filter, List, KanbanSquare, GanttChart } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';

import { useActiveTableRecordsWithConfig } from '../hooks/use-active-tables';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useUpdateRecordField } from '../hooks/use-update-record';
import { useListContext } from '../hooks/use-list-context';
import {
  decryptRecords,
  KanbanBoard,
  GanttChartView,
  type TableRecord,
  type ActiveTable,
} from '@workspace/active-tables-core';
import { ROUTES } from '@/shared/route-paths';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs';

// Components
import { generateMockTableConfig, generateMockRecords } from '../lib/mock-data';
import { ErrorCard } from '@/components/error-display';
import { RecordListView } from '../components/record-list-view';

const LoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full rounded-xl" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

type ViewMode = 'list' | 'kanban' | 'gantt';

// Type-safe route API for records route
const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_RECORDS);

export const ActiveTableRecordsPage = () => {
  const navigate = route.useNavigate();
  const { tableId, workspaceId, locale } = route.useParams();
  const searchParams = route.useSearch();
  const listContext = useListContext();

  // View mode from URL (defaults to 'list')
  const viewMode = searchParams.view || 'list';

  // Use combined hook to ensure table config loads before records
  // This prevents race conditions in encryption/decryption logic
  const { table, tableLoading, tableError, records, recordsLoading, recordsError, isReady, nextId } =
    useActiveTableRecordsWithConfig(workspaceId, tableId, {
      paging: 'cursor',
      limit: 50,
      direction: 'desc',
    });

  // Initialize encryption hook (now guaranteed to have table.config when records load)
  const encryption = useTableEncryption(workspaceId ?? '', tableId, table?.config);

  // Initialize record update mutation for kanban DnD
  // IMPORTANT: Always call hook unconditionally (Rules of Hooks)
  const updateRecordMutation = useUpdateRecordField(workspaceId ?? '', tableId ?? '', table ?? null);

  // Decrypt records if E2EE enabled and key is valid
  const [decryptedRecords, setDecryptedRecords] = useState(records);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Track last processed state to prevent infinite loops
  const lastProcessedRef = useRef<string>('');

  // REAL API: Use real data from backend
  const useMockData = false; // Changed to use real API data
  const mockTableConfig = useMemo(() => generateMockTableConfig(), []);
  const mockRecords = useMemo(() => generateMockRecords(12), []);

  // Use mock data or real data
  const mockTable: ActiveTable = {
    id: table?.id || 'mock-table-id',
    name: table?.name || 'Project Tasks - BEQEEK',
    workGroupId: table?.workGroupId || 'mock-workgroup-id',
    tableType: table?.tableType || 'TASK_EISENHOWER',
    description: table?.description,
    config: mockTableConfig,
    createdAt: table?.createdAt,
    updatedAt: table?.updatedAt,
  };

  const displayTable: ActiveTable | null = useMockData ? mockTable : (table ?? null);
  const displayRecords = useMockData ? mockRecords : decryptedRecords;

  useEffect(() => {
    const recordsFingerprint = records.map((record) => ({
      id: record.id,
      record: record.record,
      data: record.data || record.record, // Fallback to record if data is missing
      updatedAt: record.updatedAt,
      valueUpdatedAt: record.valueUpdatedAt,
    }));

    // Create a unique key representing the current state
    const stateKey = JSON.stringify({
      isReady,
      recordsFingerprint,
      isE2EE: encryption.isE2EEEnabled,
      hasKey: !!encryption.encryptionKey,
      tableId: table?.id,
      fieldsCount: table?.config?.fields?.length,
    });

    // Skip if we've already processed this exact state
    if (lastProcessedRef.current === stateKey) {
      return;
    }

    const decryptAllRecords = async () => {
      // Guard: Wait for table config to be loaded
      if (!isReady || !table?.config) {
        setDecryptedRecords([]);
        return;
      }

      // Determine encryption key source
      let decryptionKey: string | null = null;

      if (encryption.isE2EEEnabled) {
        // E2EE mode: Key from localStorage (user must input)
        if (!encryption.isKeyValid || !encryption.encryptionKey) {
          // No valid key - show encrypted data
          setDecryptedRecords(records);
          lastProcessedRef.current = stateKey;
          return;
        }
        decryptionKey = encryption.encryptionKey;
      } else {
        // Server-side encryption mode: Key provided by server in config
        decryptionKey = table.config.encryptionKey ?? null;
      }

      // If no encryption key available, show raw records
      if (!decryptionKey) {
        setDecryptedRecords(records);
        lastProcessedRef.current = stateKey;
        return;
      }

      // Decrypt records with available key using batch decryption
      // Benefits: LRU caching, optimized batch processing, better error handling
      setIsDecrypting(true);
      try {
        const decrypted = await decryptRecords(
          records,
          table.config.fields ?? [],
          decryptionKey!,
          true, // useCache - enable LRU caching for performance
          50, // batchSize - process 50 records at a time
        );
        setDecryptedRecords(decrypted);
        lastProcessedRef.current = stateKey;
      } catch (error) {
        console.error('Failed to decrypt records:', error);
        setDecryptedRecords(records);
        lastProcessedRef.current = stateKey;
      } finally {
        setIsDecrypting(false);
      }
    };

    if (!useMockData) {
      decryptAllRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isReady,
    records,
    encryption.isE2EEEnabled,
    encryption.isKeyValid,
    encryption.encryptionKey,
    table?.id,
    useMockData,
  ]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return displayRecords;

    const query = searchQuery.toLowerCase();
    return displayRecords.filter((record) => {
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
  }, [displayRecords, searchQuery]);

  const handleBack = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL,
      params: { locale, workspaceId, tableId },
    });
  };

  const handleCreateRecord = () => {
    // TODO: Open create record modal
    console.log('Create record');
  };

  const handleViewRecord = (recordOrId: TableRecord | string) => {
    const id = typeof recordOrId === 'string' ? recordOrId : recordOrId.id;

    // Save list context for navigation
    listContext.save({
      recordIds: displayRecords.map((r) => r.id),
      search: searchParams,
      timestamp: Date.now(),
    });

    // Navigate to record detail page
    navigate({
      to: ROUTES.ACTIVE_TABLES.RECORD_DETAIL,
      params: { locale, workspaceId, tableId, recordId: id },
    });
  };

  const handleRecordMove = (recordId: string, newStatus: string) => {
    // Check if table is loaded
    if (!table) {
      console.error('[Kanban] Table not loaded');
      return;
    }

    // Get kanban config to find status field name
    const kanbanConfig = table.config?.kanbanConfigs?.[0];
    if (!kanbanConfig) {
      console.error('[Kanban] Kanban config not found');
      return;
    }

    // Check encryption key if E2EE enabled
    if (table.config.e2eeEncryption && !encryption.isKeyValid) {
      console.error('[Kanban] Encryption key required to update records');
      return;
    }

    console.log(`[Kanban API] Updating record ${recordId}: ${kanbanConfig.statusField} = "${newStatus}"`);

    // Call API - hook handles optimistic update automatically
    // Flow: API call → onMutate (optimistic update) → onSuccess (invalidate) → refetch → decrypt → UI sync
    updateRecordMutation.mutate(
      {
        recordId,
        fieldName: kanbanConfig.statusField,
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

  const isLoading = tableLoading || recordsLoading;

  if (isLoading && !useMockData) {
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

  if (recordsError && !useMockData) {
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

  // Kanban and Gantt configs
  const kanbanConfig = displayTable.config?.kanbanConfigs?.[0];
  const ganttConfig = displayTable.config?.ganttCharts?.[0];

  return (
    <div className="space-y-4 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Table</span>
              <span className="sm:hidden">Back</span>
            </Button>
            {useMockData && (
              <Badge variant="outline" className="border-blue-500 text-blue-700 text-xs">
                Mock Data (Preview)
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{displayTable.name || 'Records'}</h1>
          {displayTable.description && (
            <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {displayTable.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {encryption.isE2EEEnabled && !useMockData && (
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

      {/* Encryption Warning */}
      {encryption.isE2EEEnabled && encryption.keyValidationStatus !== 'valid' && !useMockData && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              Encryption key is required to view encrypted data. Please go back to the table detail page to enter your
              encryption key.
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Mode Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(v) => {
          navigate({
            to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
            params: { locale, workspaceId, tableId },
            search: { ...searchParams, view: v as ViewMode },
          });
        }}
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="list" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              {kanbanConfig && (
                <TabsTrigger value="kanban" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                  <KanbanSquare className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Kanban</span>
                </TabsTrigger>
              )}
              {ganttConfig && (
                <TabsTrigger value="gantt" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                  <GanttChart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Gantt</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Actions (only show on list view) */}
          {viewMode === 'list' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                  <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button onClick={handleCreateRecord} size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>New Record</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <RecordListView
            table={displayTable}
            records={filteredRecords}
            isDecrypting={isDecrypting}
            loading={false}
            onRecordClick={(recordId) => handleViewRecord(recordId)}
          />

          {/* Pagination (TODO) */}
          {nextId && !useMockData && (
            <div className="flex justify-center mt-4">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </TabsContent>

        {/* Kanban View */}
        <TabsContent value="kanban" className="mt-3 sm:mt-6 -mx-3 sm:mx-0">
          {kanbanConfig && displayTable.config && (
            <div className="kanban-mobile-wrapper">
              <KanbanBoard
                table={displayTable}
                records={displayRecords}
                config={kanbanConfig}
                onRecordMove={handleRecordMove}
                onRecordClick={handleViewRecord}
                className="px-2 sm:px-4 gap-2 sm:gap-4 pb-4"
                messages={{
                  loading: 'Loading...',
                  dropHere: 'Drop cards here',
                  error: 'Error',
                  records: 'records',
                }}
              />
            </div>
          )}
        </TabsContent>

        {/* Gantt View */}
        <TabsContent value="gantt" className="mt-3 sm:mt-6 -mx-3 sm:mx-0">
          {ganttConfig && displayTable.config && (
            <Card className="border-0 sm:border">
              <CardContent className="p-0 sm:p-4">
                <div className="gantt-mobile-wrapper overflow-x-auto">
                  <GanttChartView
                    table={displayTable}
                    records={displayRecords}
                    config={ganttConfig}
                    onTaskClick={handleViewRecord}
                    showProgress={true}
                    showToday={true}
                    className="min-h-[400px] sm:min-h-[500px]"
                    messages={{
                      loading: 'Loading timeline...',
                      noRecordsFound: 'No tasks to display',
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActiveTableRecordsPage;
