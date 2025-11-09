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
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
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
  const [overId, setOverId] = useState<string | null>(null);

  // Custom collision detection that prioritizes droppable containers (columns)
  const customCollisionDetection: CollisionDetection = (args) => {
    // First, try pointer within detection for columns
    const pointerCollisions = pointerWithin(args);

    // Find collisions with columns specifically (check data.type)
    const columnCollisions = pointerCollisions.filter((collision) => {
      // Check if this is a column by looking at droppable data
      const isColumn = columns.some((col) => col.id === collision.id);
      return isColumn && collision.id !== args.active.id;
    });

    // If pointer is over a column, use that
    if (columnCollisions.length > 0) {
      return columnCollisions;
    }

    // Fall back to closest center for better accuracy
    const centerCollisions = closestCenter(args);

    // Filter valid collisions (not the active item)
    const validCollisions = centerCollisions.filter((collision) => {
      return collision && collision.id !== args.active.id;
    });

    // Find column collisions
    const closestColumnCollisions = validCollisions.filter(
      (collision) => collision && columns.some((col) => col.id === collision.id),
    );

    if (closestColumnCollisions.length > 0) {
      return closestColumnCollisions;
    }

    // If no column collision, check if we're over a record and find its column
    const recordCollisions = validCollisions.filter(
      (collision) => collision && records.some((r) => r.id === collision.id),
    );

    if (recordCollisions.length > 0) {
      const firstCollision = recordCollisions[0];
      if (firstCollision) {
        const overRecord = records.find((r) => r.id === firstCollision.id);
        if (overRecord) {
          const recordStatus = overRecord.record?.[config.statusField] ?? overRecord.data?.[config.statusField];
          const targetColumn = columns.find((col) => col.id === recordStatus);
          if (targetColumn) {
            // Return a collision for the column instead of the record
            return [
              {
                id: targetColumn.id,
                data: firstCollision.data,
              },
            ];
          }
        }
      }
      return recordCollisions;
    }

    return [];
  };

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
      name: option.text, // Added for compatibility
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

  // Handle drag over - track which droppable we're over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setOverId(null);
      return;
    }

    const overId = String(over.id);

    // If we're over a column directly, use that
    if (columns.some((col) => col.id === overId)) {
      setOverId(overId);
      return;
    }

    // If we're over a record, find its column
    const overRecord = records.find((r) => r.id === overId);
    if (overRecord) {
      const recordStatus = overRecord.record?.[config.statusField] ?? overRecord.data?.[config.statusField];
      setOverId(String(recordStatus));
      return;
    }

    setOverId(overId);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('🎯 DND handleDragEnd called', {
      activeId: active.id,
      overId: over?.id,
      trackedOverId: overId,
      overData: over?.data?.current,
    });

    // Prioritize the tracked overId from onDragOver which has better detection
    let finalOverId = overId;

    // Fall back to the over.id if we don't have a tracked ID
    if (!finalOverId && over) {
      finalOverId = String(over.id);

      // If this is a record ID, convert it to the column ID
      const overRecord = records.find((r) => r.id === finalOverId);
      if (overRecord) {
        const recordStatus = overRecord.record?.[config.statusField] ?? overRecord.data?.[config.statusField];
        finalOverId = String(recordStatus);
      }
    }

    if (!finalOverId) {
      setActiveRecordId(null);
      setOverId(null);
      return;
    }

    const activeId = String(active.id);

    // Get the active record first
    const activeRecord = records.find((r) => r.id === activeId);
    if (!activeRecord) {
      console.log('❌ Active record not found:', activeId);
      setActiveRecordId(null);
      setOverId(null);
      return;
    }

    const currentStatus = activeRecord.record?.[config.statusField] ?? activeRecord.data?.[config.statusField];

    // Find which column the card was dropped into
    const destinationColumn = columns.find((col) => col.id === finalOverId);
    console.log('🔍 Destination column:', destinationColumn?.id);

    if (destinationColumn && onRecordMove) {
      console.log('✅ Moving record:', { activeId, currentStatus, newStatus: destinationColumn.id });

      // Only trigger onRecordMove if status actually changed
      if (currentStatus !== destinationColumn.id) {
        onRecordMove(activeId, destinationColumn.id);
      } else {
        console.log('⏭️ Status unchanged, skipping move');
      }
    } else {
      console.log('❌ Cannot move - destinationColumn or onRecordMove missing');
    }

    setActiveRecordId(null);
    setOverId(null);
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
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`overflow-x-auto overflow-y-hidden ${className}`}>
        <div className="flex gap-4 p-4 min-h-[400px] min-w-max">
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
        </div>

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
