/**
 * RecordDetailPage - Route-connected page for displaying record details
 * Integrates RecordDetail component from @workspace/active-tables-core with web app data layer
 * Uses @workspace/comments for rich comment functionality
 */

import { useState, useMemo, useCallback } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { RecordDetail } from '@workspace/active-tables-core';
import { COMMENTS_POSITION_HIDDEN, REFERENCE_FIELD_TYPES, type RecordDetailConfig } from '@workspace/beqeek-shared';
import type { Table, FieldConfig } from '@workspace/active-tables-core';
import {
  CommentSection,
  type Comment as PackageComment,
  type CommentUser,
  type CommentI18n,
} from '@workspace/comments';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { Heading } from '@workspace/ui/components/typography';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/route-paths';
import { useAuthStore } from '@/features/auth';
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

  // Get current user ID from auth store
  const userId = useAuthStore((state) => state.userId);

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
    refetch: _refetchRecord,
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
  const { referenceRecords, isLoading: isLoadingReferenceRecords } = useReferenceRecords(workspaceId ?? '', table, {
    records: record ? [record] : [],
    enabled: needsReferenceData, // ✅ Only fetch if config needs it
    visibleFields: visibleFields, // ✅ Only fetch for visible fields
  });

  // Determine if comments should be shown based on config
  const shouldShowComments = recordDetailConfig?.commentsPosition !== COMMENTS_POSITION_HIDDEN;

  // Build user lookup map for comment author resolution
  const userLookupMap = useMemo(() => {
    if (!workspaceUsers) return undefined;
    const map = new Map<string, { id: string; fullName: string; avatar?: string }>();
    workspaceUsers.forEach((user) => {
      map.set(user.id, {
        id: user.id,
        fullName: user.name || 'Unknown User',
        avatar: user.avatar,
      });
    });
    return map;
  }, [workspaceUsers]);

  // Fetch comments with E2EE support (only if needed)
  const {
    comments,
    addComment,
    updateComment,
    deleteComment,
    fetchCommentForEdit,
    fetchCommentsByIds,
    isLoading: isLoadingComments,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useRecordComments(workspaceId ?? '', tableId ?? '', recordId, {
    enabled: shouldShowComments,
    encryptionKey: encryption.encryptionKey ?? undefined,
    userLookup: userLookupMap,
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
  // Pass visibleFields, referenceRecords, and loading state to avoid duplicate API calls
  const inlineEditContext = useInlineEditContext({
    workspaceId: workspaceId ?? '',
    table,
    record,
    workspaceUsers,
    encryptionKey: encryption.encryptionKey,
    visibleFields, // ✅ Only fetch for visible fields (optimization)
    referenceRecords, // ✅ Reuse data from useReferenceRecords (avoid duplicate fetches)
    isLoadingReferenceRecords, // ✅ Wait for useReferenceRecords to complete before fetching locally
  });

  // ============================================
  // ALL HOOKS MUST BE BEFORE ANY EARLY RETURNS
  // (React Rules of Hooks)
  // ============================================

  // Handle field change - encryption handled by hook (memoized to prevent re-renders)
  const handleFieldChange = useCallback(
    async (fieldName: string, value: unknown) => {
      await updateFieldAsync({ fieldName, value });
    },
    [updateFieldAsync],
  );

  // Handle delete record (memoized)
  const handleDelete = useCallback(async () => {
    deleteRecordFn(recordId);
  }, [deleteRecordFn, recordId]);

  // Handle record navigation (for related records) - memoized
  const handleRecordClick = useCallback(
    (clickedRecordId: string) => {
      navigate({
        to: ROUTES.ACTIVE_TABLES.RECORD_DETAIL,
        params: { locale, workspaceId, tableId, recordId: clickedRecordId },
      });
    },
    [navigate, locale, workspaceId, tableId],
  );

  // Build current user for CommentSection
  const currentUser = useMemo((): CommentUser | null => {
    if (!userId || !workspaceUsers) return null;
    const user = workspaceUsers.find((u) => u.id === userId);
    if (!user) return null;
    return {
      id: user.id,
      fullName: user.name || 'Unknown User',
      avatarUrl: user.avatar,
    };
  }, [userId, workspaceUsers]);

  // Build mention users list for @mentions in comments
  const mentionUsers = useMemo(() => {
    if (!workspaceUsers) return [];
    return workspaceUsers.map((u) => ({
      id: u.id,
      name: u.name || 'Unknown',
      avatarUrl: u.avatar, // MentionUser interface expects avatarUrl
    }));
  }, [workspaceUsers]);

  // Build i18n for CommentSection
  const commentI18n = useMemo(
    (): Partial<CommentI18n> => ({
      // Common
      loading: m.activeTables_comments_loading(),
      cancel: m.activeTables_comments_cancel(),
      save: m.activeTables_comments_save(),
      delete: m.activeTables_comments_delete(),
      edit: m.activeTables_comments_edit(),
      clear: m.activeTables_comments_clear(),
      // Comment actions
      copyLink: m.activeTables_comments_copyLink(),
      reply: m.activeTables_comments_reply(),
      selected: m.activeTables_comments_selected(),
      upvote: m.activeTables_comments_upvote(),
      comment: m.activeTables_comments_comment(),
      // Placeholders
      placeholder: m.activeTables_comments_placeholder(),
      editPlaceholder: m.activeTables_comments_editPlaceholder(),
      // Messages
      loadMore: m.activeTables_comments_loadMore(),
      empty: m.activeTables_comments_empty(),
      errorUnexpected: m.activeTables_comments_errorUnexpected(),
      // Delete dialog
      deleteTitle: m.activeTables_comments_deleteTitle(),
      deleteConfirmation: m.activeTables_comments_deleteConfirm(),
      // Reply indicator
      replyingTo: m.activeTables_comments_replyingTo(),
      replyingToCount: (count: number) =>
        count > 1 ? `${m.activeTables_comments_replyingTo()} ${count}` : m.activeTables_comments_replyingTo(),
      moreMessages: (count: number) => `+${count}`,
      showMore: (count: number) => `${m.activeTables_comments_loadMore()} (${count})`,
      showLess: m.activeTables_comments_showLess(),
      // Toolbar tooltips
      toolbar: {
        bold: m.activeTables_comments_toolbar_bold(),
        italic: m.activeTables_comments_toolbar_italic(),
        underline: m.activeTables_comments_toolbar_underline(),
        strikethrough: m.activeTables_comments_toolbar_strikethrough(),
        bulletedList: m.activeTables_comments_toolbar_bulletedList(),
        insertLink: m.activeTables_comments_toolbar_insertLink(),
        inlineCode: m.activeTables_comments_toolbar_inlineCode(),
        codeBlock: m.activeTables_comments_toolbar_codeBlock(),
        fontSize: m.activeTables_comments_toolbar_fontSize(),
        textColor: m.activeTables_comments_toolbar_textColor(),
        textAlign: m.activeTables_comments_toolbar_textAlign(),
        attachImage: m.activeTables_comments_toolbar_attachImage(),
        mentionSomeone: m.activeTables_comments_toolbar_mentionSomeone(),
        insertEmoji: m.activeTables_comments_toolbar_insertEmoji(),
        toggleFormatting: m.activeTables_comments_toolbar_toggleFormatting(),
      },
      // Link editor
      linkEditor: {
        confirm: m.activeTables_comments_linkEditor_confirm(),
        cancel: m.activeTables_comments_linkEditor_cancel(),
        editLink: m.activeTables_comments_linkEditor_editLink(),
        removeLink: m.activeTables_comments_linkEditor_removeLink(),
      },
    }),
    [],
  );

  // Handle comments change from CommentSection (for local state updates - fallback only)
  const handleCommentsChange = useCallback((_newComments: PackageComment[]) => {
    // This is only called when API callbacks are not provided
    // Since we provide onAddComment, onUpdateComment, onDeleteComment, this is mostly unused
  }, []);

  // Handle comment errors
  const handleCommentError = useCallback((errorMessage: string) => {
    toast.error(errorMessage);
  }, []);

  // ============================================
  // EARLY RETURNS (after all hooks)
  // ============================================

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
                <Card className="h-[calc(100vh-8rem)] flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <Heading level={4} className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {m.activeTables_comments_title()}
                    </Heading>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    {isLoadingComments ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {m.activeTables_comments_loading()}
                      </div>
                    ) : currentUser ? (
                      <div className="h-full overflow-y-auto px-4 pb-4">
                        <CommentSection
                          value={comments}
                          currentUser={currentUser}
                          onChange={handleCommentsChange}
                          allowUpvote={false}
                          showReactions={false}
                          compactMode={true}
                          mentionUsers={mentionUsers}
                          onAddComment={addComment}
                          onUpdateComment={updateComment}
                          onDeleteComment={deleteComment}
                          onFetchComment={fetchCommentForEdit}
                          onFetchReplyComments={fetchCommentsByIds}
                          onError={handleCommentError}
                          hasNextPage={hasNextPage}
                          isFetchingNextPage={isFetchingNextPage}
                          onLoadMore={fetchNextPage}
                          i18n={commentI18n}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {m.activeTables_comments_loginRequired()}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
