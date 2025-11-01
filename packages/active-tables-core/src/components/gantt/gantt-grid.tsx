/**
 * GanttGrid Component
 *
 * Renders the background grid lines for the Gantt chart timeline
 */

import React, { useMemo } from 'react';
import { isToday } from 'date-fns';
import type { GanttGridProps } from './gantt-props.js';
import { generateTimeUnits } from './gantt-utils.js';

/**
 * GanttGrid component
 *
 * Displays vertical grid lines, weekend highlighting, and today indicator
 */
export function GanttGrid({
  startDate,
  endDate,
  zoomLevel,
  rowCount,
  rowHeight = 44,
  width,
  highlightWeekends = true,
  showToday = true,
  className = '',
}: GanttGridProps) {
  // Generate time units for grid columns
  const timeUnits = useMemo(() => {
    return generateTimeUnits(startDate, endDate, zoomLevel);
  }, [startDate, endDate, zoomLevel]);

  const totalHeight = rowCount * rowHeight;
  const columnWidth = width / timeUnits.length;

  return (
    <svg
      className={`absolute top-0 left-0 pointer-events-none ${className}`}
      width={width}
      height={totalHeight}
      style={{ zIndex: 0 }}
    >
      {/* Grid columns */}
      {timeUnits.map((unit, index) => {
        const x = index * columnWidth;
        const isWeekendColumn = highlightWeekends && unit.isWeekend;
        const isTodayColumn = showToday && unit.isToday;

        return (
          <g key={index}>
            {/* Weekend highlighting */}
            {isWeekendColumn && (
              <rect
                x={x}
                y={0}
                width={columnWidth}
                height={totalHeight}
                fill="currentColor"
                className="text-gray-100 dark:text-gray-800"
                opacity={0.5}
              />
            )}

            {/* Today highlighting */}
            {isTodayColumn && (
              <rect
                x={x}
                y={0}
                width={columnWidth}
                height={totalHeight}
                fill="currentColor"
                className="text-blue-50 dark:text-blue-900"
                opacity={0.3}
              />
            )}

            {/* Vertical grid line */}
            <line
              x1={x}
              y1={0}
              x2={x}
              y2={totalHeight}
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth={1}
            />
          </g>
        );
      })}

      {/* Horizontal grid lines (row separators) */}
      {Array.from({ length: rowCount + 1 }).map((_, index) => {
        const y = index * rowHeight;
        return (
          <line
            key={`row-${index}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeWidth={1}
          />
        );
      })}

      {/* Today indicator line */}
      {showToday && timeUnits.some((unit) => isToday(unit.start)) && (
        <line
          x1={timeUnits.findIndex((unit) => isToday(unit.start)) * columnWidth}
          y1={0}
          x2={timeUnits.findIndex((unit) => isToday(unit.start)) * columnWidth}
          y2={totalHeight}
          stroke="currentColor"
          className="text-red-500"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      )}
    </svg>
  );
}
