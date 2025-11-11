/**
 * Record Detail Page (Redesigned)
 *
 * Jira-inspired layout with:
 * - Efficient single-record API fetch with filtering[id][eq]
 * - Two-column responsive layout (main content + sidebar)
 * - Inline field editing with permissions
 * - Rich text comments with Lexical editor
 * - Activity timeline with tabs (Comments/History/All)
 * - Metadata sidebar with quick actions
 * - Full E2EE + server-side encryption support
 *
 * @see docs/specs/doc-get-active-records.md - API specification
 * @see docs/technical/encryption-modes-corrected.md - Encryption handling
 */

import { useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';

// Hooks
import { useRecordById } from '../hooks/use-record-by-id';
import { useActiveTable } from '../hooks/use-active-tables';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useRecordCommentsWithPermissions } from '../hooks/use-record-comments-with-permissions';
import { useUpdateRecordField, canEditField } from '../hooks/use-update-record-field';
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';

// Components
import { Button } from '@workspace/ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Separator } from '@workspace/ui/components/separator';
import { ErrorCard } from '@/components/error-display';
import { ActivityTimeline } from '../components/activity-timeline';
import { RecordDetailSidebar } from '../components/record-detail-sidebar';
import { InlineEditableField } from '../components/inline-editable-field';

// Utils
import { ROUTES } from '@/shared/route-paths';
import type { FieldConfig } from '@workspace/active-tables-core';

// Type-safe route API
const route = getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL);

// Local type definition matching the settings configuration
type RecordDetailConfigWithHead = {
  layout: 'head-detail' | 'two-column-detail';
  commentsPosition: 'right-panel' | 'bottom' | 'hidden';
  headTitleField: string;
  headSubLineFields: string[];
  rowTailFields?: string[];
  column1Fields?: string[];
  column2Fields?: string[];
};

/**
 * Redesigned Record Detail Page
 */
export function RecordDetailPage() {
  const navigate = route.useNavigate();
  const { recordId, tableId, workspaceId, locale } = route.useParams();

  // Fetch table config
  const tableQuery = useActiveTable(workspaceId, tableId);
  const table = tableQuery.data?.data ?? null;
  const tableLoading = tableQuery.isLoading;
  const tableError = tableQuery.error;

  // Get encryption key
  const encryption = useTableEncryption(workspaceId ?? '', tableId ?? '', table?.config);

  // Fetch single record (efficient)
  const {
    record,
    isLoading: recordLoading,
    error: recordError,
    permissions,
    refetch: refetchRecord,
  } = useRecordById(workspaceId, tableId, recordId, table, {
    encryptionKey: encryption.encryptionKey,
  });

  // Fetch workspace users
  const { data: workspaceUsers } = useGetWorkspaceUsers(workspaceId ?? '', {
    query: 'BASIC_WITH_AVATAR',
  });

  // Fetch comments with permissions
  const {
    comments,
    permissions: commentPermissions,
    isLoading: commentsLoading,
    addComment: addCommentAsync,
    updateComment: updateCommentAsync,
    deleteComment: deleteCommentAsync,
  } = useRecordCommentsWithPermissions(
    workspaceId,
    tableId,
    recordId,
    table,
    undefined, // TODO: Pass current user when available
  );

  // Override comment permissions with API response if available
  const effectiveCommentPermissions = useMemo(() => {
    if (permissions?.comment_create !== undefined) {
      // Use permissions from API response
      return {
        canCreate: permissions.comment_create ?? false,
        canAccess: true, // If we can view the record, we can view comments
        canUpdate: () => true, // TODO: Check from API
        canDelete: () => true, // TODO: Check from API
      };
    }
    // Fallback to calculated permissions
    return commentPermissions;
  }, [permissions, commentPermissions]);

  // Wrap comment mutations for components
  const handleAddComment = useCallback(
    async (content: string) => {
      await addCommentAsync(content);
    },
    [addCommentAsync],
  );

  const handleUpdateComment = useCallback(
    async (commentId: string, content: string) => {
      await updateCommentAsync(commentId, content);
    },
    [updateCommentAsync],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      await deleteCommentAsync(commentId);
    },
    [deleteCommentAsync],
  );

  // Field update handler
  const { updateFieldAsync, isUpdating } = useUpdateRecordField(workspaceId, tableId, recordId, table, {
    encryptionKey: encryption.encryptionKey,
    onSuccess: () => {
      void refetchRecord();
    },
  });

  // Wrap the mutation for components
  const handleUpdateField = useCallback(
    async (fieldName: string, value: unknown) => {
      await updateFieldAsync({ fieldName, value });
    },
    [updateFieldAsync],
  );

  // Navigation
  const handleBack = useCallback(() => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId },
    });
  }, [navigate, locale, workspaceId, tableId]);

  // Quick actions
  const handleEdit = useCallback(() => {
    // TODO: Navigate to edit mode or open edit dialog
    console.log('[handleEdit] Not implemented yet');
  }, []);

  const handleDuplicate = useCallback(() => {
    // TODO: Implement duplicate functionality
    console.log('[handleDuplicate] Not implemented yet');
  }, []);

  const handleDelete = useCallback(async () => {
    // TODO: Implement delete functionality
    console.log('[handleDelete] Not implemented yet');
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('[handleShare] Not implemented yet');
  }, []);

  // Group fields by section (based on config or default grouping)
  const fieldSections = useMemo(() => {
    if (!table || !record) {
      return {
        layout: 'head-detail' as const,
        titleField: undefined,
        sublineFields: [],
        rowTailFields: [],
        column1Fields: [],
        column2Fields: [],
        contentFields: [],
      };
    }

    const config = table.config.recordDetailConfig as unknown as RecordDetailConfigWithHead | undefined;
    const allFields = table.config.fields || [];

    // If no config, use default layout with first field as title
    if (!config) {
      const titleField = allFields[0];
      const contentFields = allFields.slice(1);

      return {
        layout: 'head-detail' as const,
        titleField,
        sublineFields: [],
        rowTailFields: [],
        column1Fields: [],
        column2Fields: [],
        contentFields,
      };
    }

    // Title field (shown at top)
    const titleField = allFields.find((f) => f.name === config.headTitleField);

    // Subline fields (shown below title)
    const sublineFields = (config.headSubLineFields || [])
      .map((fieldName: string) => allFields.find((f) => f.name === fieldName))
      .filter(Boolean) as FieldConfig[];

    let excludedFieldNames: string[] = [config.headTitleField, ...(config.headSubLineFields || [])];

    // Layout-specific fields
    if (config.layout === 'two-column-detail') {
      // Two-column layout: use column1Fields and column2Fields
      const column1Fields = (config.column1Fields || [])
        .map((fieldName: string) => allFields.find((f) => f.name === fieldName))
        .filter(Boolean) as FieldConfig[];

      const column2Fields = (config.column2Fields || [])
        .map((fieldName: string) => allFields.find((f) => f.name === fieldName))
        .filter(Boolean) as FieldConfig[];

      excludedFieldNames = [...excludedFieldNames, ...(config.column1Fields || []), ...(config.column2Fields || [])];

      return {
        layout: 'two-column-detail' as const,
        titleField,
        sublineFields,
        rowTailFields: [],
        column1Fields,
        column2Fields,
        contentFields: allFields.filter((f) => !excludedFieldNames.includes(f.name)),
      };
    } else {
      // Head-detail layout (single column): use rowTailFields
      const rowTailFields = (config.rowTailFields || [])
        .map((fieldName: string) => allFields.find((f) => f.name === fieldName))
        .filter(Boolean) as FieldConfig[];

      excludedFieldNames = [...excludedFieldNames, ...(config.rowTailFields || [])];

      return {
        layout: 'head-detail' as const,
        titleField,
        sublineFields,
        rowTailFields,
        column1Fields: [],
        column2Fields: [],
        contentFields: allFields.filter((f) => !excludedFieldNames.includes(f.name)),
      };
    }
  }, [table, record]);

  // Loading state
  if (tableLoading || recordLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 sm:p-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (tableError || recordError) {
    const error = tableError || recordError;
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {locale === 'vi' ? 'Quay lại danh sách' : 'Back to List'}
        </Button>
        {error && (
          <ErrorCard error={error} onRetry={() => window.location.reload()} showDetails={import.meta.env.DEV} />
        )}
      </div>
    );
  }

  // Record not found
  if (!record || !table) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {locale === 'vi' ? 'Quay lại danh sách' : 'Back to List'}
        </Button>
        <ErrorCard
          error={new Error(locale === 'vi' ? 'Không tìm thấy bản ghi' : 'Record not found')}
          onRetry={handleBack}
          showDetails={false}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button */}
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{locale === 'vi' ? 'Quay lại' : 'Back to List'}</span>
              <span className="sm:hidden">{locale === 'vi' ? 'Quay lại' : 'Back'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column: Main Content (2/3 width on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Title Field (large, inline editable) */}
                    {fieldSections.titleField && (
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                          <InlineEditableField
                            field={fieldSections.titleField}
                            value={record.data?.[fieldSections.titleField.name]}
                            canEdit={canEditField(permissions, fieldSections.titleField)}
                            onUpdate={handleUpdateField}
                            isUpdating={isUpdating}
                            editMode="double-click"
                          />
                        </h1>
                      </div>
                    )}

                    {/* Subline Fields (badges, labels) */}
                    {fieldSections.sublineFields && fieldSections.sublineFields.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {fieldSections.sublineFields.map((field) => (
                          <InlineEditableField
                            key={field.name}
                            field={field}
                            value={record.data?.[field.name]}
                            canEdit={canEditField(permissions, field)}
                            onUpdate={handleUpdateField}
                            isUpdating={isUpdating}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Layout-specific content */}
              {fieldSections.layout === 'head-detail' ? (
                <>
                  {/* Head Detail Layout: Single Column */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{locale === 'vi' ? 'Chi tiết' : 'Details'}</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Row Tail Fields (inline with labels on right) */}
                        {fieldSections.rowTailFields.map((field) => (
                          <div key={field.name} className="flex items-start justify-between gap-4 py-2">
                            <label className="text-sm font-medium text-muted-foreground flex-shrink-0 pt-2">
                              {field.label || field.name}
                            </label>
                            <div className="flex-1 text-right">
                              <InlineEditableField
                                field={field}
                                value={record.data?.[field.name]}
                                canEdit={canEditField(permissions, field)}
                                onUpdate={handleUpdateField}
                                isUpdating={isUpdating}
                              />
                            </div>
                          </div>
                        ))}

                        {/* Content Fields (standard layout) */}
                        {fieldSections.contentFields.map((field) => (
                          <div key={field.name} className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              {field.label || field.name}
                            </label>
                            <InlineEditableField
                              field={field}
                              value={record.data?.[field.name]}
                              canEdit={canEditField(permissions, field)}
                              onUpdate={handleUpdateField}
                              isUpdating={isUpdating}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Column 1 */}
                    {fieldSections.column1Fields.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{locale === 'vi' ? 'Cột 1' : 'Column 1'}</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {fieldSections.column1Fields.map((field) => (
                              <div key={field.name} className="grid gap-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  {field.label || field.name}
                                </label>
                                <InlineEditableField
                                  field={field}
                                  value={record.data?.[field.name]}
                                  canEdit={canEditField(permissions, field)}
                                  onUpdate={handleUpdateField}
                                  isUpdating={isUpdating}
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Column 2 */}
                    {fieldSections.column2Fields.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{locale === 'vi' ? 'Cột 2' : 'Column 2'}</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {fieldSections.column2Fields.map((field) => (
                              <div key={field.name} className="grid gap-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  {field.label || field.name}
                                </label>
                                <InlineEditableField
                                  field={field}
                                  value={record.data?.[field.name]}
                                  onUpdate={handleUpdateField}
                                  canEdit={canEditField(permissions, field)}
                                  isUpdating={isUpdating}
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Additional content fields not in columns */}
                  {fieldSections.contentFields.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{locale === 'vi' ? 'Thông tin khác' : 'Additional Information'}</CardTitle>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {fieldSections.contentFields.map((field) => (
                            <div key={field.name} className="grid gap-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                {field.label || field.name}
                              </label>
                              <InlineEditableField
                                field={field}
                                value={record.data?.[field.name]}
                                canEdit={canEditField(permissions, field)}
                                onUpdate={handleUpdateField}
                                isUpdating={isUpdating}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Activity Timeline */}
              <ActivityTimeline
                comments={comments}
                activities={[]} // TODO: Fetch system activities from API
                permissions={effectiveCommentPermissions}
                currentUserId={undefined} // TODO: Get from auth
                workspaceUsers={workspaceUsers}
                isLoading={commentsLoading}
                onCommentAdd={handleAddComment}
                onCommentUpdate={handleUpdateComment}
                onCommentDelete={handleDeleteComment}
                locale={locale}
              />
            </div>

            {/* Right Column: Sidebar (1/3 width on desktop, stacked on mobile) */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="lg:sticky lg:top-20 space-y-4">
                <RecordDetailSidebar
                  table={table}
                  record={record}
                  permissions={permissions}
                  workspaceUsers={workspaceUsers}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
