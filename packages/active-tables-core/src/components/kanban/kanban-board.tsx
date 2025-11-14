/**
 * KanbanBoard V2 Component
 *
 * Enhanced Kanban board with better drag-and-drop animations using shadcn/ui kanban components.
 * Maintains original business logic and header design from v1.
 *
 * DRAG-AND-DROP BEHAVIOR:
 * - Cards CANNOT be reordered within the same column (maintains "in-order" flow)
 * - Cards can ONLY be moved to different columns
 * - When dropped in a different column, cards are automatically placed at the BOTTOM
 * - This behavior is enforced by the shadcn/ui KanbanProvider component
 * - See: packages/ui/src/components/ui/shadcn-io/kanban/index.tsx (lines 222-278)
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
  workspaceUsers,
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
        name: formatFieldValue(headlineValue, headlineField, workspaceUsers) || 'Untitled',
        column: String(statusValue || 'unknown'), // Ensure column is always a string
        record, // Keep original record for reference
      };
    });
  }, [records, config.statusField, headlineField, workspaceUsers]);

  // Local state for kanban items - syncs with props
  const [boardData, setBoardData] = useState(() => kanbanItems.map((item) => ({ ...item })));

  // Sync boardData with kanbanItems from props (when records change from API)
  useEffect(() => {
    setBoardData(kanbanItems.map((item) => ({ ...item })));
  }, [kanbanItems]);

  // Handle drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      // Optional: Add custom drag start logic here
    },
    [kanbanItems],
  );

  // Handle data change from dnd-kit (optimistic UI update)
  const handleDataChange = useCallback((newData: typeof kanbanItems) => {
    setBoardData(newData);
  }, []);

  // Handle drag end - detect column changes and call API
  // IMPORTANT: Provider calls onDragEnd BEFORE onDataChange, so we must detect here
  //
  // COMPLETE DRAG-AND-DROP FLOW (SIMPLIFIED - No Snapshot):
  // ========================================================
  // 1. UI Layer (shadcn/ui KanbanProvider):
  //    - handleDragOver: Prevents same-column reordering (lines 222-226 in kanban/index.tsx)
  //    - handleDragOver: Moves cards to bottom of target column (lines 232-252)
  //    - handleDragEnd: Final sync if onDragOver didn't fire (lines 274-306)
  //
  // 2. Business Logic Layer (this function):
  //    - Get old column from kanbanItems (server state) at drop time
  //    - Determine target column from drop position
  //    - Compare old vs new column
  //    - Call onRecordMove(recordId, newColumnValue) if changed
  //    - NO position/order data sent - API only receives field update
  //
  // 3. API Layer (active-table-records-page.tsx):
  //    - onRecordMove -> updateRecordMutation.mutate({ recordId, fieldName, newValue })
  //    - useUpdateRecordField -> buildEncryptedUpdatePayload(fieldName, newValue, ...)
  //    - Payload: { record: { status: "encrypted_value" }, hashed_keywords: {}, record_hashes: {} }
  //    - PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}
  //    - Schema: ActiveTableRecordUpdateRequest (only record data, NO position field)
  //
  // 4. Server Behavior:
  //    - Receives only the field value change (e.g., status: "q1" -> "q2")
  //    - Server determines final record order based on its own business logic
  //    - Client refetches records after successful update (queryClient.invalidateQueries)
  //    - UI syncs to server's authoritative order
  //
  // KEY GUARANTEES:
  // ✅ Cards CANNOT be reordered within same column (UI blocks it)
  // ✅ Cards can ONLY move to different columns
  // ✅ Cards ALWAYS land at bottom of target column (UI enforces it)
  // ✅ NO position data sent to API (verified in swagger.yaml)
  // ✅ Server is source of truth for record order
  // ✅ 100% reliable (learned from PHP Blade implementation)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Early return if invalid drop
      if (!over || !onRecordMove || readOnly) {
        return;
      }

      const activeId = String(active.id);

      // ✅ Get old column from kanbanItems (server state) at drop time
      const activeItemInServer = kanbanItems.find((item) => item.id === activeId);
      if (!activeItemInServer) {
        return;
      }
      const oldColumn = String(activeItemInServer.column);

      // ✅ Get new column from boardData (optimistic UI state)
      // CRITICAL: boardData is updated by handleDragOver/onDataChange BEFORE handleDragEnd
      // So we can trust boardData.column as the target column even if over.id === active.id
      const activeItemInBoard = boardData.find((item) => item.id === activeId);
      if (!activeItemInBoard) {
        return;
      }
      const newColumn = String(activeItemInBoard.column);

      // ✅ Check if column actually changed
      if (oldColumn !== newColumn) {
        onRecordMove(activeId, newColumn);
      }
    },
    [kanbanItems, boardData, onRecordMove, readOnly],
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
                                  const formattedValue = formatFieldValue(value, field, workspaceUsers);
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
