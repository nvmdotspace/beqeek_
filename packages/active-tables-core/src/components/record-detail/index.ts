/**
 * Record Detail Components
 * @module active-tables-core/components/record-detail
 */

// Main component
export { RecordDetail } from './record-detail.js';

// Layout components
export { HeadDetailLayout } from './layouts/head-detail-layout.js';
export { TwoColumnDetailLayout } from './layouts/two-column-layout.js';

// Field components
export { FieldDisplay } from './fields/field-display.js';
export { InlineEditField } from './fields/inline-edit-field.js';

// Supporting components
export { ActivityTimeline } from './activity-timeline.js';
export { RelatedRecords } from './related-records.js';

// Re-export types
export type {
  RecordDetailProps,
  FieldDisplayProps,
  InlineEditFieldProps,
  ActivityTimelineProps,
  RelatedRecordsProps,
  HeadDetailLayoutProps,
  TwoColumnDetailLayoutProps,
  HeadDetailConfig,
  TwoColumnConfig,
  TimelineEvent,
  TimelineEventType,
  FieldChange,
} from '../../types/record-detail.js';

// Note: WorkspaceUser is already exported from types/responses.js via the main types/index.ts
