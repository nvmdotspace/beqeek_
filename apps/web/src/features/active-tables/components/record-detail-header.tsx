/**
 * RecordDetailHeader Component
 *
 * Displays the header section of a record detail view
 * including title and subline fields
 */

import type { FieldConfig, TableRecord } from '@workspace/active-tables-core';
import { RecordFieldDisplay } from './record-field-display';

export interface RecordDetailHeaderProps {
  /** Record data */
  record: TableRecord;

  /** Title field configuration */
  titleField: FieldConfig;

  /** Subline field configurations */
  subLineFields: FieldConfig[];

  /** Custom class name */
  className?: string;
}

/**
 * Record detail header with title and subline fields
 */
export function RecordDetailHeader({ record, titleField, subLineFields, className = '' }: RecordDetailHeaderProps) {
  const titleValue = record.record[titleField.name] ?? record.data?.[titleField.name];

  return (
    <div className={`space-y-4 pb-6 border-b ${className}`}>
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight">{formatTitleValue(titleValue)}</h1>

      {/* Subline fields */}
      {subLineFields.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {subLineFields.map((field) => {
            const value = record.record[field.name] ?? record.data?.[field.name];
            return <RecordFieldDisplay key={field.name} field={field} value={value} mode="inline" showLabel={false} />;
          })}
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {record.createdAt && <span>Created: {new Date(record.createdAt).toLocaleDateString()}</span>}
        {record.updatedAt && <span>Updated: {new Date(record.updatedAt).toLocaleDateString()}</span>}
        {record.createdBy && <span>By: {record.createdBy}</span>}
      </div>
    </div>
  );
}

/**
 * Format title value for display
 */
function formatTitleValue(value: unknown): string {
  if (!value) return '(Untitled)';
  return String(value);
}
