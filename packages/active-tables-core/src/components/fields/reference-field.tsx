/**
 * ReferenceField Component
 *
 * Renders SELECT_ONE_RECORD and SELECT_LIST_RECORD field types using shadcn/ui Badge
 * Note: This component requires parent app to provide record data or fetchRecords function
 *
 * Week 2: Enhanced with AsyncRecordSelect for better UX
 */

import { useCallback } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';
import { AsyncRecordSelect, type AsyncRecordSelectRecord } from './async-record-select.js';

export interface ReferenceRecord {
  id: string;
  [key: string]: unknown;
}

export interface ReferenceFieldProps extends FieldRendererProps {
  /** Referenced records data - provided by parent app (legacy mode) */
  referenceRecords?: ReferenceRecord[];
  /** Loading state for reference records */
  loading?: boolean;
  /** Function to fetch records asynchronously (new mode - Week 2) */
  fetchRecords?: (query: string, page: number) => Promise<{ records: AsyncRecordSelectRecord[]; hasMore: boolean }>;
  /** Referenced table name for display */
  referencedTableName?: string;
}

export function ReferenceField(props: ReferenceFieldProps) {
  const {
    field,
    value,
    onChange,
    mode,
    disabled = false,
    error,
    className,
    referenceRecords = [],
    loading = false,
    fetchRecords,
    referencedTableName,
    initialRecords,
  } = props;

  const isMultiple = field.type === FIELD_TYPES.SELECT_LIST_RECORD;

  // Normalize value
  const normalizedValue = isMultiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ?? '');

  // Handle change for AsyncRecordSelect (Week 2)
  const handleAsyncChange = useCallback(
    (newValue: string | string[]) => {
      const validationError = validateFieldValue(newValue, field);
      if (validationError) {
        console.warn(`Validation error for ${field.name}:`, validationError);
      }
      onChange?.(newValue);
    },
    [onChange, field],
  );

  // Handle change for legacy select (Week 1)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (isMultiple) {
        const selectedIds = Array.from(e.target.selectedOptions).map((option) => option.value);
        const validationError = validateFieldValue(selectedIds, field);
        if (validationError) {
          console.warn(`Validation error for ${field.name}:`, validationError);
        }
        onChange?.(selectedIds);
      } else {
        const newValue = e.target.value;
        const validationError = validateFieldValue(newValue, field);
        if (validationError) {
          console.warn(`Validation error for ${field.name}:`, validationError);
        }
        onChange?.(newValue);
      }
    },
    [onChange, field, isMultiple],
  );

  // Get label for a record
  const getRecordLabel = useCallback(
    (record: ReferenceRecord) => {
      const labelField = field.referenceLabelField || 'id';
      return String(record[labelField] || record.id);
    },
    [field.referenceLabelField],
  );

  // Edit mode only
  const fieldId = `field-${field.name}`;

  const selectClasses = `
    w-full px-3 py-2
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : ''}
    ${className || ''}
  `.trim();

  if (loading && !fetchRecords) {
    return (
      <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
        <div className="text-sm text-muted-foreground italic">{props.messages?.loading || 'Loading...'}</div>
      </FieldWrapper>
    );
  }

  // Week 2: Use AsyncRecordSelect if fetchRecords is provided
  if (fetchRecords) {
    return (
      <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
        <AsyncRecordSelect
          value={normalizedValue as string | string[]}
          onChange={handleAsyncChange}
          multiple={isMultiple}
          placeholder={field.placeholder || props.messages?.selectPlaceholder || 'Select a record'}
          disabled={disabled}
          labelFieldName={field.referenceLabelField || 'id'}
          fetchRecords={fetchRecords}
          tableName={referencedTableName || 'records'}
          error={error}
          initialRecords={initialRecords}
        />
      </FieldWrapper>
    );
  }

  // Week 1: Legacy mode with native select (fallback)
  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <select
        id={fieldId}
        name={field.name}
        value={normalizedValue as string | string[]}
        onChange={handleChange}
        disabled={disabled}
        required={field.required}
        multiple={isMultiple}
        size={isMultiple ? Math.min(referenceRecords.length + 1, 6) : undefined}
        className={selectClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      >
        {!isMultiple && (
          <option value="">{field.placeholder || props.messages?.selectPlaceholder || 'Select a record'}</option>
        )}
        {referenceRecords.map((record) => (
          <option key={record.id} value={record.id}>
            {getRecordLabel(record)}
          </option>
        ))}
      </select>
      {isMultiple && (
        <p className="text-xs text-muted-foreground mt-1">
          {props.messages?.multiSelectHint || 'Hold Ctrl/Cmd to select multiple records'}
        </p>
      )}
    </FieldWrapper>
  );
}
