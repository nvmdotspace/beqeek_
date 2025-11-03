/**
 * KanbanBoard V2 Component
 *
 * Enhanced Kanban board with better drag-and-drop animations using shadcn/ui kanban components.
 * Maintains original business logic and header design from v1.
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  KanbanProvider,
  KanbanBoard as ShadcnKanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard as ShadcnKanbanCard,
} from '@workspace/ui/components/kanban';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { KanbanBoardProps, ColumnData } from './kanban-props.js';
import type { TableRecord } from '../../types/record.js';
import type { FieldConfig, FieldOption } from '../../types/field.js';
import { formatFieldValue } from '../../utils/field-formatter.js';

/**
 * KanbanBoard V2 component
 *
 * Uses shadcn/ui kanban components for better animations while maintaining
 * the original business logic and features from v1.
 */
export function KanbanBoardV2({
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
  const [columnMenus, setColumnMenus] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<Record<string, string | null>>({});
  const [filterPriority, setFilterPriority] = useState<Record<string, string | null>>({});

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

  // Generate columns from status field options
  const columns = useMemo((): ColumnData[] => {
    if (!statusField || !statusField.options) {
      console.warn('Kanban: statusField not found or has no options');
      return [];
    }

    return statusField.options.map((option: FieldOption) => ({
      id: option.value,
      name: option.text, // shadcn kanban uses 'name' instead of 'title'
      title: option.text,
      recordIds: records
        .filter((r) => {
          const value = r.record?.[config.statusField] ?? r.data?.[config.statusField];
          return value === option.value;
        })
        .map((r) => r.id),
      color: option.background_color || undefined,
      textColor: option.text_color || undefined,
    }));
  }, [statusField, records, config.statusField]);

  // Convert records to kanban items format
  const kanbanItems = useMemo(() => {
    return records.map((record) => {
      const statusValue = record.record?.[config.statusField] ?? record.data?.[config.statusField];
      const headlineValue = headlineField
        ? (record.record?.[headlineField.name] ?? record.data?.[headlineField.name])
        : '';

      return {
        id: record.id,
        name: formatFieldValue(headlineValue, headlineField) || 'Untitled',
        column: String(statusValue),
        record, // Keep original record for reference
      };
    });
  }, [records, config.statusField, headlineField]);

  // Handle data change (drag & drop)
  const handleDataChange = useCallback(
    (newData: typeof kanbanItems) => {
      if (readOnly || !onRecordMove) return;

      // Find items that changed columns
      newData.forEach((item) => {
        const originalItem = kanbanItems.find((ki) => ki.id === item.id);
        if (originalItem && originalItem.column !== item.column) {
          console.log('✅ Moving record:', {
            recordId: item.id,
            from: originalItem.column,
            to: item.column,
          });
          onRecordMove(item.id, item.column);
        }
      });
    },
    [kanbanItems, onRecordMove, readOnly],
  );

  // Handle drag end event
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log('🎯 Drag ended:', event);
  }, []);

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
        {messages?.error || 'Error'}: Status field "{config.statusField}" not found
      </div>
    );
  }

  if (!headlineField) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        {messages?.error || 'Error'}: Headline field "{config.kanbanHeadlineField}" not found
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
          columns={columns as any}
          data={kanbanItems}
          onDataChange={handleDataChange}
          onDragEnd={handleDragEnd}
          className="flex gap-3"
        >
          {(column: any) => {
            const isCollapsed = collapsedColumns.has(column.id);
            const columnRecords = kanbanItems.filter((item) => item.column === column.id);

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
