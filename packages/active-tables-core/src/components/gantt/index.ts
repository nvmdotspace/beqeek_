/**
 * Gantt Chart Components
 *
 * Export all Gantt-related components using shadcn/ui Gantt
 */

// Main component
export { GanttChartView } from './gantt-chart-view.js';
// Alias for backward compatibility
export { GanttChartView as GanttBoard } from './gantt-chart-view.js';

// Utilities
export * from './utils.js';

// Types
export type {
  GanttChartViewProps,
  BaseGanttProps,
  ConvertedGanttFeature,
  StatusMapping,
  DateRange,
  FieldMapping,
} from './types.js';
