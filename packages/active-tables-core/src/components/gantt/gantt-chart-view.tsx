/**
 * GanttChartView Component
 *
 * Active Tables wrapper for shadcn/ui Gantt Chart
 * Implements business logic from gantt-business-analysis.md
 */

import { useMemo, useCallback } from 'react';
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureRow,
  GanttToday,
} from '@workspace/ui/components/ui/shadcn-io/gantt';
import type { GanttChartViewProps, ConvertedGanttFeature } from './types.js';
import { convertRecordsToFeatures, validateGanttConfig, groupFeaturesByLane } from './utils.js';

/**
 * GanttChartView - Main Gantt component for Active Tables
 *
 * Features:
 * - Converts Active Tables records to Gantt features
 * - Supports drag & drop for date changes
 * - Groups by lane if configured
 * - Shows progress if configured
 * - Displays dependencies if configured
 */
export function GanttChartView({
  records,
  config,
  initialRange = 'monthly',
  initialZoom = 100,
  onTaskDateChange,
  onTaskClick,
  onCreateTask,
  loading = false,
  readOnly = false,
  showProgress = true,
  showToday = true,
  table: _table,
  messages,
  className = '',
}: GanttChartViewProps) {
  // Validate configuration
  const validation = useMemo(() => validateGanttConfig(config), [config]);

  // Convert records to Gantt features
  const features = useMemo(() => {
    if (!validation.valid) return [];
    return convertRecordsToFeatures(records, config);
  }, [records, config, validation.valid]);

  // Group features by lane if groupField is configured
  const featureGroups = useMemo(() => {
    const configAny = config as unknown as Record<string, unknown>;
    if (!configAny.groupField) {
      return new Map([['default', features]]);
    }
    return groupFeaturesByLane(features);
  }, [features, config]);

  // Handle task movement (drag & drop)
  const handleTaskMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (readOnly || !onTaskDateChange) return;

      // Find the feature's original record
      const feature = features.find((f) => f.id === id);
      if (!feature || !endAt) return;

      // Call the callback with the record ID
      onTaskDateChange(id, startAt, endAt);
    },
    [features, onTaskDateChange, readOnly],
  );

  // Handle task selection
  const handleTaskSelect = useCallback(
    (id: string) => {
      const feature = features.find((f) => f.id === id);
      if (feature && onTaskClick) {
        onTaskClick(feature.record);
      }
    },
    [features, onTaskClick],
  );

  // Handle adding new item by clicking timeline
  const handleAddItem = useCallback(
    (date: Date) => {
      if (readOnly || !onCreateTask) return;
      onCreateTask(date);
    },
    [onCreateTask, readOnly],
  );

  // Validation errors
  if (!validation.valid) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 dark:text-red-400 font-medium mb-2">
          {messages?.error || 'Configuration Error'}
        </div>
        <ul className="text-sm text-red-500 dark:text-red-300">
          {validation.errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500 dark:text-gray-400">{messages?.loading || 'Loading...'}</div>
      </div>
    );
  }

  // Empty state - BR-GN-016
  if (features.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">
          {messages?.noRecordsFound || 'No tasks found'}
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-500">
          {messages?.noRecordsDescription ||
            'Add records with valid start and end dates to see them on the Gantt chart'}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full ${className}`}>
      <GanttProvider range={initialRange} zoom={initialZoom} onAddItem={handleAddItem}>
        <GanttSidebar>
          {Array.from(featureGroups.entries()).map(([groupName, groupFeatures]) => (
            <GanttSidebarGroup
              key={groupName}
              name={groupName === 'default' ? messages?.records || 'Tasks' : groupName}
            >
              {groupFeatures.map((feature) => (
                <GanttSidebarItem key={feature.id} feature={feature} onSelectItem={handleTaskSelect} />
              ))}
            </GanttSidebarGroup>
          ))}
        </GanttSidebar>

        <GanttTimeline>
          <GanttHeader />
          <GanttFeatureList>
            {Array.from(featureGroups.entries()).map(([groupName, groupFeatures]) => (
              <GanttFeatureRow key={groupName} features={groupFeatures} onMove={readOnly ? undefined : handleTaskMove}>
                {(feature) => {
                  const converted = feature as ConvertedGanttFeature;
                  const progressField = config.progressField;
                  const progressValue = progressField ? (converted.record.record[progressField] as number) || 0 : 0;
                  return (
                    <>
                      <span className="text-xs font-medium truncate flex-1">{converted.name}</span>
                      {showProgress && progressField && (
                        <span className="text-xs text-muted-foreground">{progressValue}%</span>
                      )}
                    </>
                  );
                }}
              </GanttFeatureRow>
            ))}
          </GanttFeatureList>
          {showToday && <GanttToday />}
        </GanttTimeline>
      </GanttProvider>
    </div>
  );
}
