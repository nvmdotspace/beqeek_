/**
 * RecordDetailPage - Route-connected page for displaying record details
 * Integrates RecordDetail component from @workspace/active-tables-core with web app data layer
 */

import { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { RecordDetail } from '@workspace/active-tables-core';
import { COMMENTS_POSITION_HIDDEN, REFERENCE_FIELD_TYPES, type RecordDetailConfig } from '@workspace/beqeek-shared';
import type { Table, FieldConfig } from '@workspace/active-tables-core';
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
import { useInlineEditContext } from '../hooks/use-inline-edit-context';
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
 * Helper: Extract all visible field names from RecordDetailConfig
 * Returns array of field names that are displayed in the UI
 */
function getVisibleFieldNames(config: RecordDetailConfig | null | undefined): string[] {
  if (!config) return [];

  const fieldNames = new Set<string>();

  // Add common fields
  if (config.headTitleField) fieldNames.add(config.headTitleField);
  config.headSubLineFields?.forEach((f) => fieldNames.add(f));

  // Add layout-specific fields
  if ('rowTailFields' in config) {
    config.rowTailFields?.forEach((f) => fieldNames.add(f));
  }
  if ('column1Fields' in config) {
    config.column1Fields?.forEach((f) => fieldNames.add(f));
  }
  if ('column2Fields' in config) {
    config.column2Fields?.forEach((f) => fieldNames.add(f));
  }

  return Array.from(fieldNames);
}

/**
 * Helper: Check if any visible fields are reference types
 * Returns true if any configured field is a reference type
 */
function configHasReferenceFields(config: RecordDetailConfig | null | undefined, table: Table | null): boolean {
  if (!config || !table) return false;

  const visibleFields = getVisibleFieldNames(config);

  // Check if any field is a reference type
  return visibleFields.some((fieldName) => {
    const field = table.config.fields.find((f: FieldConfig) => f.name === fieldName);
    if (!field) return false;

    // Type-safe check using readonly array includes
    return (REFERENCE_FIELD_TYPES as readonly string[]).includes(field.type);
  });
}

/**
 * Record Detail Page Component
 * Handles data fetching, encryption, and renders RecordDetail component
 */
export default function RecordDetailPage() {
  const { locale, workspaceId, tableId, recordId } = route.useParams();
  const navigate = route.useNavigate();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Step 1: Fetch table configuration first
  const tableQuery = useActiveTable(workspaceId, tableId);
  const table = tableQuery.data?.data ?? null;
  const tableLoading = tableQuery.isLoading;
  const tableError = tableQuery.error;

  // Step 2: Get recordDetailConfig from table
  const recordDetailConfig = table?.config?.recordDetailConfig;

  // Step 3: Check encryption requirements
  const encryption = useTableEncryption(workspaceId ?? '', tableId ?? '', table?.config);

  // Step 4: Fetch single record (only after table config is loaded)
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

  // Extract visible field names from config
  const visibleFields = useMemo(
    () => getVisibleFieldNames(recordDetailConfig as RecordDetailConfig | undefined),
    [recordDetailConfig],
  );

  // Check if config needs reference data
  const needsReferenceData = useMemo(
    () => configHasReferenceFields(recordDetailConfig as RecordDetailConfig | undefined, table),
    [recordDetailConfig, table],
  );

  // Fetch reference records only if config contains reference fields
  // (SELECT_ONE_RECORD, SELECT_LIST_RECORD, FIRST_REFERENCE_RECORD)
  // Pass current record so hook can build proper filtering for FIRST_REFERENCE_RECORD
  // Pass visibleFields to only fetch references for displayed fields
  const { referenceRecords } = useReferenceRecords(workspaceId ?? '', table, {
    records: record ? [record] : [],
    enabled: needsReferenceData, // ✅ Only fetch if config needs it
    visibleFields: visibleFields, // ✅ Only fetch for visible fields
  });

  // Determine if comments should be shown based on config
  const shouldShowComments = recordDetailConfig?.commentsPosition !== COMMENTS_POSITION_HIDDEN;

  // Fetch comments (only if needed)
  const {
    comments,
    addComment,
    isLoading: isLoadingComments,
  } = useRecordComments(workspaceId ?? '', tableId ?? '', recordId, {
    enabled: shouldShowComments,
  });

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

  // Create inline edit context for reference/user fields
  const inlineEditContext = useInlineEditContext({
    workspaceId: workspaceId ?? '',
    table,
    record,
    workspaceUsers,
    encryptionKey: encryption.encryptionKey,
  });

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
        referenceRecords={referenceRecords}
        onDelete={permissions?.delete ? handleDelete : undefined}
        onBack={() => navigate({ to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS, params: { locale, workspaceId, tableId } })}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4">
          <RecordBreadcrumb table={table} />
        </div>

        {/* Conditional Layout based on commentsPosition config */}
        {shouldShowComments ? (
          // Layout with Comments Panel (right-panel)
          <div className="grid grid-cols-12 gap-6">
            {/* Record Detail - Main Content (8 columns) */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-card rounded-lg border p-6">
                <RecordDetail
                  record={record}
                  table={table}
                  onFieldChange={permissions?.update ? handleFieldChange : undefined}
                  onDelete={permissions?.delete ? handleDelete : undefined}
                  onRecordClick={handleRecordClick}
                  readOnly={!permissions?.update}
                  showComments={false} // Comments in sidebar
                  showTimeline={true}
                  showRelatedRecords={true}
                  referenceRecords={referenceRecords}
                  userRecords={userRecordsMap}
                  inlineEditContext={inlineEditContext}
                />
              </div>
            </div>

            {/* Comments Panel - Sidebar (4 columns) */}
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
        ) : (
          // Full-width Layout (commentsPosition: hidden)
          <div className="bg-card rounded-lg border p-6">
            <RecordDetail
              record={record}
              table={table}
              onFieldChange={permissions?.update ? handleFieldChange : undefined}
              onDelete={permissions?.delete ? handleDelete : undefined}
              onRecordClick={handleRecordClick}
              readOnly={!permissions?.update}
              showComments={false} // Hidden by config
              showTimeline={true}
              showRelatedRecords={true}
              referenceRecords={referenceRecords}
              userRecords={userRecordsMap}
              inlineEditContext={inlineEditContext}
            />
          </div>
        )}
      </main>

      {/* Shortcuts Help Dialog */}
      <ShortcutsHelpDialog open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp} />
    </div>
  );
}
