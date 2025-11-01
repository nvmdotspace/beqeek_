/**
 * Gantt Chart Component Props
 *
 * Type definitions for Gantt chart components
 */

import type { Table } from '../../types/common.js';
import type { TableRecord } from '../../types/record.js';
import type { GanttConfig, FieldConfig } from '../../types/index.js';
import type { PartialMessages } from '../../types/messages.js';

// ============================================
// Base Props
// ============================================

/**
 * Base props shared by all Gantt components
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
// Zoom Levels
// ============================================

/**
 * Gantt chart zoom level
 */
export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Time unit for rendering
 */
export interface TimeUnit {
  /** Start date of this unit */
  start: Date;

  /** End date of this unit */
  end: Date;

  /** Display label */
  label: string;

  /** Is this unit a weekend? */
  isWeekend?: boolean;

  /** Is this unit today? */
  isToday?: boolean;
}

// ============================================
// Task Data
// ============================================

/**
 * Processed task data for rendering
 */
export interface GanttTask {
  /** Record ID */
  id: string;

  /** Original record */
  record: TableRecord;

  /** Task name */
  name: string;

  /** Start date */
  startDate: Date;

  /** End date */
  endDate: Date;

  /** Progress (0-100) */
  progress?: number;

  /** Dependency task IDs */
  dependencies?: string[];

  /** Task color (optional) */
  color?: string;

  /** Group/category (optional) */
  group?: string;
}

// ============================================
// Gantt Chart Props
// ============================================

/**
 * Props for GanttChart component
 */
export interface GanttChartProps extends BaseGanttProps {
  /** All records to display */
  records: TableRecord[];

  /** Gantt configuration */
  config: GanttConfig;

  /** Current zoom level */
  zoomLevel?: ZoomLevel;

  /** Callback when zoom level changes */
  onZoomChange?: (zoom: ZoomLevel) => void;

  /** Callback when task dates change (drag) */
  onTaskDateChange?: (recordId: string, startDate: Date, endDate: Date) => void;

  /** Callback when task is clicked */
  onTaskClick?: (record: TableRecord) => void;

  /** Loading state */
  loading?: boolean;

  /** Disable interactions */
  readOnly?: boolean;

  /** Show dependencies */
  showDependencies?: boolean;

  /** Show progress bars */
  showProgress?: boolean;

  /** Show today indicator */
  showToday?: boolean;

  /** Group tasks by field */
  groupBy?: string;
}

// ============================================
// Timeline Props
// ============================================

/**
 * Props for GanttTimeline component
 */
export interface GanttTimelineProps extends BaseGanttProps {
  /** Start date of visible range */
  startDate: Date;

  /** End date of visible range */
  endDate: Date;

  /** Current zoom level */
  zoomLevel: ZoomLevel;

  /** Callback when zoom changes */
  onZoomChange?: (zoom: ZoomLevel) => void;

  /** Show today indicator */
  showToday?: boolean;

  /** Width of timeline in pixels */
  width: number;
}

// ============================================
// Task Bar Props
// ============================================

/**
 * Props for GanttTask component
 */
export interface GanttTaskProps extends BaseGanttProps {
  /** Task data */
  task: GanttTask;

  /** Start date of visible range */
  rangeStart: Date;

  /** End date of visible range */
  rangeEnd: Date;

  /** Current zoom level */
  zoomLevel: ZoomLevel;

  /** Callback when task is clicked */
  onClick?: (record: TableRecord) => void;

  /** Callback when task dates change */
  onDateChange?: (recordId: string, startDate: Date, endDate: Date) => void;

  /** Show progress bar */
  showProgress?: boolean;

  /** Disable drag */
  readOnly?: boolean;

  /** Row height in pixels */
  rowHeight?: number;

  /** Total width of timeline */
  timelineWidth: number;
}

// ============================================
// Grid Props
// ============================================

/**
 * Props for GanttGrid component
 */
export interface GanttGridProps extends BaseGanttProps {
  /** Start date of visible range */
  startDate: Date;

  /** End date of visible range */
  endDate: Date;

  /** Current zoom level */
  zoomLevel: ZoomLevel;

  /** Number of rows (tasks) */
  rowCount: number;

  /** Row height in pixels */
  rowHeight?: number;

  /** Width of grid */
  width: number;

  /** Highlight weekends */
  highlightWeekends?: boolean;

  /** Show today indicator */
  showToday?: boolean;
}

// ============================================
// Dependency Props
// ============================================

/**
 * Props for dependency lines
 */
export interface DependencyLineProps {
  /** Source task */
  sourceTask: GanttTask;

  /** Target task */
  targetTask: GanttTask;

  /** Source task Y position */
  sourceY: number;

  /** Target task Y position */
  targetY: number;

  /** Timeline start date */
  rangeStart: Date;

  /** Timeline end date */
  rangeEnd: Date;

  /** Timeline width */
  timelineWidth: number;

  /** Row height */
  rowHeight?: number;
}

// ============================================
// Utility Types
// ============================================

/**
 * Position info for a task bar
 */
export interface TaskPosition {
  /** Left offset (pixels) */
  left: number;

  /** Width (pixels) */
  width: number;

  /** Is partially visible */
  isPartiallyVisible: boolean;

  /** Is fully visible */
  isFullyVisible: boolean;
}

/**
 * Date range
 */
export interface DateRange {
  start: Date;
  end: Date;
}
