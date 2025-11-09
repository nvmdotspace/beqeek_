/**
 * GanttTask Component
 *
 * Renders a task bar on the Gantt chart with optional progress indicator
 */

import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import type { GanttTaskProps } from './gantt-props.js';
import { calculateTaskPosition } from './gantt-utils.js';

/**
 * GanttTask component
 *
 * Displays a draggable/resizable task bar with progress
 */
export function GanttTask({
  task,
  rangeStart,
  rangeEnd,
  zoomLevel: _zoomLevel,
  onClick,
  onDateChange,
  showProgress = true,
  readOnly = false,
  rowHeight = 44,
  timelineWidth,
  className = '',
}: GanttTaskProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | false>(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [tempPosition, setTempPosition] = useState<{ left: number; width: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Calculate position
  const position = calculateTaskPosition(task.startDate, task.endDate, rangeStart, rangeEnd, timelineWidth);
  const isVisible = position.isPartiallyVisible;

  // Progress percentage (0-100)
  const progressPercent = task.progress ?? 0;

  // Drag handlers with proper mouse tracking
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || onDateChange === undefined) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setTempPosition({ left: position.left, width: position.width });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && onClick) {
      onClick(task.record);
    }
  };

  // Handle drag and resize
  useEffect(() => {
    if (!isVisible || (!isDragging && !isResizing)) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!tempPosition) return;

      const deltaX = e.clientX - dragStartX;

      if (isDragging) {
        // Move entire task
        const newLeft = Math.max(0, Math.min(tempPosition.left + deltaX, timelineWidth - tempPosition.width));
        setTempPosition({ left: newLeft, width: tempPosition.width });
      } else if (isResizing === 'left') {
        // Resize from left
        const newLeft = Math.max(0, tempPosition.left + deltaX);
        const newWidth = tempPosition.width - (newLeft - tempPosition.left);
        if (newWidth >= 20) {
          setTempPosition({ left: newLeft, width: newWidth });
        }
      } else if (isResizing === 'right') {
        // Resize from right
        const newWidth = Math.max(20, tempPosition.width + deltaX);
        setTempPosition({ left: tempPosition.left, width: newWidth });
      }
    };

    const handleMouseUp = () => {
      if (tempPosition && onDateChange) {
        // Calculate new dates from pixel position
        const totalTime = rangeEnd.getTime() - rangeStart.getTime();
        const newStartTime = rangeStart.getTime() + (tempPosition.left / timelineWidth) * totalTime;
        const newEndTime =
          rangeStart.getTime() + ((tempPosition.left + tempPosition.width) / timelineWidth) * totalTime;

        onDateChange(task.id, new Date(newStartTime), new Date(newEndTime));
      }

      setIsDragging(false);
      setIsResizing(false);
      setTempPosition(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isVisible,
    isDragging,
    isResizing,
    dragStartX,
    tempPosition,
    rangeStart,
    rangeEnd,
    timelineWidth,
    task.id,
    onDateChange,
  ]);

  if (!isVisible) {
    return null; // Task is completely outside visible range
  }

  // Get priority and status from task record
  const priority = task.record?.record?.priority || task.record?.data?.priority;
  const status = task.record?.record?.status || task.record?.data?.status;

  // Consistent color system matching Kanban: Priority colors + Status patterns
  const getTaskConfig = () => {
    const lowPriority = priority?.toString().toLowerCase();
    const lowStatus = status?.toString().toLowerCase();

    // Base colors by priority (matching Kanban exactly)
    let baseConfig = {
      bg: 'bg-gray-400',
      progress: 'bg-gray-600',
      ring: 'ring-gray-500',
      text: 'text-white',
      icon: '–',
    };

    switch (lowPriority) {
      case 'high':
        baseConfig = {
          bg: 'bg-red-400',
          progress: 'bg-red-600',
          ring: 'ring-red-500',
          text: 'text-white',
          icon: '⚠️',
        };
        break;
      case 'medium':
        baseConfig = {
          bg: 'bg-amber-400',
          progress: 'bg-amber-600',
          ring: 'ring-amber-500',
          text: 'text-gray-900',
          icon: '●',
        };
        break;
      case 'low':
        baseConfig = {
          bg: 'bg-blue-400',
          progress: 'bg-blue-600',
          ring: 'ring-blue-500',
          text: 'text-white',
          icon: '○',
        };
        break;
    }

    // Status modifiers (subtle patterns on top of base colors)
    let statusClass = '';
    let opacity = 'opacity-100';

    switch (lowStatus) {
      case 'done':
        // Lighter opacity for completed tasks
        opacity = 'opacity-60';
        break;
      case 'in_progress':
        // Subtle ring for in-progress
        statusClass = `ring-2 ${baseConfig.ring}`;
        break;
      case 'review':
        // Ring with offset for review state
        statusClass = `ring-2 ring-offset-1 ${baseConfig.ring}`;
        break;
      case 'todo':
        // No extra styling for todo
        break;
    }

    return { ...baseConfig, statusClass, opacity };
  };

  const taskConfig = getTaskConfig();

  // Use temp position while dragging, otherwise use calculated position
  const displayPosition = tempPosition || position;

  return (
    <div
      ref={barRef}
      className={`
        absolute group ${isDragging || isResizing ? 'cursor-move' : 'cursor-pointer'}
        ${isDragging || isResizing ? 'transition-none' : 'transition-all duration-200'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${isDragging || isResizing ? 'z-20 scale-105' : 'z-1'}
        ${className}
      `}
      style={{
        left: `${displayPosition.left}px`,
        width: `${displayPosition.width}px`,
        top: '6px',
        height: `${rowHeight - 12}px`, // Compact height with nice spacing
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      aria-label={`${task.name}, Priority: ${priority || 'None'}, Status: ${status || 'None'}`}
    >
      {/* Task bar - Simplified design matching Kanban */}
      <div
        className={`
          relative h-full rounded-md
          ${taskConfig.bg} ${taskConfig.statusClass} ${taskConfig.opacity}
          shadow hover:shadow-lg
          transition-all duration-200
          ${isDragging ? 'opacity-50 shadow-xl' : ''}
        `}
      >
        {/* Progress bar */}
        {showProgress && progressPercent > 0 && (
          <div
            className={`absolute top-0 left-0 h-full rounded ${taskConfig.progress}`}
            style={{ width: `${progressPercent}%` }}
          />
        )}

        {/* Drag handle icon - 6 dots (2x3 grid) */}
        {!readOnly && onDateChange && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-move">
            <div className="grid grid-cols-2 gap-0.5 p-1">
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
            </div>
          </div>
        )}

        {/* Task name and progress - compact */}
        <div className={`absolute inset-0 flex items-center px-2 ${taskConfig.text} font-medium z-10`}>
          <span className="text-xs truncate">{task.name}</span>
          {showProgress && task.progress !== undefined && (
            <span className="ml-auto text-[10px] bg-black/30 px-1.5 py-0.5 rounded whitespace-nowrap">
              {task.progress}%
            </span>
          )}
        </div>

        {/* Date display on hover - only if task is wide enough */}
        {displayPosition.width > 150 && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-black/40 px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
            {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
          </div>
        )}

        {/* Resize handles (left and right) - functional */}
        {!readOnly && onDateChange && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize bg-white/80 dark:bg-gray-800/80 rounded-l opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-400 z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing('left');
                setDragStartX(e.clientX);
                setTempPosition({ left: displayPosition.left, width: displayPosition.width });
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize bg-white/80 dark:bg-gray-800/80 rounded-r opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-400 z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing('right');
                setDragStartX(e.clientX);
                setTempPosition({ left: displayPosition.left, width: displayPosition.width });
              }}
            />
          </>
        )}
      </div>

      {/* Tooltip - Cleaner design */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50">
          <div className="font-bold mb-1">{task.name}</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="opacity-75">Start:</span>
              <span className="font-medium">{format(task.startDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-75">End:</span>
              <span className="font-medium">{format(task.endDate, 'MMM d, yyyy')}</span>
            </div>
            {task.progress !== undefined && (
              <div className="flex items-center gap-2 pt-1 border-t border-white/20 dark:border-gray-700">
                <span className="opacity-75">Progress:</span>
                <div className="flex-1 h-1.5 bg-white/20 dark:bg-gray-300 rounded overflow-hidden">
                  <div className={`h-full ${taskConfig.bg}`} style={{ width: `${task.progress}%` }} />
                </div>
                <span className="font-bold text-xs">{task.progress}%</span>
              </div>
            )}
            {priority ? (
              <div className="flex items-center gap-2">
                <span className="opacity-75">Priority:</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <span aria-hidden="true">{taskConfig.icon}</span>
                  <span>{String(priority).charAt(0).toUpperCase() + String(priority).slice(1).toLowerCase()}</span>
                </span>
              </div>
            ) : null}
            {status ? (
              <div className="flex items-center gap-2">
                <span className="opacity-75">Status:</span>
                <span className="font-medium">
                  {String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
