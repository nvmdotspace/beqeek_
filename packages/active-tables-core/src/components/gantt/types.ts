/**
 * Gantt Chart Types
 *
 * Type definitions for Active Tables Gantt Chart wrapper using shadcn/ui Gantt
 */

import type { Table } from '../../types/common.js';
import type { TableRecord } from '../../types/record.js';
import type { GanttConfig } from '../../types/index.js';
import type { PartialMessages } from '../../types/messages.js';
import type { GanttFeature, GanttStatus, Range } from '@workspace/ui/components/ui/shadcn-io/gantt';

// ============================================
// Base Props
// ============================================

/**
 * Base props for Gantt components
 */
export interface BaseGanttProps {
  /** Active table metadata and configuration */
  table: Table;

  /** Optional localized messages */
  messages?: PartialMessages;

  /** Optional CSS class name */
  className?: string;
}

// ============================================
// Main Component Props
// ============================================

/**
 * Props for GanttChartView component
 */
export interface GanttChartViewProps extends BaseGanttProps {
  /** All records to display */
  records: TableRecord[];

  /** Gantt configuration from table metadata */
  config: GanttConfig;

  /** Initial range view */
  initialRange?: Range;

  /** Initial zoom level (50-200) */
  initialZoom?: number;

  /** Callback when task dates change (drag & drop) */
  onTaskDateChange?: (recordId: string, startDate: Date, endDate: Date) => void;

  /** Callback when task is clicked/selected */
  onTaskClick?: (record: TableRecord) => void;

  /** Callback when progress is updated */
  onProgressUpdate?: (recordId: string, progress: number) => void;

  /** Callback when creating new task by clicking timeline */
  onCreateTask?: (date: Date) => void;

  /** Loading state */
  loading?: boolean;

  /** Disable all interactions */
  readOnly?: boolean;

  /** Show progress bars if config has progressField */
  showProgress?: boolean;

  /** Show today indicator */
  showToday?: boolean;

  /** Show dependency arrows if config has dependencyField */
  showDependencies?: boolean;
}

// ============================================
// Converted Types
// ============================================

/**
 * Converted record for Gantt feature
 * Extends GanttFeature with Active Tables specific data
 */
export interface ConvertedGanttFeature extends GanttFeature {
  /** Original record */
  record: TableRecord;
}

/**
 * Status mapping from table records
 */
export interface StatusMapping {
  [key: string]: GanttStatus;
}

// ============================================
// Utility Types
// ============================================

/**
 * Date range for filtering
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Field mapping result
 */
export interface FieldMapping {
  taskName: string | null;
  startDate: Date | null;
  endDate: Date | null;
  progress?: number | null;
  dependencies?: string[] | null;
  status?: string | null;
  group?: string | null;
}
