/**
 * HeadColumnLayout Component
 *
 * Card-based list layout with title, subline, and tail fields
 * Mobile-optimized design with Kanban-inspired visual consistency
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
    <div className={`space-y-3 ${className}`}>
      {records.map((record) => {
        const decryptedRecord = decryptRecord(record);
        const isSelected = selectedIds.includes(record.id);

        // Get field values
        const titleField = config.titleField ? getFieldConfig(config.titleField) : undefined;
        const titleValue = config.titleField ? decryptedRecord.data![config.titleField] : undefined;

        return (
          <div
            key={record.id}
            role="button"
            tabIndex={0}
            aria-label={`${titleValue || 'Record'}, ID: ${record.id}`}
            data-state={isSelected ? 'selected' : undefined}
            onClick={() => handleCardClick(record)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(record);
              }
            }}
            className={`
              group relative
              bg-card text-card-foreground
              rounded-lg border border-border
              p-4
              cursor-pointer
              transition-colors
              hover:bg-accent/50
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
              data-[state=selected]:bg-accent data-[state=selected]:border-accent-foreground/20
            `}
          >
            {/* Selection checkbox */}
            {onSelectionChange && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleSelectionToggle(record.id, e as any)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-1 focus:ring-ring"
                />
                <div className="flex-1 min-w-0">
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
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="text-sm font-medium leading-none">
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
          <span>{titleValue || <span className="text-muted-foreground italic">(No title)</span>}</span>
        )}
      </div>

      {/* Subline Fields (Status, Tags, Badges) */}
      {config.subLineFields && config.subLineFields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {config.subLineFields.map((fieldName: string) => {
            const field = getFieldConfig(fieldName);
            if (!field) return null;

            const value = (record.data || record.record)[fieldName];
            if (value === null || value === undefined || value === '') {
              return null;
            }

            return (
              <div key={fieldName} className="inline-flex">
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

      {/* Tail Fields (Metadata) */}
      {config.tailFields && config.tailFields.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {config.tailFields.map((fieldName: string) => {
            const field = getFieldConfig(fieldName);
            if (!field) return null;

            const value = (record.data || record.record)[fieldName];

            return (
              <div key={fieldName} className="flex items-center gap-1.5">
                <span className="font-medium">{field.label}:</span>
                {value === null || value === undefined || value === '' ? (
                  <span className="text-muted-foreground/50">—</span>
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
