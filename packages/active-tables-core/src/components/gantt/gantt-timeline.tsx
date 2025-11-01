/**
 * GanttTimeline Component
 *
 * Renders the timeline header with date labels and zoom controls
 */

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import type { GanttTimelineProps } from './gantt-props.js';
import { generateTimeUnits, getNextZoomLevel, getPreviousZoomLevel } from './gantt-utils.js';

/**
 * GanttTimeline component
 *
 * Displays date headers and zoom controls
 */
export function GanttTimeline({
  startDate,
  endDate,
  zoomLevel,
  onZoomChange,
  showToday = true,
  width,
  messages,
  className = '',
}: GanttTimelineProps) {
  // Generate time units for headers
  const timeUnits = useMemo(() => {
    return generateTimeUnits(startDate, endDate, zoomLevel);
  }, [startDate, endDate, zoomLevel]);

  const columnWidth = width / timeUnits.length;

  // Zoom controls
  const canZoomIn = zoomLevel !== 'day';
  const canZoomOut = zoomLevel !== 'year';

  const handleZoomIn = () => {
    if (canZoomIn && onZoomChange) {
      onZoomChange(getPreviousZoomLevel(zoomLevel));
    }
  };

  const handleZoomOut = () => {
    if (canZoomOut && onZoomChange) {
      onZoomChange(getNextZoomLevel(zoomLevel));
    }
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Zoom controls - Compact design */}
      {onZoomChange && (
        <div className="flex items-center justify-end gap-2 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={!canZoomIn}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            </svg>
          </button>

          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[50px] text-center font-semibold">
            {zoomLevel === 'day' && 'Day'}
            {zoomLevel === 'week' && 'Week'}
            {zoomLevel === 'month' && 'Month'}
            {zoomLevel === 'quarter' && 'Quarter'}
            {zoomLevel === 'year' && 'Year'}
          </span>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={!canZoomOut}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Date headers - Simplified design */}
      <div className="flex" style={{ width }}>
        {timeUnits.map((unit, index) => {
          const isToday = unit.isToday;
          const isWeekend = unit.isWeekend;

          return (
            <div
              key={index}
              className={`
                flex items-center justify-center py-1.5 border-r border-gray-200 dark:border-gray-700 text-[11px] font-medium
                ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : ''}
                ${isWeekend && !isToday ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}
              `}
              style={{ width: columnWidth, minWidth: columnWidth }}
            >
              {unit.label}
            </div>
          );
        })}
      </div>

      {/* Secondary header (month names for week/day view) - Cleaner design */}
      {(zoomLevel === 'day' || zoomLevel === 'week') && (
        <div className="flex border-t border-gray-200 dark:border-gray-700">
          {timeUnits.reduce((acc, unit, index) => {
            const monthLabel = format(unit.start, 'MMMM yyyy');
            const prevUnit = index > 0 ? timeUnits[index - 1] : null;
            const lastMonth = prevUnit ? format(prevUnit.start, 'MMMM yyyy') : null;

            if (monthLabel !== lastMonth) {
              // Count consecutive units in same month
              let count = 1;
              for (let i = index + 1; i < timeUnits.length; i++) {
                const unit = timeUnits[i];
                if (unit && format(unit.start, 'MMMM yyyy') === monthLabel) {
                  count++;
                } else {
                  break;
                }
              }

              acc.push(
                <div
                  key={`month-${index}`}
                  className="flex items-center justify-center py-1.5 border-r border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900"
                  style={{ width: columnWidth * count, minWidth: columnWidth * count }}
                >
                  {monthLabel}
                </div>,
              );
            }

            return acc;
          }, [] as React.ReactNode[])}
        </div>
      )}
    </div>
  );
}
