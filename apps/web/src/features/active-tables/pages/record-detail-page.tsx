/**
 * RecordDetailPage - Route-connected page for displaying record details
 * Integrates RecordDetail component from @workspace/active-tables-core with web app data layer
 */

import { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { RecordDetail } from '@workspace/active-tables-core';
import { ROUTES } from '@/shared/route-paths';
import { useActiveTable } from '../hooks/use-active-tables';
import { useRecordById } from '../hooks/use-record-by-id';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useUpdateRecordField } from '../hooks/use-update-record-field';
import { useDeleteRecord } from '../hooks/use-delete-record';
import { useReferenceRecords } from '../hooks/use-reference-records';
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';
import { useRecordComments } from '../hooks/use-record-comments';
import { useRecordShortcuts } from '../hooks/use-record-shortcuts';
import { RecordHeader } from '../components/record-header';
import { RecordLoadingSkeleton } from '../components/record-loading-skeleton';
import { RecordNotFound } from '../components/record-not-found';
import { EncryptionKeyPrompt } from '../components/encryption-key-prompt';
import { PermissionDeniedError } from '../components/permission-denied-error';
import { CommentsPanel } from '../components/comments-panel';
import { RecordBreadcrumb } from '../components/record-breadcrumb';
import { ShortcutsHelpDialog } from '../components/shortcuts-help-dialog';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL);

/**
 * Record Detail Page Component
 * Handles data fetching, encryption, and renders RecordDetail component
 */
export default function RecordDetailPage() {
  const { locale, workspaceId, tableId, recordId } = route.useParams();
  const navigate = route.useNavigate();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Fetch table configuration (giống active-table-records-page.tsx)
  const tableQuery = useActiveTable(workspaceId, tableId);
  const table = tableQuery.data?.data ?? null;
  const tableLoading = tableQuery.isLoading;
  const tableError = tableQuery.error;

  // Get encryption key (giống active-table-records-page.tsx)
  const encryption = useTableEncryption(workspaceId ?? '', tableId ?? '', table?.config);

  // Fetch single record (giống active-table-records-page.tsx)
  const {
    record,
    isLoading: recordLoading,
    error: recordError,
    permissions,
    refetch: refetchRecord,
  } = useRecordById(workspaceId, tableId, recordId, table, {
    encryptionKey: encryption.encryptionKey,
  });

  // Fetch workspace users (dùng useGetWorkspaceUsers giống active-table-records-page.tsx)
  const { data: workspaceUsers } = useGetWorkspaceUsers(workspaceId ?? '', {
    query: 'BASIC_WITH_AVATAR',
  });

  // Update record field mutation
  const { updateFieldAsync } = useUpdateRecordField(workspaceId ?? '', tableId ?? '', recordId, table, {
    encryptionKey: encryption.encryptionKey,
  });

  // Delete record mutation
  const { deleteRecord: deleteRecordFn } = useDeleteRecord({
    workspaceId: workspaceId ?? '',
    tableId: tableId ?? '',
    table: table ?? null,
    onSuccess: () => {
      navigate({
        to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
        params: { locale, workspaceId, tableId },
      });
    },
  });

  // Fetch reference records for lookup
  const { referenceRecords } = useReferenceRecords(workspaceId ?? '', table);

  // Fetch comments
  const {
    comments,
    addComment,
    isLoading: isLoadingComments,
  } = useRecordComments(workspaceId ?? '', tableId ?? '', recordId);

  // Keyboard shortcuts
  useRecordShortcuts({
    onEscape: () => navigate({ to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS, params: { locale, workspaceId, tableId } }),
    onShowHelp: () => setShowShortcutsHelp(true),
  });

  // Convert workspaceUsers array to Record format for RecordDetail component
  const userRecordsMap = useMemo(() => {
    if (!workspaceUsers) return undefined;
    const map: Record<string, any> = {};
    workspaceUsers.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [workspaceUsers]);

  // Loading state - table config
  if (tableLoading) {
    return <RecordLoadingSkeleton />;
  }

  // Error state - table not found
  if (tableError || !table) {
    return <RecordNotFound type="table" />;
  }

  // E2EE encryption key required
  if (encryption.isE2EEEnabled && encryption.keyValidationStatus !== 'valid') {
    return <EncryptionKeyPrompt tableId={tableId} tableName={table.name} onKeySubmit={encryption.saveKey} />;
  }

  // Loading state - record data
  if (recordLoading) {
    return <RecordLoadingSkeleton />;
  }

  // Error state - record not found
  if (recordError || !record) {
    return <RecordNotFound type="record" />;
  }

  // Permission check - no access
  if (!permissions?.access) {
    return <PermissionDeniedError />;
  }

  // Handle field change - encryption handled by hook
  const handleFieldChange = async (fieldName: string, value: unknown) => {
    await updateFieldAsync({ fieldName, value });
  };

  // Handle delete record
  const handleDelete = async () => {
    // Delete function doesn't return a promise, but make it async for consistency
    deleteRecordFn(recordId);
  };

  // Handle record navigation (for related records)
  const handleRecordClick = (clickedRecordId: string) => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.RECORD_DETAIL,
      params: { locale, workspaceId, tableId, recordId: clickedRecordId },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <RecordHeader
        record={record}
        table={table}
        onDelete={permissions?.delete ? handleDelete : undefined}
        onBack={() => navigate({ to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS, params: { locale, workspaceId, tableId } })}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <RecordBreadcrumb table={table} record={record} />

        <div className="grid grid-cols-12 gap-6 mt-4">
          {/* Record Detail - Main Content */}
          <div className="col-span-12 lg:col-span-8">
            <RecordDetail
              record={record}
              table={table}
              onFieldChange={permissions?.update ? handleFieldChange : undefined}
              onDelete={permissions?.delete ? handleDelete : undefined}
              onRecordClick={handleRecordClick}
              readOnly={!permissions?.update}
              showComments={false} // Shown in sidebar
              showTimeline={true}
              showRelatedRecords={true}
              referenceRecords={referenceRecords}
              userRecords={userRecordsMap}
            />
          </div>

          {/* Comments Panel - Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-20">
              <CommentsPanel
                recordId={recordId}
                comments={comments.map((c) => {
                  const user = workspaceUsers?.find((u) => u.id === c.userId);
                  return {
                    id: c.id,
                    content: c.content,
                    userId: c.userId,
                    userName: user?.name || 'Unknown User',
                    createdAt: c.createdAt,
                  };
                })}
                onCommentAdd={addComment}
                loading={isLoadingComments}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Shortcuts Help Dialog */}
      <ShortcutsHelpDialog open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp} />
    </div>
  );
}
