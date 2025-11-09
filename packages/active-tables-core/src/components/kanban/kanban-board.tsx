/**
 * KanbanBoard V2 Component
 *
 * Enhanced Kanban board with better drag-and-drop animations using shadcn/ui kanban components.
 * Maintains original business logic and header design from v1.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  KanbanProvider,
  KanbanBoard as ShadcnKanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard as ShadcnKanbanCard,
} from '@workspace/ui/components/kanban';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { KanbanBoardProps, ColumnData } from './kanban-props.js';
import type { FieldConfig, FieldOption } from '../../types/field.js';
import { formatFieldValue } from '../../utils/field-formatter.js';

/**
 * KanbanBoard V2 component
 *
 * Uses shadcn/ui kanban components for better animations while maintaining
 * the original business logic and features from v1.
 */
export function KanbanBoard({
  records,
  config,
  onRecordMove,
  onRecordClick,
  loading = false,
  readOnly = false,
  table,
  messages,
  className = '',
}: KanbanBoardProps) {
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());

  // Find the status field configuration
  const statusField = useMemo(() => {
    return table.config.fields.find((f) => f.name === config.statusField);
  }, [table.config.fields, config.statusField]);

  // Find headline field
  const headlineField = useMemo(() => {
    return table.config.fields.find((f) => f.name === config.kanbanHeadlineField);
  }, [table.config.fields, config.kanbanHeadlineField]);

  // Find display fields
  const displayFields = useMemo(() => {
    return config.displayFields
      .map((fieldName) => table.config.fields.find((f) => f.name === fieldName))
      .filter((f): f is FieldConfig => f !== undefined);
  }, [config.displayFields, table.config.fields]);

  // Generate columns from status field options - memoized for performance
  const columns = useMemo((): ColumnData[] => {
    if (!statusField || !statusField.options) {
      console.warn('Kanban: statusField not found or has no options');
      return [];
    }

    // Create a map of record counts for faster lookup
    const recordCounts = new Map<string, number>();
    records.forEach((r) => {
      const value = r.record?.[config.statusField] ?? r.data?.[config.statusField];
      if (value) {
        recordCounts.set(String(value), (recordCounts.get(String(value)) || 0) + 1);
      }
    });

    return statusField.options.map((option: FieldOption) => {
      const optionValue = String(option.value);
      return {
        id: optionValue,
        name: option.text, // shadcn kanban uses 'name' instead of 'title'
        title: option.text,
        recordIds: [], // We'll calculate this lazily when needed
        recordCount: recordCounts.get(optionValue) || 0,
        color: option.background_color || undefined,
        textColor: option.text_color || undefined,
      };
    });
  }, [statusField, records, config.statusField]);

  // Convert records to kanban items format - memoized for performance
  const kanbanItems = useMemo(() => {
    return records.map((record) => {
      const statusValue = record.record?.[config.statusField] ?? record.data?.[config.statusField];
      const headlineValue = headlineField
        ? (record.record?.[headlineField.name] ?? record.data?.[headlineField.name])
        : '';

      return {
        id: record.id,
        name: formatFieldValue(headlineValue, headlineField) || 'Untitled',
        column: String(statusValue || 'unknown'), // Ensure column is always a string
        record, // Keep original record for reference
      };
    });
  }, [records, config.statusField, headlineField]);

  // Local state for kanban items - syncs with props
  const [boardData, setBoardData] = useState(() => kanbanItems.map((item) => ({ ...item })));

  // Snapshot of kanbanItems (SERVER SOURCE OF TRUTH) when drag starts
  // IMPORTANT: Use kanbanItems (server state), NOT boardData (mutated by Provider)
  const dragStartSnapshotRef = useRef<Record<string, { column: string; name: string }>>({});

  // Sync boardData with kanbanItems from props (when records change from API)
  useEffect(() => {
    setBoardData(kanbanItems.map((item) => ({ ...item })));
    // Clear snapshot when server data changes (refetch completed)
    // This ensures next drag uses fresh server state
    dragStartSnapshotRef.current = {};
  }, [kanbanItems]);

  // Handle drag start - save snapshot for comparison
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      // Snapshot kanbanItems (server state) NOT boardData (Provider mutates boardData during drag)
      // This prevents comparing against stale state from previous drag
      dragStartSnapshotRef.current = kanbanItems.reduce<Record<string, { column: string; name: string }>>(
        (acc, item) => {
          acc[item.id] = {
            column: String(item.column),
            name: item.name,
          };
          return acc;
        },
        {},
      );

      console.log('[Kanban] Drag started', {
        cardId: event.active.id,
        snapshotSize: Object.keys(dragStartSnapshotRef.current).length,
      });
    },
    [kanbanItems],
  );

  // Handle data change from dnd-kit (optimistic UI update)
  const handleDataChange = useCallback((newData: typeof kanbanItems) => {
    setBoardData(newData);
  }, []);

  // Handle drag end - detect column changes and call API
  // IMPORTANT: Provider calls onDragEnd BEFORE onDataChange, so we must detect here
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      console.log('[Kanban] handleDragEnd', {
        activeId: active.id,
        overId: over?.id,
        hasSnapshot: Object.keys(dragStartSnapshotRef.current).length > 0,
      });

      // Early return if invalid drop
      if (!over || !onRecordMove || readOnly) {
        console.log('[Kanban] handleDragEnd: early return', { over: !!over, onRecordMove: !!onRecordMove, readOnly });
        return;
      }

      // Check if we have a snapshot
      if (Object.keys(dragStartSnapshotRef.current).length === 0) {
        console.log('[Kanban] No snapshot available - skipping');
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);

      // Find the dragged item in snapshot (original state)
      const snapshotItem = dragStartSnapshotRef.current[activeId];

      if (!snapshotItem) {
        console.log('[Kanban] Item not found in snapshot:', activeId);
        dragStartSnapshotRef.current = {};
        return;
      }

      // Determine target column from over element
      // overId can be: column ID (q1, q2, q3, q4) or another card ID
      const isDroppedOnColumn = columns.some((col) => col.id === overId);
      let targetColumn: string;

      if (isDroppedOnColumn) {
        // Dropped directly on column
        targetColumn = overId;
      } else {
        // Dropped on another card - find that card's column in kanbanItems (server state)
        // IMPORTANT: Use kanbanItems, NOT boardData (Provider may have mutated it)
        const overItem = kanbanItems.find((item) => item.id === overId);
        if (overItem) {
          targetColumn = String(overItem.column);
        } else {
          console.log('[Kanban] Cannot determine target column - card not found in server state');
          return;
        }
      }

      const oldColumn = String(snapshotItem.column);

      console.log('[Kanban DEBUG] Column check:', {
        activeId,
        oldColumn,
        targetColumn,
        different: oldColumn !== targetColumn,
      });

      // Check if column actually changed
      if (oldColumn !== targetColumn) {
        console.log(`[Kanban] ✅ Column change detected: ${activeId} from "${oldColumn}" to "${targetColumn}"`);
        console.log(`[Kanban] Calling onRecordMove...`);
        onRecordMove(activeId, targetColumn);
      } else {
        console.log('[Kanban] No column change (same column) - skipping API call');
      }

      // DON'T clear snapshot here - it will be cleared when kanbanItems updates (refetch completes)
      // This prevents race conditions with Provider's onDataChange
    },
    [kanbanItems, columns, onRecordMove, readOnly],
  );

  // Toggle column collapse state
  const toggleColumnCollapse = useCallback((columnId: string) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  }, []);

  // Validation
  if (!statusField) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        {messages?.error || 'Error'}: Status field &quot;{config.statusField}&quot; not found
      </div>
    );
  }

  if (!headlineField) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        {messages?.error || 'Error'}: Headline field &quot;{config.kanbanHeadlineField}&quot; not found
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

  return (
    <div className={`overflow-x-auto overflow-y-hidden ${className}`}>
      <div className="min-h-[400px] min-w-max p-4">
        <KanbanProvider
          columns={columns}
          data={boardData}
          onDataChange={handleDataChange}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="flex gap-3"
        >
          {(column: ColumnData) => {
            const isCollapsed = collapsedColumns.has(column.id);
            const columnRecords = boardData.filter((item) => item.column === column.id);

            return (
              <ShadcnKanbanBoard
                key={column.id}
                id={column.id}
                className={`
                  w-[280px] min-w-[280px] flex-shrink-0
                  bg-gray-50 dark:bg-gray-900 rounded-lg
                  ${isCollapsed ? 'min-w-[50px] w-[50px]' : ''}
                `}
              >
                {/* Header design exactly like v1 */}
                <KanbanHeader className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  {!isCollapsed ? (
                    <>
                      <div className="flex items-center gap-2">
                        {/* Status indicator dot - positioned at beginning like v1 */}
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: column.color || '#9CA3AF' }}
                        />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{column.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{columnRecords.length}</span>
                      </div>

                      {/* Collapse button like v1 */}
                      <button
                        type="button"
                        onClick={() => toggleColumnCollapse(column.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Toggle column"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </>
                  ) : (
                    <div
                      className="w-full flex flex-col items-center py-3 cursor-pointer"
                      onClick={() => toggleColumnCollapse(column.id)}
                    >
                      <ChevronRight className="h-4 w-4 text-gray-500 mb-2" />
                      <div className="flex items-center gap-1" style={{ writingMode: 'vertical-lr' }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color || '#9CA3AF' }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{column.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({columnRecords.length})</span>
                      </div>
                    </div>
                  )}
                </KanbanHeader>

                {!isCollapsed && (
                  <KanbanCards id={column.id} className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {(item: (typeof kanbanItems)[0]) => {
                      // Get status option for this item to get colors
                      const statusOption = statusField?.options?.find((opt: FieldOption) => opt.value === item.column);

                      return (
                        <ShadcnKanbanCard
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          column={item.column}
                          className="mb-2 cursor-pointer hover:shadow-lg transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                          onClick={() => onRecordClick?.(item.record)}
                        >
                          <div className="p-3 space-y-2">
                            {/* Status color bar at top */}
                            {statusOption?.background_color && (
                              <div
                                className="h-1 -mx-3 -mt-3 mb-2 rounded-t-md"
                                style={{ backgroundColor: statusOption.background_color }}
                              />
                            )}

                            {/* Headline */}
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                              {item.name}
                            </div>

                            {/* Display fields with better colors */}
                            {displayFields.length > 0 && (
                              <div className="space-y-1">
                                {displayFields.slice(0, 3).map((field) => {
                                  const value = item.record.record?.[field.name] ?? item.record.data?.[field.name];
                                  if (!value) return null;

                                  // Special handling for field types
                                  const formattedValue = formatFieldValue(value, field);
                                  const isUserField =
                                    field.type === 'SELECT_ONE_WORKSPACE_USER' ||
                                    field.type === 'SELECT_LIST_WORKSPACE_USER';
                                  const isStatus = field.type === 'SELECT_ONE' && field.options?.length;

                                  return (
                                    <div key={field.name} className="text-xs">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {field.label || field.name}:
                                      </span>
                                      {isStatus && field.options ? (
                                        <span
                                          className="ml-1 px-1.5 py-0.5 rounded-sm text-[11px] font-medium"
                                          style={{
                                            backgroundColor:
                                              field.options.find((o) => o.value === value)?.background_color + '20',
                                            color:
                                              field.options.find((o) => o.value === value)?.text_color || 'inherit',
                                          }}
                                        >
                                          {formattedValue}
                                        </span>
                                      ) : isUserField ? (
                                        <span className="ml-1 text-blue-600 dark:text-blue-400 font-medium">
                                          {formattedValue}
                                        </span>
                                      ) : (
                                        <span className="ml-1 text-gray-700 dark:text-gray-300">{formattedValue}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Record metadata */}
                            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700">
                              <span>#{item.id}</span>
                              {item.record.updatedAt && (
                                <span>{new Date(item.record.updatedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </ShadcnKanbanCard>
                      );
                    }}
                  </KanbanCards>
                )}
              </ShadcnKanbanBoard>
            );
          }}
        </KanbanProvider>
      </div>
    </div>
  );
}
