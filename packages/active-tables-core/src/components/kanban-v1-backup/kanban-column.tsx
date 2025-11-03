/**
 * KanbanColumn Component
 *
 * A column on the Kanban board representing a status/category.
 * Contains multiple KanbanCard components.
 */

import React, { useState } from 'react';
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
  const { setNodeRef, isOver, active } = useDroppable({
    id: columnId,
    data: {
      type: 'column',
      columnId: columnId,
    },
  });

  const [showMenu, setShowMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'name' | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const recordIds = records.map((r) => r.id);

  // Apply sorting and filtering
  let processedRecords = [...records];

  // Filter by priority
  if (filterPriority) {
    processedRecords = processedRecords.filter((record) => {
      const priority = record.record?.priority || record.data?.priority;
      return priority?.toString().toLowerCase() === filterPriority.toLowerCase();
    });
  }

  // Sort records
  if (sortBy === 'priority') {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    processedRecords.sort((a, b) => {
      const priorityA = (a.record?.priority || a.data?.priority)?.toString().toLowerCase() || '';
      const priorityB = (b.record?.priority || b.data?.priority)?.toString().toLowerCase() || '';
      return (priorityOrder[priorityA] ?? 3) - (priorityOrder[priorityB] ?? 3);
    });
  } else if (sortBy === 'date') {
    processedRecords.sort((a, b) => {
      const dateFieldA = a.record?.due_date || a.data?.due_date;
      const dateFieldB = b.record?.due_date || b.data?.due_date;
      if (!dateFieldA) return 1;
      if (!dateFieldB) return -1;
      return new Date(String(dateFieldA)).getTime() - new Date(String(dateFieldB)).getTime();
    });
  } else if (sortBy === 'name') {
    processedRecords.sort((a, b) => {
      const nameA = a.record?.[headlineField.name] || a.data?.[headlineField.name] || '';
      const nameB = b.record?.[headlineField.name] || b.data?.[headlineField.name] || '';
      return String(nameA).localeCompare(String(nameB));
    });
  }

  return (
    <div
      className={`
        flex flex-col
        bg-gray-50 dark:bg-gray-900
        rounded-lg
        w-[300px] min-w-[300px]
        flex-shrink-0
        ${className}
      `}
    >
      {/* Simple column header - inspired by reference image */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {/* Status indicator dot */}
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{processedRecords.length}</span>
        </div>

        {/* Menu button - Three dots */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Column options"
          >
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              {/* Overlay to close menu */}
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />

              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                <div className="py-1">
                  {/* Sort section */}
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Sort by</div>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      sortBy === 'priority' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setSortBy(sortBy === 'priority' ? null : 'priority');
                      setShowMenu(false);
                    }}
                  >
                    <span>Priority</span>
                    {sortBy === 'priority' && <span className="text-blue-600">✓</span>}
                  </button>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      sortBy === 'date' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setSortBy(sortBy === 'date' ? null : 'date');
                      setShowMenu(false);
                    }}
                  >
                    <span>Due Date</span>
                    {sortBy === 'date' && <span className="text-blue-600">✓</span>}
                  </button>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      sortBy === 'name' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setSortBy(sortBy === 'name' ? null : 'name');
                      setShowMenu(false);
                    }}
                  >
                    <span>Name</span>
                    {sortBy === 'name' && <span className="text-blue-600">✓</span>}
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                  {/* Filter section */}
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Filter by priority
                  </div>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      filterPriority === 'high'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setFilterPriority(filterPriority === 'high' ? null : 'high');
                      setShowMenu(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>High</span>
                    </span>
                    {filterPriority === 'high' && <span className="text-blue-600">✓</span>}
                  </button>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      filterPriority === 'medium'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setFilterPriority(filterPriority === 'medium' ? null : 'medium');
                      setShowMenu(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span>●</span>
                      <span>Medium</span>
                    </span>
                    {filterPriority === 'medium' && <span className="text-blue-600">✓</span>}
                  </button>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      filterPriority === 'low' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setFilterPriority(filterPriority === 'low' ? null : 'low');
                      setShowMenu(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span>○</span>
                      <span>Low</span>
                    </span>
                    {filterPriority === 'low' && <span className="text-blue-600">✓</span>}
                  </button>

                  {(sortBy || filterPriority) && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setSortBy(null);
                          setFilterPriority(null);
                          setShowMenu(false);
                        }}
                      >
                        Clear all
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Column body (cards container) */}
      {!collapsed && (
        <div
          ref={setNodeRef}
          className={`
            flex-1 p-4 overflow-y-auto max-h-[calc(100vh-200px)]
            ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400' : ''}
            transition-all duration-200
            rounded-b-lg
          `}
        >
          <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
            {processedRecords.length === 0 ? (
              <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm min-h-[200px] flex items-center justify-center">
                {filterPriority || sortBy
                  ? `No ${filterPriority || ''} priority cards`
                  : messages?.dropHere || 'Drop cards here'}
              </div>
            ) : (
              processedRecords.map((record) => (
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
          {processedRecords.length} {messages?.records || 'records'}
        </div>
      )}
    </div>
  );
}
