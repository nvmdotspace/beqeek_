/**
 * Record Detail Page
 *
 * Displays full details of a single record with:
 * - Navigation back to list (preserves filters/view mode)
 * - Prev/Next record navigation
 * - Record actions menu
 * - Comments panel (if enabled in config)
 * - Field display based on recordDetailConfig layout
 */

import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';

import { useActiveTableRecordsWithConfig } from '../hooks/use-active-tables';
import { useListContext } from '../hooks/use-list-context';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useRecordComments } from '../hooks/use-record-comments';
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';
import { RecordDetail } from '@workspace/active-tables-core';
import { buildRecordDetailConfig } from '../utils/record-detail-config';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { ErrorCard } from '@/components/error-display';
import { ROUTES } from '@/shared/route-paths';

// Type-safe route API for record detail route
const route = getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL);

export function RecordDetailPage() {
  const navigate = route.useNavigate();
  const { recordId, tableId, workspaceId, locale } = route.useParams();
  const listContext = useListContext();

  // Load list context for navigation
  const context = listContext.load();

  // Get table config and all records (for navigation)
  const { table, tableLoading, tableError, records, recordsLoading, recordsError, isReady } =
    useActiveTableRecordsWithConfig(workspaceId, tableId, {
      paging: 'cursor',
      limit: 1000, // Load all for navigation
      direction: 'desc',
    });

  // Get encryption key for E2EE tables
  const encryption = useTableEncryption(workspaceId ?? '', tableId ?? '', table?.config);

  // Fetch workspace users for user reference fields
  const { data: workspaceUsers } = useGetWorkspaceUsers(workspaceId ?? '', {
    query: 'BASIC_WITH_AVATAR',
  });

  // Get comments for this record (stubbed for now)
  const {
    comments,
    isLoading: commentsLoading,
    addComment,
  } = useRecordComments(workspaceId ?? '', tableId ?? '', recordId ?? '');

  // Find current record and navigation IDs
  const currentRecord = records.find((r) => r.id === recordId);
  const recordIds = context?.recordIds || records.map((r) => r.id);
  const currentIndex = recordIds.indexOf(recordId);
  const previousId = currentIndex > 0 ? recordIds[currentIndex - 1] : null;
  const nextId = currentIndex < recordIds.length - 1 ? recordIds[currentIndex + 1] : null;

  // Navigation handlers
  const handleBack = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId },
      search: context?.search || {}, // Restore previous view state
    });
  };

  const handleNavigateToPrevious = () => {
    if (!previousId) return;
    navigate({
      to: ROUTES.ACTIVE_TABLES.RECORD_DETAIL,
      params: { locale, workspaceId, tableId, recordId: previousId },
    });
  };

  const handleNavigateToNext = () => {
    if (!nextId) return;
    navigate({
      to: ROUTES.ACTIVE_TABLES.RECORD_DETAIL,
      params: { locale, workspaceId, tableId, recordId: nextId },
    });
  };

  const handleCommentAdd = async (content: string) => {
    try {
      await addComment(content);
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Comment creation not yet implemented - gracefully handle
    }
  };

  // Loading state
  if (tableLoading || recordsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Error state
  if (tableError) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <ErrorCard error={tableError} onRetry={() => window.location.reload()} showDetails={import.meta.env.DEV} />
      </div>
    );
  }

  if (recordsError) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <ErrorCard error={recordsError} onRetry={() => window.location.reload()} showDetails={import.meta.env.DEV} />
      </div>
    );
  }

  // Record not found
  if (!currentRecord || !table) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <ErrorCard error={new Error('Record not found')} onRetry={handleBack} showDetails={false} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:p-6">
      {/* Header with Back and Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to List</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Record Navigation */}
        {recordIds.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Record {currentIndex + 1} of {recordIds.length}
            </span>
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                disabled={!previousId}
                onClick={handleNavigateToPrevious}
                aria-label="Previous record"
                className="rounded-none border-r h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={!nextId}
                onClick={handleNavigateToNext}
                aria-label="Next record"
                className="rounded-none h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint (desktop only) */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">←</kbd> Previous
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">→</kbd> Next
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">Esc</kbd> Back to list
        </span>
      </div>

      {/* Record Detail View */}
      {isReady && table && (
        <RecordDetail
          table={table}
          record={currentRecord}
          config={buildRecordDetailConfig(table.config.recordDetailConfig, table.config.fields || [])}
          loading={recordsLoading}
          error={recordsError}
          currentUser={undefined} // TODO: Add when user profile API is available
          workspaceUsers={workspaceUsers}
          encryptionKey={encryption.encryptionKey || undefined}
          comments={comments}
          commentsLoading={commentsLoading}
          onCommentAdd={handleCommentAdd}
          messages={{
            loading: 'Loading record...',
            error: 'Failed to load record',
            recordNotFound: 'Record not found',
            retry: 'Retry',
          }}
          onRetry={() => window.location.reload()}
        />
      )}
    </div>
  );
}
