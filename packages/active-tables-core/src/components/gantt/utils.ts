/**
 * Gantt Chart Utilities
 *
 * Helper functions for converting Active Tables records to Gantt features
 */

import type { TableRecord } from '../../types/record.js';
import type { GanttConfig } from '../../types/index.js';
import type { GanttStatus } from '@workspace/ui/components/ui/shadcn-io/gantt';
import type { ConvertedGanttFeature, FieldMapping, StatusMapping } from './types.js';

/**
 * Default status colors based on progress
 */
const DEFAULT_STATUS_COLORS: Record<string, string> = {
  notStarted: '#6c757d', // Gray
  inProgress: '#007bff', // Blue
  completed: '#28a745', // Green
  overdue: '#dc3545', // Red
};

/**
 * Extract field value from record
 */
function getFieldValue(record: TableRecord, fieldName: string): unknown {
  return record.record[fieldName];
}

/**
 * Convert record to field mapping
 */
function mapRecordFields(record: TableRecord, config: GanttConfig): FieldMapping {
  const taskName = getFieldValue(record, config.taskNameField) as string | null;
  const startDateValue = getFieldValue(record, config.startDateField);
  const endDateValue = getFieldValue(record, config.endDateField);

  // Parse dates
  const startDate = startDateValue ? new Date(startDateValue as string | number | Date) : null;
  const endDate = endDateValue ? new Date(endDateValue as string | number | Date) : null;

  // Get progress if configured
  const progress = config.progressField ? (getFieldValue(record, config.progressField) as number | null) : null;

  // Get dependencies if configured
  const dependencies = config.dependencyField
    ? (getFieldValue(record, config.dependencyField) as string[] | null)
    : null;

  // Get status if available (optional field not in base GanttConfig)
  const configAny = config as unknown as Record<string, unknown>;
  const status = configAny.statusField
    ? (getFieldValue(record, configAny.statusField as string) as string | null)
    : null;

  // Get group if available (optional field not in base GanttConfig)
  const group = configAny.groupField ? (getFieldValue(record, configAny.groupField as string) as string | null) : null;

  return {
    taskName,
    startDate,
    endDate,
    progress,
    dependencies,
    status,
    group,
  };
}

/**
 * Determine status based on progress and dates
 */
function determineStatus(progress: number | null, endDate: Date | null, statusValue?: string | null): GanttStatus {
  const now = new Date();

  // If custom status provided, use it
  if (statusValue) {
    return {
      id: statusValue,
      name: statusValue,
      color: DEFAULT_STATUS_COLORS.inProgress as string,
    };
  }

  // Determine status from progress and dates
  if (progress === 100) {
    return {
      id: 'completed',
      name: 'Completed',
      color: DEFAULT_STATUS_COLORS.completed as string,
    };
  }

  if (endDate && endDate < now) {
    return {
      id: 'overdue',
      name: 'Overdue',
      color: DEFAULT_STATUS_COLORS.overdue as string,
    };
  }

  if (progress && progress > 0) {
    return {
      id: 'inProgress',
      name: 'In Progress',
      color: DEFAULT_STATUS_COLORS.inProgress as string,
    };
  }

  return {
    id: 'notStarted',
    name: 'Not Started',
    color: DEFAULT_STATUS_COLORS.notStarted as string,
  };
}

/**
 * Convert Active Tables records to Gantt features
 *
 * Business Rules:
 * - BR-GN-004: Tasks without startDate are not displayed
 * - BR-GN-005: Tasks without endDate use startDate + 1 day
 * - BR-GN-001: Empty task names show "(Untitled)"
 */
export function convertRecordsToFeatures(records: TableRecord[], config: GanttConfig): ConvertedGanttFeature[] {
  const features: ConvertedGanttFeature[] = [];

  for (const record of records) {
    const mapping = mapRecordFields(record, config);

    // BR-GN-004: Skip tasks without start date
    if (!mapping.startDate) {
      continue;
    }

    // BR-GN-005: Use startDate + 1 day if no end date
    const endDate = mapping.endDate || new Date(mapping.startDate.getTime() + 24 * 60 * 60 * 1000);

    // BR-GN-001: Default name for empty task names
    const taskName = mapping.taskName?.trim() || '(Untitled)';

    // Determine status
    const status = determineStatus(mapping.progress || 0, endDate, mapping.status);

    features.push({
      id: record.id,
      name: taskName,
      startAt: mapping.startDate,
      endAt: endDate,
      status,
      record,
      lane: mapping.group || undefined,
    });
  }

  return features;
}

/**
 * Validate Gantt configuration
 */
export function validateGanttConfig(config: GanttConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.taskNameField) {
    errors.push('Missing taskNameField in Gantt configuration');
  }

  if (!config.startDateField) {
    errors.push('Missing startDateField in Gantt configuration');
  }

  if (!config.endDateField) {
    errors.push('Missing endDateField in Gantt configuration');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate date range from features with buffer
 *
 * Business Rules:
 * - BR-GN-019: Default timeline range with 2 weeks buffer
 * - BR-GN-021: 1 week before first task, 2 weeks after last task
 */
export function calculateDateRange(features: ConvertedGanttFeature[]): { start: Date; end: Date } {
  if (features.length === 0) {
    // Default range: today - 1 month to today + 2 months
    const today = new Date();
    return {
      start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
    };
  }

  const dates = features.flatMap((f) => [f.startAt, f.endAt]);
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  // Add buffer: 1 week before, 2 weeks after
  const rangeStart = new Date(minDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const rangeEnd = new Date(maxDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  return { start: rangeStart, end: rangeEnd };
}

/**
 * Group features by lane
 */
export function groupFeaturesByLane(features: ConvertedGanttFeature[]): Map<string, ConvertedGanttFeature[]> {
  const groups = new Map<string, ConvertedGanttFeature[]>();

  for (const feature of features) {
    const lane = feature.lane || 'default';
    const existing = groups.get(lane) || [];
    existing.push(feature);
    groups.set(lane, existing);
  }

  return groups;
}

/**
 * Build status mapping from features
 */
export function buildStatusMapping(features: ConvertedGanttFeature[]): StatusMapping {
  const mapping: StatusMapping = {};

  for (const feature of features) {
    if (!mapping[feature.status.id]) {
      mapping[feature.status.id] = feature.status;
    }
  }

  return mapping;
}
