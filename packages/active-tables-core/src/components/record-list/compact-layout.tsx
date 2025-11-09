/**
 * CompactLayout Component
 *
 * Ultra-compact layout for high-density scenarios like dashboards, sidebars
 * Shows minimal information with small cards and badges
 */

import { useCallback } from 'react';
import type { LayoutProps } from './record-list-props.js';
import type { TableRecord } from '../../types/record.js';
import { FieldListRenderer } from '../fields/field-list-renderer.js';
import { useRecordDecryption } from '../../hooks/use-encryption.js';

export function CompactLayout(props: LayoutProps) {
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

  // Get display fields (prioritize title field, then limit to 2-3 fields)
  const displayFields = config.titleField
    ? [config.titleField, ...(config.subLineFields?.slice(0, 2) || [])]
    : config.displayFields?.slice(0, 3) || [];

  return (
    <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
      {records.map((record) => {
        const decryptedRecord = decryptRecord(record);
        const isSelected = selectedIds.includes(record.id);

        // Get primary field (title or first field)
        const primaryField = config.titleField || displayFields[0];
        const primaryFieldConfig = primaryField ? getFieldConfig(primaryField) : undefined;
        const primaryValue = primaryField ? decryptedRecord.data![primaryField] : undefined;

        // Get secondary fields (remaining fields)
        const secondaryFields = displayFields.filter((f) => f !== primaryField).slice(0, 2);

        return (
          <div
            key={record.id}
            role="button"
            tabIndex={0}
            aria-label={`${primaryValue || 'Record'}, ID: ${record.id}`}
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
              rounded-md border border-border
              p-3
              cursor-pointer
              transition-all duration-150
              hover:shadow-sm hover:border-accent-foreground/20
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
              data-[state=selected]:bg-accent data-[state=selected]:border-accent-foreground/20
              text-xs
            `}
          >
            {/* Selection indicator */}
            {onSelectionChange && (
              <div className="absolute top-2 right-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSelection = isSelected
                      ? selectedIds.filter((id) => id !== record.id)
                      : [...selectedIds, record.id];
                    onSelectionChange(newSelection);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-3 w-3 rounded border-input text-primary focus:ring-1 focus:ring-ring"
                />
              </div>
            )}

            <div className="space-y-2 pr-6">
              {/* Primary field (title) */}
              <div className="font-medium leading-tight truncate">
                {primaryFieldConfig ? (
                  <FieldListRenderer
                    field={primaryFieldConfig}
                    value={primaryValue}
                    table={table}
                    currentUser={currentUser}
                    workspaceUsers={workspaceUsers}
                    messages={messages}
                  />
                ) : (
                  <span className="text-muted-foreground italic">
                    {primaryValue ? String(primaryValue) : 'No data'}
                  </span>
                )}
              </div>

              {/* Secondary fields as badges/pills */}
              {secondaryFields.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {secondaryFields.map((fieldName) => {
                    const field = getFieldConfig(fieldName);
                    if (!field) return null;

                    const value = decryptedRecord.data![fieldName];
                    if (value === null || value === undefined || value === '') {
                      return null;
                    }

                    return (
                      <div
                        key={fieldName}
                        className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium"
                      >
                        <FieldListRenderer
                          field={field}
                          value={value}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
