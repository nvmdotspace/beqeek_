import { useEffect, useState, useMemo } from 'react';
import {
  ChevronRight,
  FolderOpen,
  MessageSquare,
  Table2,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';

// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useActiveTables } from '../hooks/use-active-tables';
import { useActiveTableRecords } from '../hooks/use-active-records';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useDecryptedRecords } from '../hooks/use-decrypted-records';
import type { ActiveTableRecord } from '../types';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import { RecordManagementDialog } from '../components/record-management-dialog';
import { useRecordManagement } from '../hooks/use-record-management';
import { PermissionsMatrix } from '../components/permissions-matrix';

// New components
import { DataTable } from '../components/data-table/data-table';
import { createColumns } from '../components/data-table/data-table-columns';
import { KanbanBoard } from '../components/kanban/kanban-board';
import { CommentsPanel } from '../components/comments/comments-panel';
import { EncryptionKeyDialog } from '../components/encryption/encryption-key-dialog';
import { EncryptionStatus, useEncryptionStatus } from '../components/encryption/encryption-status';

const TableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

export const ActiveTableRecordsPage = () => {
  const params = useParams({ strict: false });
  const location = useLocation();
  const navigate = useNavigate();
  const locale = 'en'; // Placeholder for locale
  const tableId = params.tableId as string;
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActiveTableRecord | null>(null);
  const [commentsRecord, setCommentsRecord] = useState<ActiveTableRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'kanban' | 'permissions'>('table');
  const [isEncryptionDialogOpen, setIsEncryptionDialogOpen] = useState(false);

  const search = (location.search ?? {}) as Record<string, unknown>;
  const searchWorkspaceId = typeof search.workspaceId === 'string' ? search.workspaceId : undefined;
  const searchPanel = typeof search.panel === 'string' ? search.panel : undefined;
  const [isCommentsOpen, setIsCommentsOpen] = useState(searchPanel === 'comments');
  const localePrefix = (locale as string) === 'vi' ? '' : `/${locale}`;

  const { data: workspacesData } = useWorkspaces();
  const workspaceOptions = workspacesData?.data ?? [];
  const workspaceId = searchWorkspaceId ?? workspaceOptions[0]?.id;

  const { data: tablesResp, isLoading: isLoadingTables, error: tablesError } = useActiveTables(workspaceId);
  const table = tablesResp?.data.find((item) => item.id === tableId);

  const {
    records,
    isLoading: isLoadingRecords,
    isFetching,
    error: recordsError,
    page,
    loadNext,
    loadPrevious,
    refetch,
  } = useActiveTableRecords({ workspaceId, tableId });

  // Encryption management
  const {
    isE2EEEnabled,
    encryptionKey,
    isKeyLoaded,
    isLoading: isLoadingEncryption,
    error: encryptionError,
    saveKey,
    encryptionAuthKey,
    isEncryptionRequired,
  } = useTableEncryption({
    table,
    workspaceId: workspaceId || '',
  });

  // Decrypt records
  const { records: decryptedRecords, isDecrypting } = useDecryptedRecords({
    records,
    fields: table?.config?.fields ?? [],
    encryptionKey,
    isE2EEEnabled,
  });

  // Get encryption status for badge
  const encryptionStatus = useEncryptionStatus(isE2EEEnabled, isKeyLoaded);

  // Show encryption dialog if key is required but not loaded
  useEffect(() => {
    if (isEncryptionRequired && !isKeyLoaded && !isLoadingEncryption) {
      setIsEncryptionDialogOpen(true);
    }
  }, [isEncryptionRequired, isKeyLoaded, isLoadingEncryption]);

  useEffect(() => {
    setIsCommentsOpen(searchPanel === 'comments');
  }, [searchPanel]);

  useEffect(() => {
    if (!commentsRecord) return;
    const updatedRecord = records.find((item) => item.id === commentsRecord.id);
    if (updatedRecord && updatedRecord !== commentsRecord) {
      setCommentsRecord(updatedRecord);
    }
  }, [records, commentsRecord]);

  const { createRecord, updateRecord, deleteRecord, isCreating, isUpdating } = useRecordManagement({
    workspaceId: workspaceId || '',
    tableId: tableId || '',
    onSuccess: (message) => {
      console.log(message);
      setIsRecordDialogOpen(false);
      setEditingRecord(null);
      refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleBack = () => {
    navigate({
      to: `${localePrefix}/workspaces/tables/${tableId ?? ''}`,
      search: workspaceId ? { workspaceId } : undefined,
    });
  };

  const recordsRoute = `${localePrefix}/workspaces/tables/${tableId}/records`;

  const updatePanelSearch = (panel?: 'comments') => {
    if (!tableId) return;
    const nextSearch: Record<string, unknown> = {};
    if (workspaceId) {
      nextSearch.workspaceId = workspaceId;
    }
    if (panel) {
      nextSearch.panel = panel;
    }
    navigate({
      to: recordsRoute,
      search: nextSearch,
      replace: true,
    });
  };

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setIsRecordDialogOpen(true);
  };

  const handleEditRecord = (record: ActiveTableRecord) => {
    setEditingRecord(record);
    setIsRecordDialogOpen(true);
  };

  const handleDeleteRecord = async (record: ActiveTableRecord) => {
    if (confirm(`Are you sure you want to delete this record? This action cannot be undone.`)) {
      await deleteRecord(record.id);
    }
  };

  const handleSaveRecord = async (recordData: Record<string, any>) => {
    if (editingRecord) {
      await updateRecord(editingRecord.id, recordData);
    } else {
      await createRecord(recordData);
    }
  };

  const handleSelectRecord = (record: ActiveTableRecord) => {
    setCommentsRecord(record);
    setIsCommentsOpen(true);
    updatePanelSearch('comments');
  };

  const handleCommentsPanelChange = (open: boolean) => {
    setIsCommentsOpen(open);
    if (!open) {
      updatePanelSearch(undefined);
      setCommentsRecord(null);
      return;
    }
    updatePanelSearch('comments');
  };

  const handleEncryptionKeySubmit = (key: string, rememberKey: boolean) => {
    try {
      if (rememberKey) {
        saveKey(key);
      }
      setIsEncryptionDialogOpen(false);
    } catch (error) {
      console.error('Failed to save encryption key:', error);
    }
  };

  const handleManageEncryptionKey = () => {
    setIsEncryptionDialogOpen(true);
  };

  // Create table columns with row actions
  const columns = useMemo(
    () =>
      createColumns(table?.config?.fields ?? [], {
        enableRowActions: true,
        onEdit: handleEditRecord,
        onDelete: handleDeleteRecord,
        onViewComments: handleSelectRecord,
      }),
    [table?.config?.fields]
  );

  // Kanban config and handlers
  const kanbanConfig = useMemo(() => {
    // Use first kanban config or create default
    const configs = table?.config?.kanbanConfigs ?? [];
    return configs[0] ?? {
      kanbanScreenId: 'default',
      statusField: '',
      kanbanHeadlineField: '',
      displayFields: [],
      screenName: 'Kanban Board',
      screenDescription: '',
      columnStyles: [],
    };
  }, [table?.config?.kanbanConfigs]);

  const handleUpdateKanbanConfig = async (config: typeof kanbanConfig) => {
    // TODO: Implement API call to update kanban config
    console.log('Update kanban config:', config);
  };

  const handleKanbanCardClick = (record: ActiveTableRecord) => {
    handleSelectRecord(record);
  };

  if (!tableId || !workspaceId) {
    return (
      <div className="space-y-6 p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate({ to: `${localePrefix}/workspaces/tables` })}>
                Active Tables
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-10 text-center text-sm text-destructive">
            {m.activeTables_records_invalidContext()}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = isLoadingTables || isLoadingRecords;
  const error = tablesError || recordsError;
  const fields = table?.config?.fields ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate({ to: `${localePrefix}/workspaces/tables` })}>
              Active Tables
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={handleBack}>
              {table?.name || '...'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{m.activeTables_records_recordsBadge()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Table2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {table?.name || '...'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {m.activeTables_records_recordsBadge()}
              </p>
            </div>
          </div>
          {table?.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              {table.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>{fields.length} fields</span>
          </Badge>
          {isE2EEEnabled && (
            <EncryptionStatus
              status={encryptionStatus}
              isE2EEEnabled={isE2EEEnabled}
              isKeyLoaded={isKeyLoaded}
              onManageKey={handleManageEncryptionKey}
              interactive
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'table' | 'kanban' | 'permissions')}
          className="w-full"
        >
          <Card className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">{m.activeTables_records_viewerTitle()}</CardTitle>
                <p className="text-xs text-muted-foreground">{m.activeTables_records_viewerDescription()}</p>
              </div>
              <TabsList className="flex w-full flex-wrap gap-2">
                <TabsTrigger value="table" className="text-xs sm:text-sm">
                  {m.activeTables_records_tabTable()}
                </TabsTrigger>
                <TabsTrigger value="kanban" className="text-xs sm:text-sm">
                  {m.activeTables_kanban_title()}
                </TabsTrigger>
                <TabsTrigger value="permissions" className="text-xs sm:text-sm">
                  {m.activeTables_permissions_title()}
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="space-y-6">
              <TabsContent value="table" className="space-y-4">
                {isLoading || isDecrypting ? (
                  <TableSkeleton />
                ) : error ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
                    {error instanceof Error ? error.message : m.activeTables_records_errorGeneric()}
                  </div>
                ) : table ? (
                  <DataTable
                    table={table}
                    records={decryptedRecords}
                    columns={columns}
                    isLoading={isLoadingRecords || isDecrypting}
                    isE2EEEnabled={isE2EEEnabled}
                    hasEncryptionKey={isKeyLoaded}
                    onRefresh={refetch}
                    onCreate={handleCreateRecord}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                    {m.activeTables_records_invalidContext()}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="kanban">
                {table ? (
                  <KanbanBoard
                    workspaceId={workspaceId}
                    table={table}
                    records={records}
                    encryptionKey={encryptionKey}
                    config={kanbanConfig}
                    isLoading={isLoadingRecords || isDecrypting}
                    onUpdateConfig={handleUpdateKanbanConfig}
                    onUpdateRecord={updateRecord}
                    onCardClick={handleKanbanCardClick}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                    {m.activeTables_records_invalidContext()}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="permissions">
                {table ? (
                  <PermissionsMatrix workspaceId={workspaceId} table={table} />
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                    {m.activeTables_records_invalidContext()}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <div className="space-y-4">
          {table && (
            <CommentsPanel
              workspaceId={workspaceId}
              table={table}
              record={commentsRecord}
              open={isCommentsOpen}
              onOpenChange={handleCommentsPanelChange}
            />
          )}
          <div className="hidden lg:block">
            {(!isCommentsOpen || !commentsRecord) && (
              <Card className="flex min-h-[360px] flex-col items-center justify-center border-dashed border-border/60 bg-muted/20 text-center text-sm text-muted-foreground">
                <div className="space-y-2 px-6">
                  <MessageSquare className="mx-auto h-5 w-5" />
                  <p>{m.activeTables_comments_hint()}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {table && (
        <RecordManagementDialog
          open={isRecordDialogOpen}
          onOpenChange={setIsRecordDialogOpen}
          table={table}
          record={editingRecord}
          onSave={handleSaveRecord}
          isLoading={isCreating || isUpdating}
        />
      )}

      {/* Encryption Key Dialog */}
      {isE2EEEnabled && (
        <EncryptionKeyDialog
          open={isEncryptionDialogOpen}
          onOpenChange={setIsEncryptionDialogOpen}
          tableName={table?.name}
          encryptionAuthKey={encryptionAuthKey}
          onKeySubmit={handleEncryptionKeySubmit}
          error={encryptionError}
        />
      )}
    </div>
  );
};

export default ActiveTableRecordsPage;
