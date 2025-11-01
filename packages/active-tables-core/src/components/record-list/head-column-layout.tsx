/**
 * HeadColumnLayout Component
 *
 * Card-based list layout with title, subline, and tail fields
 * Mobile-optimized design with Kanban-inspired visual consistency
 */

import { useCallback } from 'react';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import type { LayoutProps } from './record-list-props.js';
import type { TableRecord } from '../../types/record.js';
import { FieldRenderer } from '../fields/field-renderer.js';
import { useRecordDecryption } from '../../hooks/use-encryption.js';

export function HeadColumnLayout(props: LayoutProps) {
  const {
    table,
    records,
    config,
    onRecordClick,
    selectedIds = [],
    onSelectionChange,
    currentUser,
    workspaceUsers,
    messages,
    encryptionKey,
    className = '',
  } = props;

  const { decryptRecord } = useRecordDecryption(table, encryptionKey);

  // Get field config by name
  const getFieldConfig = useCallback(
    (fieldName: string) => {
      return table.config.fields.find((f) => f.name === fieldName);
    },
    [table.config.fields],
  );

  // Handle card click
  const handleCardClick = useCallback(
    (record: TableRecord) => {
      if (onRecordClick) {
        onRecordClick(record);
      }
    },
    [onRecordClick],
  );

  // Handle selection toggle
  const handleSelectionToggle = useCallback(
    (recordId: string, event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent card click

      if (!onSelectionChange) return;

      const isSelected = selectedIds.includes(recordId);
      const newSelection = isSelected ? selectedIds.filter((id) => id !== recordId) : [...selectedIds, recordId];

      onSelectionChange(newSelection);
    },
    [selectedIds, onSelectionChange],
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {records.map((record) => {
        const decryptedRecord = decryptRecord(record);
        const isSelected = selectedIds.includes(record.id);

        // Get field values
        const titleField = getFieldConfig(config.titleField);
        const titleValue = decryptedRecord.data![config.titleField];

        return (
          <div
            key={record.id}
            role="button"
            tabIndex={0}
            aria-label={`${titleValue || 'Record'}, ID: ${record.id}`}
            onClick={() => handleCardClick(record)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(record);
              }
            }}
            className={`
              relative
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg p-4 mb-3
              cursor-pointer
              shadow-md hover:shadow-xl
              transform hover:-translate-y-1 hover:scale-[1.02]
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            `}
          >
            {/* Selection checkbox (if selection enabled) */}
            {onSelectionChange && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleSelectionToggle(record.id, e as any)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <CardContent
                    record={decryptedRecord}
                    config={config}
                    titleField={titleField}
                    titleValue={titleValue}
                    getFieldConfig={getFieldConfig}
                    table={table}
                    currentUser={currentUser}
                    workspaceUsers={workspaceUsers}
                    messages={messages}
                  />
                </div>
              </div>
            )}

            {!onSelectionChange && (
              <CardContent
                record={decryptedRecord}
                config={config}
                titleField={titleField}
                titleValue={titleValue}
                getFieldConfig={getFieldConfig}
                table={table}
                currentUser={currentUser}
                workspaceUsers={workspaceUsers}
                messages={messages}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Card content component (extracted for reusability)
 */
interface CardContentProps {
  record: TableRecord;
  config: any;
  titleField: any;
  titleValue: any;
  getFieldConfig: (name: string) => any;
  table: any;
  currentUser: any;
  workspaceUsers: any;
  messages: any;
}

function CardContent({
  record,
  config,
  titleField,
  titleValue,
  getFieldConfig,
  table,
  currentUser,
  workspaceUsers,
  messages,
}: CardContentProps) {
  // Smart date formatting utility
  const formatDateValue = (value: unknown, fieldType?: string): string => {
    if (fieldType === 'DATE' || fieldType === 'DATETIME') {
      try {
        const dateStr = String(value);
        const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);

        if (isToday(date)) return '📅 Today';
        if (isTomorrow(date)) return '📅 Tomorrow';
        if (isYesterday(date)) return '📅 Yesterday';

        return `📅 ${format(date, 'MMM d, yyyy')}`;
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // Get priority field for color coding
  const priorityField = config.subLineFields?.find(
    (fieldName: string) => fieldName.toLowerCase().includes('priority') || fieldName.toLowerCase().includes('quadrant'),
  );
  const priorityValue = priorityField ? (record.data || record.record)?.[priorityField] : null;

  // Priority configuration
  const getPriorityConfig = (priority: string | null) => {
    const priorityStr = String(priority || '').toLowerCase();

    // Matrix quadrant values (from spec example)
    if (priorityStr.includes('q1') || (priorityStr.includes('important') && priorityStr.includes('urgent'))) {
      return {
        badge: 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800',
        border: 'border-l-red-400 dark:border-l-red-600',
        icon: '⚠️',
        label: 'Urgent & Important',
      };
    }
    if (priorityStr.includes('q2') || priorityStr.includes('growth')) {
      return {
        badge:
          'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950 dark:text-green-300 dark:ring-green-800',
        border: 'border-l-green-400 dark:border-l-green-600',
        icon: '🌱',
        label: 'Important',
      };
    }
    if (priorityStr.includes('q3')) {
      return {
        badge:
          'bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-800',
        border: 'border-l-orange-400 dark:border-l-orange-600',
        icon: '⏰',
        label: 'Urgent',
      };
    }
    if (priorityStr.includes('q4') || priorityStr.includes('idea')) {
      return {
        badge: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
        border: 'border-l-gray-300 dark:border-l-gray-600',
        icon: '💡',
        label: 'Idea',
      };
    }

    // Standard priority values
    if (priorityStr === 'high') {
      return {
        badge: 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800',
        border: 'border-l-red-400 dark:border-l-red-600',
        icon: '⚠️',
        label: 'High',
      };
    }
    if (priorityStr === 'medium') {
      return {
        badge:
          'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800',
        border: 'border-l-amber-400 dark:border-l-amber-600',
        icon: '●',
        label: 'Medium',
      };
    }
    if (priorityStr === 'low') {
      return {
        badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800',
        border: 'border-l-blue-400 dark:border-l-blue-600',
        icon: '○',
        label: 'Low',
      };
    }

    return null;
  };

  const priorityConfig = priorityValue ? getPriorityConfig(String(priorityValue)) : null;

  return (
    <>
      {/* Priority border indicator */}
      {priorityConfig && <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${priorityConfig.border}`} />}

      {/* Title */}
      <div className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-3 line-clamp-2 leading-snug">
        {titleField ? (
          <FieldRenderer
            field={titleField}
            value={titleValue}
            mode="display"
            table={table}
            currentUser={currentUser}
            workspaceUsers={workspaceUsers}
            messages={messages}
          />
        ) : (
          <span>{titleValue || <span className="text-gray-400 dark:text-gray-500 italic">(No title)</span>}</span>
        )}
      </div>

      {/* Priority badge and metadata */}
      {priorityConfig && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${priorityConfig.badge}`}
          >
            <span aria-hidden="true">{priorityConfig.icon}</span>
            <span>{priorityConfig.label}</span>
          </span>
        </div>
      )}

      {/* Subline Fields */}
      {config.subLineFields && config.subLineFields.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {config.subLineFields.map((fieldName: string) => {
            const field = getFieldConfig(fieldName);
            if (!field) return null;

            // Skip priority field if already shown in badge
            if (fieldName === priorityField) return null;

            const value = (record.data || record.record)[fieldName];
            if (value === null || value === undefined || value === '') {
              return null;
            }

            return (
              <div key={fieldName} className="inline-flex items-center">
                <FieldRenderer
                  field={field}
                  value={value}
                  mode="display"
                  table={table}
                  currentUser={currentUser}
                  workspaceUsers={workspaceUsers}
                  messages={messages}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Tail Fields */}
      {config.tailFields && config.tailFields.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
          {config.tailFields.map((fieldName: string) => {
            const field = getFieldConfig(fieldName);
            if (!field) return null;

            const value = (record.data || record.record)[fieldName];

            // Enhanced empty state handling
            const displayValue =
              value === null || value === undefined || value === '' ? (
                <span className="text-gray-400 dark:text-gray-500">—</span>
              ) : field.type === 'DATE' || field.type === 'DATETIME' ? (
                formatDateValue(value, field.type)
              ) : (
                <FieldRenderer
                  field={field}
                  value={value}
                  mode="display"
                  table={table}
                  currentUser={currentUser}
                  workspaceUsers={workspaceUsers}
                  messages={messages}
                />
              );

            return (
              <div key={fieldName} className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">{field.label}:</span>
                {displayValue}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
