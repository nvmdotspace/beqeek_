/**
 * GanttTask Component
 *
 * Renders a task bar on the Gantt chart with optional progress indicator
 */

import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import type { GanttTaskProps } from './gantt-props.js';
import { calculateTaskPosition, positionToDate } from './gantt-utils.js';

/**
 * GanttTask component
 *
 * Displays a draggable/resizable task bar with progress
 */
export function GanttTask({
  task,
  rangeStart,
  rangeEnd,
  zoomLevel,
  onClick,
  onDateChange,
  showProgress = true,
  readOnly = false,
  rowHeight = 44,
  timelineWidth,
  className = '',
}: GanttTaskProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Calculate position
  const position = calculateTaskPosition(task.startDate, task.endDate, rangeStart, rangeEnd, timelineWidth);

  if (!position.isPartiallyVisible) {
    return null; // Task is completely outside visible range
  }

  // Progress percentage (0-100)
  const progressPercent = task.progress ?? 0;

  // Drag and resize handlers (simplified - full implementation would need proper event handling)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || onDateChange === undefined) return;
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(task.record);
    }
  };

  // Task bar color (default blue)
  const barColor = task.color || '#3b82f6';

  return (
    <div
      ref={barRef}
      className={`
        absolute group cursor-pointer
        ${isDragging ? 'z-10' : 'z-1'}
        ${className}
      `}
      style={{
        left: `${position.left}px`,
        width: `${position.width}px`,
        top: '8px',
        height: `${rowHeight - 16}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      aria-label={task.name}
    >
      {/* Task bar */}
      <div
        className="relative h-full rounded shadow-sm hover:shadow-md transition-shadow"
        style={{
          backgroundColor: barColor,
          opacity: isDragging ? 0.7 : 1,
        }}
      >
        {/* Progress bar */}
        {showProgress && progressPercent > 0 && (
          <div className="absolute top-0 left-0 h-full rounded bg-white/30" style={{ width: `${progressPercent}%` }} />
        )}

        {/* Task name */}
        <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-medium truncate">
          {task.name}
          {showProgress && task.progress !== undefined && <span className="ml-2 opacity-75">({task.progress}%)</span>}
        </div>

        {/* Resize handles (left and right) */}
        {!readOnly && onDateChange && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
            />
          </>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
          <div className="font-semibold">{task.name}</div>
          <div className="mt-1 opacity-90">
            {format(task.startDate, 'MMM d, yyyy')} - {format(task.endDate, 'MMM d, yyyy')}
          </div>
          {task.progress !== undefined && <div className="mt-1 opacity-90">Progress: {task.progress}%</div>}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
          </div>
        </div>
      )}
    </div>
  );
}
