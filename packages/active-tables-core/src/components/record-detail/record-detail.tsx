/**
 * RecordDetail - Main record detail view component
 * @module active-tables-core/components/record-detail
 */

import React from 'react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Grid, GridItem } from '@workspace/ui/components/primitives/grid';
import { cn } from '@workspace/ui/lib/utils';
import type { RecordDetailProps } from '../../types/record-detail.js';
import { HeadDetailLayout } from './layouts/head-detail-layout.js';
import { TwoColumnDetailLayout } from './layouts/two-column-layout.js';
import { ActivityTimeline } from './activity-timeline.js';
import { RelatedRecords } from './related-records.js';
import {
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  RECORD_DETAIL_LAYOUT_TWO_COLUMN,
  COMMENTS_POSITION_RIGHT_PANEL,
  COMMENTS_POSITION_HIDDEN,
} from '@workspace/beqeek-shared/constants';

/**
 * Main record detail component
 * Orchestrates layout rendering, field display, inline editing, and side panels
 */
export function RecordDetail({
  record,
  table,
  layout,
  commentsPosition,
  onFieldChange,
  onDelete,
  onRecordClick,
  readOnly = false,
  showComments = true,
  showTimeline = true,
  showRelatedRecords = true,
  referenceRecords = {},
  userRecords = {},
  className,
}: RecordDetailProps) {
  // Determine layout from config if not provided
  const effectiveLayout = layout || table.config.recordDetailConfig?.layout || RECORD_DETAIL_LAYOUT_HEAD_DETAIL;

  // Determine comments position from config if not provided
  const effectiveCommentsPosition =
    commentsPosition || table.config.recordDetailConfig?.commentsPosition || COMMENTS_POSITION_RIGHT_PANEL;

  // Get layout configuration
  const layoutConfig = table.config.recordDetailConfig;

  if (!layoutConfig) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        Record detail layout configuration is missing
      </div>
    );
  }

  // Build head-detail config
  // Note: API may return headTitleField instead of titleField for head-detail layout
  const headDetailConfig = {
    titleField: layoutConfig.headTitleField || layoutConfig.titleField || table.config.fields[0]?.name || '',
    subLineFields: layoutConfig.headSubLineFields || layoutConfig.subLineFields || [],
    tailFields: layoutConfig.tailFields || table.config.fields.map((f) => f.name),
  };

  // Build two-column config
  const twoColumnConfig = {
    headTitleField: layoutConfig.headTitleField || table.config.fields[0]?.name || '',
    headSubLineFields: layoutConfig.headSubLineFields || [],
    column1Fields: layoutConfig.column1Fields || [],
    column2Fields: layoutConfig.column2Fields || [],
  };

  // Prepare common layout props
  const layoutProps = {
    record,
    table,
    referenceRecords,
    userRecords,
    onFieldChange,
    readOnly,
  };

  // Render layout based on type
  const renderLayout = () => {
    if (effectiveLayout === RECORD_DETAIL_LAYOUT_TWO_COLUMN) {
      return <TwoColumnDetailLayout {...layoutProps} config={twoColumnConfig} />;
    }

    return <HeadDetailLayout {...layoutProps} config={headDetailConfig} />;
  };

  // Comments panel should go here when integrated with web app
  // For now, it's a placeholder that web app will provide
  const commentsPanel = null; // Will be passed from web app

  // Render with or without comments sidebar
  if (effectiveCommentsPosition === COMMENTS_POSITION_RIGHT_PANEL && showComments) {
    return (
      <Grid columns={12} gap="space-400" className={cn('w-full', className)}>
        {/* Main content */}
        <GridItem span={12} spanLg={8}>
          <Stack space="space-500">
            {/* Layout */}
            {renderLayout()}

            {/* Activity Timeline */}
            {showTimeline && (
              <ActivityTimeline
                recordId={record.id}
                events={[]} // Will be provided by web app hook
                loading={false}
              />
            )}

            {/* Related Records */}
            {showRelatedRecords && (
              <RelatedRecords
                record={record}
                table={table}
                referenceRecords={referenceRecords}
                onRecordClick={onRecordClick}
              />
            )}
          </Stack>
        </GridItem>

        {/* Comments sidebar */}
        <GridItem span={12} spanLg={4}>
          {commentsPanel || (
            <div className="text-sm text-muted-foreground">Comments panel will be provided by web app</div>
          )}
        </GridItem>
      </Grid>
    );
  }

  // No comments sidebar - full width layout
  return (
    <Stack space="space-500" className={cn('w-full', className)}>
      {/* Layout */}
      {renderLayout()}

      {/* Activity Timeline */}
      {showTimeline && (
        <ActivityTimeline
          recordId={record.id}
          events={[]} // Will be provided by web app hook
          loading={false}
        />
      )}

      {/* Related Records */}
      {showRelatedRecords && (
        <RelatedRecords
          record={record}
          table={table}
          referenceRecords={referenceRecords}
          onRecordClick={onRecordClick}
        />
      )}
    </Stack>
  );
}
