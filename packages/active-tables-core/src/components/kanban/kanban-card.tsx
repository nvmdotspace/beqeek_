/**
 * KanbanCard Component
 *
 * A card representing a single record on the Kanban board.
 * Displays headline field and additional display fields.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanCardProps } from './kanban-props.js';

/**
 * KanbanCard component
 *
 * Renders a draggable card for a record on the Kanban board
 */
export function KanbanCard({
  record,
  headlineField,
  displayFields,
  onClick,
  readOnly = false,
  className = '',
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: record.id,
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get field value from record
  const getFieldValue = (fieldName: string): unknown => {
    return record.record?.[fieldName] ?? record.data?.[fieldName] ?? null;
  };

  // Format field value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const headlineValue = formatValue(getFieldValue(headlineField.name));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(record)}
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg p-3 mb-2
        cursor-pointer
        hover:shadow-md transition-shadow
        ${isDragging ? 'ring-2 ring-blue-500' : ''}
        ${className}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(record);
        }
      }}
    >
      {/* Card headline */}
      <div className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {headlineValue || '(No title)'}
      </div>

      {/* Display fields */}
      {displayFields.length > 0 && (
        <div className="space-y-1.5">
          {displayFields.map((field) => {
            const value = getFieldValue(field.name);
            const displayValue = formatValue(value);

            if (!displayValue) return null;

            return (
              <div key={field.name} className="text-sm">
                <span className="text-gray-500 dark:text-gray-400 text-xs">{field.label}:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{displayValue}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Drag handle indicator (when not read-only) */}
      {!readOnly && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center text-gray-400 text-xs">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
