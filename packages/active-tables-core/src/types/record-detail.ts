/**
 * Type definitions for Record Detail View components
 * @module active-tables-core/types/record-detail
 */

import type { TableRecord } from './record.js';
import type { Table } from './common.js';
import type { FieldConfig } from './field.js';
import type { WorkspaceUser } from './responses.js';
import type { AsyncRecordSelectRecord } from '../components/fields/field-renderer-props.js';

/**
 * Layout types for record detail view
 */
export type RecordDetailLayout = 'head-detail' | 'two-column';

/**
 * Comments panel position
 */
export type CommentsPosition = 'right-panel' | 'hidden';

/**
 * Props for RecordDetail component
 */
export interface RecordDetailProps {
  // Data
  record: TableRecord;
  table: Table;

  // Layout configuration
  layout?: RecordDetailLayout;
  commentsPosition?: CommentsPosition;

  // Callbacks
  onFieldChange?: (fieldName: string, value: unknown) => Promise<void>;
  onDelete?: () => Promise<void>;
  onRecordClick?: (recordId: string) => void;

  // Feature toggles
  readOnly?: boolean;
  showComments?: boolean;
  showTimeline?: boolean;
  showRelatedRecords?: boolean;

  // Reference data for field rendering
  referenceRecords?: Record<string, TableRecord[]>;
  userRecords?: Record<string, WorkspaceUser>;

  // Inline edit context for reference/user fields
  inlineEditContext?: InlineEditContext;

  // Styling
  className?: string;
}

/**
 * Props for FieldDisplay component (read-only field renderer)
 */
export interface FieldDisplayProps {
  field: FieldConfig;
  value: unknown;
  referenceRecords?: Record<string, TableRecord[]>;
  userRecords?: Record<string, WorkspaceUser>;
  onDoubleClick?: () => void;
  editable?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
}

/**
 * Props for InlineEditField component
 */
export interface InlineEditFieldProps {
  field: FieldConfig;
  value: unknown;
  onSave: (value: unknown) => Promise<void>;
  onCancel: () => void;
  autoFocus?: boolean;
  validateOnChange?: boolean;
  className?: string;
  /** Table metadata for FieldRenderer */
  table?: Table;
  /** Workspace users for user selection fields */
  workspaceUsers?: WorkspaceUser[];
  /** Function to fetch records for reference fields */
  fetchRecords?: (query: string, page: number) => Promise<{ records: AsyncRecordSelectRecord[]; hasMore: boolean }>;
  /** Initial records for displaying pre-selected values */
  initialRecords?: AsyncRecordSelectRecord[];
  /** Referenced table name for display */
  referencedTableName?: string;
}

/**
 * Timeline event types
 */
export type TimelineEventType = 'created' | 'updated' | 'commented' | 'custom';

/**
 * Field change in timeline
 */
export interface FieldChange {
  fieldName: string;
  fieldLabel: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Timeline event
 */
export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  user: WorkspaceUser;
  timestamp: string; // ISO 8601
  changes?: FieldChange[];
  comment?: string;
  customMessage?: string;
}

/**
 * Props for ActivityTimeline component
 */
export interface ActivityTimelineProps {
  recordId: string;
  events: TimelineEvent[];
  loading?: boolean;
  className?: string;
}

/**
 * Props for RelatedRecords component
 */
export interface RelatedRecordsProps {
  record: TableRecord;
  table: Table;
  referenceRecords: Record<string, TableRecord[]>;
  onRecordClick?: (recordId: string) => void;
  className?: string;
}

/**
 * Layout configuration for head-detail layout
 */
export interface HeadDetailConfig {
  titleField: string;
  subLineFields: string[];
  tailFields: string[];
}

/**
 * Layout configuration for two-column layout
 */
export interface TwoColumnConfig {
  headTitleField: string;
  headSubLineFields: string[];
  column1Fields: string[];
  column2Fields: string[];
}

/**
 * Inline edit context for reference/user fields
 */
export interface InlineEditContext {
  workspaceUsers?: WorkspaceUser[];
  /** Function to create fetchRecords for a specific field */
  getFetchRecords?: (
    fieldName: string,
  ) => ((query: string, page: number) => Promise<{ records: AsyncRecordSelectRecord[]; hasMore: boolean }>) | undefined;
  /** Function to get initial records for a specific field */
  getInitialRecords?: (fieldName: string) => AsyncRecordSelectRecord[] | undefined;
}

/**
 * Props for HeadDetailLayout component
 */
export interface HeadDetailLayoutProps {
  record: TableRecord;
  table: Table;
  config: HeadDetailConfig;
  referenceRecords?: Record<string, TableRecord[]>;
  userRecords?: Record<string, WorkspaceUser>;
  onFieldChange?: (fieldName: string, value: unknown) => Promise<void>;
  readOnly?: boolean;
  className?: string;
  /** Context for inline editing reference/user fields */
  inlineEditContext?: InlineEditContext;
}

/**
 * Props for TwoColumnDetailLayout component
 */
export interface TwoColumnDetailLayoutProps {
  record: TableRecord;
  table: Table;
  config: TwoColumnConfig;
  referenceRecords?: Record<string, TableRecord[]>;
  userRecords?: Record<string, WorkspaceUser>;
  onFieldChange?: (fieldName: string, value: unknown) => Promise<void>;
  readOnly?: boolean;
  className?: string;
  /** Context for inline editing reference/user fields */
  inlineEditContext?: InlineEditContext;
}
