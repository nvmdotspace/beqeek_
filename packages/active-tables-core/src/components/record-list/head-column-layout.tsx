/**
 * HeadColumnLayout Component
 *
 * Card-based list layout with title, subline, and tail fields
 * Mobile-optimized design
 */

import { useCallback } from 'react';
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
            onClick={() => handleCardClick(record)}
            className={`
              bg-white border rounded-lg p-4 shadow-sm
              hover:shadow-md transition-all cursor-pointer
              ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
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
  return (
    <>
      {/* Title */}
      <div className="font-semibold text-gray-900 text-lg mb-2">
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
          <span>{titleValue || record.id}</span>
        )}
      </div>

      {/* Subline Fields */}
      {config.subLineFields && config.subLineFields.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {config.subLineFields.map((fieldName: string) => {
            const field = getFieldConfig(fieldName);
            if (!field) return null;

            const value = (record.data || record.record)[fieldName];
            if (value === null || value === undefined || value === '') return null;

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
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-3">
          {config.tailFields.map((fieldName: string) => {
            const field = getFieldConfig(fieldName);
            if (!field) return null;

            const value = (record.data || record.record)[fieldName];
            if (value === null || value === undefined || value === '') return null;

            return (
              <div key={fieldName} className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">{field.label}:</span>
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
    </>
  );
}
