/**
 * RecordDetailView Component
 *
 * Displays a record's detail view with configurable layout
 * Supports 'head-detail' and 'two-column-detail' layouts
 */

import type { TableRecord, TableConfig, RecordDetailConfig, FieldConfig } from '@workspace/active-tables-core';
import { RecordDetailHeader } from './record-detail-header';
import { RecordFieldDisplay } from './record-field-display';
import { CommentsPanel, generateMockComments, type Comment } from './comments-panel';
import { Card, CardContent } from '@workspace/ui/components/card';

export interface RecordDetailViewProps {
  /** Record to display */
  record: TableRecord;

  /** Table configuration */
  tableConfig: TableConfig;

  /** Optional comments */
  comments?: Comment[];

  /** Callback when comment is added */
  onCommentAdd?: (content: string) => void;

  /** Is loading */
  loading?: boolean;

  /** Custom class name */
  className?: string;
}

/**
 * Main record detail view with layout switching
 */
export function RecordDetailView({
  record,
  tableConfig,
  comments,
  onCommentAdd,
  loading = false,
  className = '',
}: RecordDetailViewProps) {
  const config = tableConfig.recordDetailConfig;

  // Get field configurations
  const titleFieldName = config.titleField;
  const titleField = tableConfig.fields.find((f) => f.name === titleFieldName);

  const subLineFieldNames = config.subLineFields || [];
  const subLineFields = subLineFieldNames
    .map((name) => tableConfig.fields.find((f) => f.name === name))
    .filter((f): f is FieldConfig => f !== undefined);

  if (!titleField) {
    return <div className="p-4 text-destructive">Error: Title field "{config.titleField}" not found</div>;
  }

  // Determine layout
  const layout = config.layout || 'head-detail';
  const showComments = config.commentsPosition === 'right-panel' || config.commentsPosition === 'right';

  // Use mock comments if not provided
  const displayComments = comments || generateMockComments(record.id);

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Main content area */}
      <div className="flex-1 min-w-0">
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            <RecordDetailHeader record={record} titleField={titleField} subLineFields={subLineFields} />

            {/* Content based on layout */}
            <div className="mt-6">
              {layout === 'head-detail' && (
                <HeadDetailLayout record={record} config={config} fields={tableConfig.fields} />
              )}

              {layout === 'two-column-detail' && (
                <TwoColumnDetailLayout record={record} config={config} fields={tableConfig.fields} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments panel (right side) */}
      {showComments && (
        <div className="w-80 flex-shrink-0">
          <CommentsPanel
            recordId={record.id}
            comments={displayComments}
            onCommentAdd={onCommentAdd}
            loading={loading}
            className="sticky top-6"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Head-detail layout (single column)
 */
function HeadDetailLayout({
  record,
  config,
  fields,
}: {
  record: TableRecord;
  config: RecordDetailConfig;
  fields: FieldConfig[];
}) {
  const tailFieldNames = config.tailFields || [];
  const tailFields = tailFieldNames
    .map((name) => fields.find((f) => f.name === name))
    .filter((f): f is FieldConfig => f !== undefined);

  return (
    <div className="space-y-6">
      {tailFields.map((field) => {
        const value = record.record[field.name] ?? record.data?.[field.name];
        return <RecordFieldDisplay key={field.name} field={field} value={value} mode="block" showLabel={true} />;
      })}
    </div>
  );
}

/**
 * Two-column layout
 */
function TwoColumnDetailLayout({
  record,
  config,
  fields,
}: {
  record: TableRecord;
  config: RecordDetailConfig;
  fields: FieldConfig[];
}) {
  const column1Fields = (config.column1Fields || [])
    .map((name) => fields.find((f) => f.name === name))
    .filter((f): f is FieldConfig => f !== undefined);

  const column2Fields = (config.column2Fields || [])
    .map((name) => fields.find((f) => f.name === name))
    .filter((f): f is FieldConfig => f !== undefined);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
      {/* Column 1 */}
      <div className="space-y-6">
        {column1Fields.map((field) => {
          const value = record.record[field.name] ?? record.data?.[field.name];
          return <RecordFieldDisplay key={field.name} field={field} value={value} mode="block" showLabel={true} />;
        })}
      </div>

      {/* Column 2 */}
      <div className="space-y-6">
        {column2Fields.map((field) => {
          const value = record.record[field.name] ?? record.data?.[field.name];
          return <RecordFieldDisplay key={field.name} field={field} value={value} mode="block" showLabel={true} />;
        })}
      </div>
    </div>
  );
}
