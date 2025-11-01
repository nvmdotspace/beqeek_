/**
 * Gantt Chart Utility Functions
 *
 * Date calculations and positioning helpers
 */

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  differenceInDays,
  differenceInCalendarDays,
  isWeekend,
  isToday,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
import type { ZoomLevel, TimeUnit, TaskPosition, DateRange, GanttTask } from './gantt-props.js';
import type { TableRecord } from '../../types/record.js';
import type { GanttConfig } from '../../types/config.js';

// ============================================
// Date Range Utilities
// ============================================

/**
 * Get appropriate date range based on tasks and zoom level
 */
export function calculateDateRange(tasks: GanttTask[], zoomLevel: ZoomLevel, padding = 7): DateRange {
  if (tasks.length === 0) {
    const today = new Date();
    return {
      start: addDays(today, -padding),
      end: addDays(today, padding * 2),
    };
  }

  // Find min and max dates from tasks
  const firstTask = tasks[0];
  if (!firstTask) {
    const today = new Date();
    return {
      start: addDays(today, -padding),
      end: addDays(today, padding * 2),
    };
  }

  let minDate = new Date(firstTask.startDate);
  let maxDate = new Date(firstTask.endDate);

  tasks.forEach((task) => {
    if (task.startDate < minDate) minDate = new Date(task.startDate);
    if (task.endDate > maxDate) maxDate = new Date(task.endDate);
  });

  // Add padding based on zoom level
  switch (zoomLevel) {
    case 'day':
      return {
        start: addDays(minDate, -padding),
        end: addDays(maxDate, padding),
      };
    case 'week':
      return {
        start: startOfWeek(addWeeks(minDate, -1)),
        end: endOfWeek(addWeeks(maxDate, 1)),
      };
    case 'month':
      return {
        start: startOfMonth(addMonths(minDate, -1)),
        end: endOfMonth(addMonths(maxDate, 1)),
      };
    case 'quarter':
      return {
        start: startOfQuarter(addQuarters(minDate, -1)),
        end: endOfQuarter(addQuarters(maxDate, 1)),
      };
    case 'year':
      return {
        start: startOfYear(addYears(minDate, -1)),
        end: endOfYear(addYears(maxDate, 1)),
      };
    default:
      return { start: minDate, end: maxDate };
  }
}

/**
 * Generate time units for timeline based on zoom level
 */
export function generateTimeUnits(startDate: Date, endDate: Date, zoomLevel: ZoomLevel): TimeUnit[] {
  const units: TimeUnit[] = [];

  switch (zoomLevel) {
    case 'day': {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.map((day) => ({
        start: startOfDay(day),
        end: endOfDay(day),
        label: format(day, 'd'),
        isWeekend: isWeekend(day),
        isToday: isToday(day),
      }));
    }

    case 'week': {
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate });
      return weeks.map((week) => ({
        start: startOfWeek(week),
        end: endOfWeek(week),
        label: format(week, 'MMM d'),
        isWeekend: false,
        isToday: false,
      }));
    }

    case 'month': {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      return months.map((month) => ({
        start: startOfMonth(month),
        end: endOfMonth(month),
        label: format(month, 'MMM yyyy'),
        isWeekend: false,
        isToday: false,
      }));
    }

    case 'quarter': {
      let current = startOfQuarter(startDate);
      const end = endOfQuarter(endDate);

      while (current <= end) {
        units.push({
          start: startOfQuarter(current),
          end: endOfQuarter(current),
          label: `Q${Math.floor(current.getMonth() / 3) + 1} ${format(current, 'yyyy')}`,
          isWeekend: false,
          isToday: false,
        });
        current = addQuarters(current, 1);
      }
      return units;
    }

    case 'year': {
      let current = startOfYear(startDate);
      const end = endOfYear(endDate);

      while (current <= end) {
        units.push({
          start: startOfYear(current),
          end: endOfYear(current),
          label: format(current, 'yyyy'),
          isWeekend: false,
          isToday: false,
        });
        current = addYears(current, 1);
      }
      return units;
    }

    default:
      return units;
  }
}

// ============================================
// Position Calculations
// ============================================

/**
 * Calculate task bar position and width
 */
export function calculateTaskPosition(
  taskStart: Date,
  taskEnd: Date,
  rangeStart: Date,
  rangeEnd: Date,
  timelineWidth: number,
): TaskPosition {
  const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) || 1;
  const pixelsPerDay = timelineWidth / totalDays;

  // Calculate left offset
  const daysFromStart = differenceInCalendarDays(taskStart, rangeStart);
  const left = Math.max(0, daysFromStart * pixelsPerDay);

  // Calculate width
  const taskDuration = differenceInCalendarDays(taskEnd, taskStart) || 1;
  const width = taskDuration * pixelsPerDay;

  // Visibility checks
  const taskStartInRange = taskStart >= rangeStart && taskStart <= rangeEnd;
  const taskEndInRange = taskEnd >= rangeStart && taskEnd <= rangeEnd;
  const taskSpansRange = taskStart < rangeStart && taskEnd > rangeEnd;

  const isFullyVisible = taskStartInRange && taskEndInRange;
  const isPartiallyVisible = taskStartInRange || taskEndInRange || taskSpansRange;

  return {
    left,
    width: Math.max(width, 10), // Minimum width of 10px
    isFullyVisible,
    isPartiallyVisible,
  };
}

/**
 * Calculate X position for a specific date
 */
export function dateToPosition(date: Date, rangeStart: Date, rangeEnd: Date, timelineWidth: number): number {
  const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) || 1;
  const pixelsPerDay = timelineWidth / totalDays;
  const daysFromStart = differenceInCalendarDays(date, rangeStart);
  return daysFromStart * pixelsPerDay;
}

/**
 * Calculate date from X position
 */
export function positionToDate(x: number, rangeStart: Date, rangeEnd: Date, timelineWidth: number): Date {
  const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) || 1;
  const pixelsPerDay = timelineWidth / totalDays;
  const daysFromStart = Math.round(x / pixelsPerDay);
  return addDays(rangeStart, daysFromStart);
}

// ============================================
// Task Data Processing
// ============================================

/**
 * Parse date value from record field
 */
export function parseDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

/**
 * Parse progress value (0-100)
 */
export function parseProgress(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;

  const num = Number(value);
  if (isNaN(num)) return undefined;

  return Math.max(0, Math.min(100, num));
}

/**
 * Convert records to Gantt tasks
 */
export function recordsToTasks(records: TableRecord[], config: GanttConfig): GanttTask[] {
  const tasks: GanttTask[] = [];

  records.forEach((record) => {
    const data = record.record || record.data || {};

    // Get task name
    const name = String(data[config.taskNameField] || '(Untitled)');

    // Get dates
    const startDate = parseDate(data[config.startDateField]);
    const endDate = parseDate(data[config.endDateField]);

    if (!startDate || !endDate) {
      // Skip tasks without valid dates
      return;
    }

    // Get optional fields
    const progress = config.progressField ? parseProgress(data[config.progressField]) : undefined;

    const dependencies = config.dependencyField ? parseDependencies(data[config.dependencyField]) : undefined;

    tasks.push({
      id: record.id,
      record,
      name,
      startDate,
      endDate,
      progress,
      dependencies,
    });
  });

  return tasks;
}

/**
 * Parse dependency field value (array of record IDs)
 */
function parseDependencies(value: unknown): string[] | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return undefined;
}

// ============================================
// Zoom Level Utilities
// ============================================

/**
 * Get pixel width for a single time unit
 */
export function getUnitWidth(zoomLevel: ZoomLevel): number {
  switch (zoomLevel) {
    case 'day':
      return 40;
    case 'week':
      return 100;
    case 'month':
      return 120;
    case 'quarter':
      return 150;
    case 'year':
      return 200;
    default:
      return 100;
  }
}

/**
 * Get next zoom level
 */
export function getNextZoomLevel(current: ZoomLevel): ZoomLevel {
  const levels: ZoomLevel[] = ['day', 'week', 'month', 'quarter', 'year'];
  const currentIndex = levels.indexOf(current);
  const nextLevel = levels[Math.min(currentIndex + 1, levels.length - 1)];
  return nextLevel || current;
}

/**
 * Get previous zoom level
 */
export function getPreviousZoomLevel(current: ZoomLevel): ZoomLevel {
  const levels: ZoomLevel[] = ['day', 'week', 'month', 'quarter', 'year'];
  const currentIndex = levels.indexOf(current);
  const prevLevel = levels[Math.max(currentIndex - 1, 0)];
  return prevLevel || current;
}
