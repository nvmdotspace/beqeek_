/**
 * Gantt Chart Components
 *
 * Export all Gantt-related components, hooks, and types
 */

// Main component
export { GanttChartView } from './gantt-chart.js';
// Alias for convenience
export { GanttChartView as GanttBoard } from './gantt-chart.js';

// Sub-components
export { GanttTimeline } from './gantt-timeline.js';
export { GanttGrid } from './gantt-grid.js';
export { GanttTask } from './gantt-task.js';

// Hooks
export { useGanttZoom } from './use-gantt-zoom.js';

// Utilities
export * from './gantt-utils.js';

// Types
export type {
  GanttChartProps,
  GanttTimelineProps,
  GanttGridProps,
  GanttTaskProps,
  BaseGanttProps,
  ZoomLevel,
  TimeUnit,
  GanttTask as GanttTaskData,
  TaskPosition,
  DateRange,
  DependencyLineProps,
} from './gantt-props.js';
