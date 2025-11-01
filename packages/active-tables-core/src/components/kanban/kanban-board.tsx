/**
 * KanbanBoard Component
 *
 * Main Kanban board component that orchestrates columns and drag-and-drop.
 * Generates columns based on statusField options and organizes records accordingly.
 */

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column.js';
import { KanbanCard } from './kanban-card.js';
import type { KanbanBoardProps, ColumnData } from './kanban-props.js';
import type { TableRecord } from '../../types/record.js';
import type { FieldConfig, FieldOption } from '../../types/field.js';

/**
 * KanbanBoard component
 *
 * Displays records as cards organized in columns based on a status field.
 * Supports drag-and-drop to move records between columns.
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
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      title: option.text,
      recordIds: records
        .filter((r) => {
          const value = r.record?.[config.statusField] ?? r.data?.[config.statusField];
          return value === option.value;
        })
        .map((r) => r.id),
      color: option.background_color,
      textColor: option.text_color,
    }));
  }, [statusField, records, config.statusField]);

  // Group records by column
  const recordsByColumn = useMemo(() => {
    const grouped = new Map<string, TableRecord[]>();

    columns.forEach((col) => {
      grouped.set(col.id, []);
    });

    records.forEach((record) => {
      const statusValue = record.record?.[config.statusField] ?? record.data?.[config.statusField];
      const columnRecords = grouped.get(String(statusValue));
      if (columnRecords) {
        columnRecords.push(record);
      }
    });

    return grouped;
  }, [columns, records, config.statusField]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveRecordId(String(event.active.id));
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveRecordId(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find which column the card was dropped into
    const destinationColumn = columns.find((col) => col.id === overId);

    if (destinationColumn && onRecordMove) {
      // Get the active record
      const activeRecord = records.find((r) => r.id === activeId);
      if (activeRecord) {
        const currentStatus = activeRecord.record?.[config.statusField] ?? activeRecord.data?.[config.statusField];

        // Only trigger onRecordMove if status actually changed
        if (currentStatus !== destinationColumn.id) {
          onRecordMove(activeId, destinationColumn.id);
        }
      }
    }

    setActiveRecordId(null);
  };

  // Toggle column collapse state
  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  // Get active record for drag overlay
  const activeRecord = activeRecordId ? records.find((r) => r.id === activeRecordId) : null;

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex gap-4 overflow-x-auto p-4 min-h-[400px] ${className}`}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            columnId={column.id}
            title={column.title}
            color={column.color}
            textColor={column.textColor}
            records={recordsByColumn.get(column.id) || []}
            config={config}
            headlineField={headlineField}
            displayFields={displayFields}
            onRecordClick={onRecordClick}
            collapsed={collapsedColumns.has(column.id)}
            onToggleCollapse={() => toggleColumnCollapse(column.id)}
            readOnly={readOnly}
            table={table}
            messages={messages}
          />
        ))}

        {/* Drag overlay - shows card being dragged */}
        <DragOverlay>
          {activeRecord && headlineField ? (
            <div className="opacity-90 rotate-3">
              <KanbanCard
                record={activeRecord}
                headlineField={headlineField}
                displayFields={displayFields}
                isDragging
                table={table}
                messages={messages}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
