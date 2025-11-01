/**
 * KanbanColumn Component
 *
 * A column on the Kanban board representing a status/category.
 * Contains multiple KanbanCard components.
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card.js';
import type { KanbanColumnProps } from './kanban-props.js';

/**
 * KanbanColumn component
 *
 * Renders a droppable column containing sortable cards
 */
export function KanbanColumn({
  columnId,
  title,
  color,
  textColor,
  records,
  config,
  headlineField,
  displayFields,
  onRecordClick,
  collapsed = false,
  onToggleCollapse,
  readOnly = false,
  table,
  messages,
  className = '',
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  const recordIds = records.map((r) => r.id);

  return (
    <div
      className={`
        flex flex-col
        bg-gray-50 dark:bg-gray-900
        rounded-lg
        min-w-[280px] max-w-[320px]
        ${className}
      `}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700"
        style={{
          backgroundColor: color,
          color: textColor,
        }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs opacity-75">({records.length})</span>
        </div>

        {/* Collapse button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            aria-label={collapsed ? 'Expand column' : 'Collapse column'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Column body (cards container) */}
      {!collapsed && (
        <div
          ref={setNodeRef}
          className={`
            flex-1 p-3 overflow-y-auto max-h-[calc(100vh-200px)]
            ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            transition-colors
          `}
        >
          <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
            {records.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                {messages?.dropHere || 'Drop cards here'}
              </div>
            ) : (
              records.map((record) => (
                <KanbanCard
                  key={record.id}
                  record={record}
                  headlineField={headlineField}
                  displayFields={displayFields}
                  onClick={onRecordClick}
                  readOnly={readOnly}
                  table={table}
                  messages={messages}
                />
              ))
            )}
          </SortableContext>
        </div>
      )}

      {/* Collapsed state */}
      {collapsed && (
        <div className="p-3 text-center text-gray-400 dark:text-gray-500 text-sm">
          {records.length} {messages?.records || 'records'}
        </div>
      )}
    </div>
  );
}
