/**
 * HeadColumnLayout Component
 *
 * Card-based list layout with title, subline, and tail fields
 * Mobile-optimized design with Kanban-inspired visual consistency
 */

import { Fragment, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { LayoutProps } from './record-list-props.js';
import type { TableRecord } from '../../types/record.js';
import type { FieldConfig } from '../../types/field.js';
import type { RecordListConfig } from '../../types/config.js';
import type { Table } from '../../types/common.js';
import type { CurrentUser, WorkspaceUser } from '../../types/responses.js';
import { FieldListRenderer } from '../fields/field-list-renderer.js';
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
    (recordId: string, event: ChangeEvent<HTMLInputElement>) => {
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
                  onChange={(e) => handleSelectionToggle(record.id, e)}
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
  config: RecordListConfig;
  titleField?: FieldConfig;
  titleValue: unknown;
  getFieldConfig: (name: string) => FieldConfig | undefined;
  table: Table;
  currentUser?: CurrentUser;
  workspaceUsers?: WorkspaceUser[];
  messages?: LayoutProps['messages'];
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
  const hasSublineFields = config.subLineFields && config.subLineFields.length > 0;
  const hasTailFields = config.tailFields && config.tailFields.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Title Section */}
      <div className="space-y-1">
        <div className="text-sm font-medium leading-tight">
          {titleField ? (
            <FieldListRenderer
              field={titleField}
              value={titleValue}
              table={table}
              currentUser={currentUser}
              workspaceUsers={workspaceUsers}
              messages={messages}
            />
          ) : (
            <span>
              {titleValue ? String(titleValue) : <span className="text-muted-foreground italic">(No title)</span>}
            </span>
          )}
        </div>
      </div>

      {/* Subline Fields Section (Status, Tags, Badges) */}
      {hasSublineFields && (
        <>
          <div className="border-t border-border/30 pt-2">
            <div className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-2">
              {config.subLineFields!.map((fieldName: string) => {
                const field = getFieldConfig(fieldName);
                if (!field) return null;

                const value = (record.data || record.record)[fieldName];
                if (value === null || value === undefined || value === '') {
                  return null;
                }

                return (
                  <Fragment key={fieldName}>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap leading-5">
                      {field.label}:
                    </span>
                    <div className="min-w-0 leading-5">
                      <FieldListRenderer
                        field={field}
                        value={value}
                        table={table}
                        currentUser={currentUser}
                        workspaceUsers={workspaceUsers}
                        messages={messages}
                        disableTruncate={true}
                      />
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tail Fields Section (Metadata) */}
      {hasTailFields && (
        <>
          <div className="border-t border-border/20 pt-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {config.tailFields!.map((fieldName: string) => {
                const field = getFieldConfig(fieldName);
                if (!field) return null;

                const value = (record.data || record.record)[fieldName];

                return (
                  <div key={fieldName} className="flex items-center gap-1.5">
                    <span className="font-medium">{field.label}:</span>
                    {value === null || value === undefined || value === '' ? (
                      <span className="text-muted-foreground/50">—</span>
                    ) : (
                      <FieldListRenderer
                        field={field}
                        value={value}
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
          </div>
        </>
      )}
    </div>
  );
}
