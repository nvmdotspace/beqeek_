/**
 * GanttChart Component
 *
 * Main Gantt chart component that orchestrates timeline, grid, and task bars
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { GanttTimeline } from './gantt-timeline.js';
import { GanttGrid } from './gantt-grid.js';
import { GanttTask } from './gantt-task.js';
import { useGanttZoom } from './use-gantt-zoom.js';
import type { GanttChartProps, ZoomLevel } from './gantt-props.js';
import { recordsToTasks, calculateDateRange, getUnitWidth } from './gantt-utils.js';

/**
 * GanttChartView component
 *
 * Displays records as task bars on a timeline
 */
export function GanttChartView({
  records,
  config,
  zoomLevel: controlledZoomLevel,
  onZoomChange,
  onTaskDateChange,
  onTaskClick,
  loading = false,
  readOnly = false,
  showDependencies = false,
  showProgress = true,
  showToday = true,
  table,
  messages,
  className = '',
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  // Zoom control (internal or controlled)
  const internalZoom = useGanttZoom(controlledZoomLevel || 'week');
  const zoomLevel = controlledZoomLevel || internalZoom.zoomLevel;
  const setZoomLevel = onZoomChange || internalZoom.setZoomLevel;

  // Convert records to tasks
  const tasks = useMemo(() => {
    return recordsToTasks(records, config);
  }, [records, config]);

  // Calculate date range
  const dateRange = useMemo(() => {
    return calculateDateRange(tasks, zoomLevel);
  }, [tasks, zoomLevel]);

  // Calculate timeline width
  const timelineWidth = useMemo(() => {
    const unitWidth = getUnitWidth(zoomLevel);
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

    switch (zoomLevel) {
      case 'day':
        return days * unitWidth;
      case 'week':
        return Math.ceil(days / 7) * unitWidth;
      case 'month':
        return Math.ceil(days / 30) * unitWidth;
      case 'quarter':
        return Math.ceil(days / 90) * unitWidth;
      case 'year':
        return Math.ceil(days / 365) * unitWidth;
      default:
        return days * unitWidth;
    }
  }, [dateRange, zoomLevel]);

  // Track container width for responsive layout
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Constants - compact sizing for friendly appearance
  const ROW_HEIGHT = 36; // Compact height like Kanban cards
  const LABEL_WIDTH = containerWidth < 640 ? 120 : containerWidth < 768 ? 140 : 180; // Narrower label width

  // Validation
  if (!config.taskNameField || !config.startDateField || !config.endDateField) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        {messages?.error || 'Error'}: Missing required Gantt configuration fields
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500 dark:text-gray-400">{messages?.loading || 'Loading...'}</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">{messages?.noRecordsFound || 'No tasks found'}</div>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          {messages?.noRecordsDescription || 'Add records with valid start and end dates to see them here'}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-white dark:bg-gray-950 ${className}`}>
      {/* Timeline header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {/* Task names column header - Compact */}
        <div
          className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-3 py-1.5"
          style={{ width: LABEL_WIDTH }}
        >
          <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate">
            {messages?.records || 'Tasks'}
          </div>
        </div>

        {/* Timeline - Fixed for proper scrolling */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <GanttTimeline
            startDate={dateRange.start}
            endDate={dateRange.end}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            showToday={showToday}
            width={timelineWidth}
            table={table}
            messages={messages}
          />
        </div>
      </div>

      {/* Chart body */}
      <div className="flex-1 flex min-h-0">
        {/* Task names column - Compact design */}
        <div
          className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
          style={{ width: LABEL_WIDTH }}
        >
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="px-3 flex items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
              style={{ height: ROW_HEIGHT }}
              onClick={() => onTaskClick?.(task.record)}
              title={task.name} // Show full name on hover
            >
              <div className="text-xs text-gray-900 dark:text-gray-100 truncate font-medium">{task.name}</div>
            </div>
          ))}
        </div>

        {/* Chart area - Fixed for proper scrolling */}
        <div className="flex-1 min-w-0 relative overflow-x-auto overflow-y-auto">
          <div className="relative" style={{ width: timelineWidth, minWidth: '100%' }}>
            {/* Grid background */}
            <GanttGrid
              startDate={dateRange.start}
              endDate={dateRange.end}
              zoomLevel={zoomLevel}
              rowCount={tasks.length}
              rowHeight={ROW_HEIGHT}
              width={timelineWidth}
              highlightWeekends={true}
              showToday={showToday}
              table={table}
              messages={messages}
            />

            {/* Task bars */}
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="absolute left-0"
                style={{
                  top: index * ROW_HEIGHT,
                  width: timelineWidth,
                  height: ROW_HEIGHT,
                }}
              >
                <GanttTask
                  task={task}
                  rangeStart={dateRange.start}
                  rangeEnd={dateRange.end}
                  zoomLevel={zoomLevel}
                  onClick={onTaskClick}
                  onDateChange={onTaskDateChange}
                  showProgress={showProgress}
                  readOnly={readOnly}
                  rowHeight={ROW_HEIGHT}
                  timelineWidth={timelineWidth}
                  table={table}
                  messages={messages}
                />
              </div>
            ))}

            {/* TODO: Dependency lines (if showDependencies is true) */}
          </div>
        </div>
      </div>
    </div>
  );
}
