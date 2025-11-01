/**
 * KanbanCard Component
 *
 * A card representing a single record on the Kanban board.
 * Displays headline field and additional display fields.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
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
  const formatValue = (value: unknown, fieldType?: string): string => {
    if (value === null || value === undefined) return '';

    // Handle date/datetime fields
    if (fieldType === 'DATE' || fieldType === 'DATETIME') {
      try {
        const dateStr = String(value);
        const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);

        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isYesterday(date)) return 'Yesterday';

        return format(date, 'MMM d, yyyy');
      } catch {
        return String(value);
      }
    }

    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const headlineValue = formatValue(getFieldValue(headlineField.name));

  // Get priority for color coding with accessibility improvements
  const priority = getFieldValue('priority') as string;
  const getPriorityConfig = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          badge: 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800',
          border: 'border-l-red-400 dark:border-l-red-600',
          icon: '⚠️',
          label: 'High',
        };
      case 'medium':
        return {
          badge:
            'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800',
          border: 'border-l-amber-400 dark:border-l-amber-600',
          icon: '●',
          label: 'Medium',
        };
      case 'low':
        return {
          badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800',
          border: 'border-l-blue-400 dark:border-l-blue-600',
          icon: '○',
          label: 'Low',
        };
      default:
        return {
          badge: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
          border: 'border-l-gray-300 dark:border-l-gray-600',
          icon: '–',
          label: priority || 'None',
        };
    }
  };

  const priorityConfig = getPriorityConfig();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(record)}
      className={`
        bg-white dark:bg-gray-800
        border-l-3 ${priorityConfig.border}
        border border-gray-200 dark:border-gray-700
        rounded-lg p-4 mb-3
        cursor-pointer
        shadow-md hover:shadow-xl
        transform hover:-translate-y-1 hover:scale-[1.02]
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${isDragging ? 'ring-2 ring-blue-400 shadow-2xl scale-105 rotate-1' : ''}
        ${className}
      `}
      role="button"
      tabIndex={0}
      aria-label={`${headlineValue}, Priority: ${priorityConfig.label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(record);
        }
      }}
    >
      {/* Card headline - Most important information first */}
      <div className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 leading-snug">
        {headlineValue || '(No title)'}
      </div>

      {/* Priority badge and metadata - Below title */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {priority && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${priorityConfig.badge}`}
          >
            <span aria-hidden="true">{priorityConfig.icon}</span>
            <span>{priorityConfig.label}</span>
          </span>
        )}
        {/* Show due date if available */}
        {displayFields.find((f) => f.name.toLowerCase().includes('date')) &&
          (() => {
            const dateField = displayFields.find((f) => f.name.toLowerCase().includes('date'));
            const dateValue = dateField ? getFieldValue(dateField.name) : null;
            const formattedDate = dateValue ? formatValue(dateValue, dateField?.type || 'DATE') : null;
            return formattedDate ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">📅 {formattedDate}</span>
            ) : null;
          })()}
      </div>

      {/* Display fields - Exclude priority and date (already shown above) */}
      {displayFields.length > 0 && (
        <div className="space-y-2">
          {displayFields.map((field) => {
            const value = getFieldValue(field.name);
            const displayValue = formatValue(value, field.type);

            // Skip priority and date fields (shown above)
            if (!displayValue || field.name === 'priority' || field.name.toLowerCase().includes('date')) {
              return null;
            }

            return (
              <div key={field.name} className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium min-w-[60px]">{field.label}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium flex-1">{displayValue}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
