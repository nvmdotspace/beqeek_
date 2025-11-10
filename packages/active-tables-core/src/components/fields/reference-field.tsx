/**
 * ReferenceField Component
 *
 * Renders SELECT_ONE_RECORD and SELECT_LIST_RECORD field types
 * Note: This component requires parent app to provide record data or fetchRecords function
 *
 * Week 2: Enhanced with AsyncRecordSelect for better UX
 */

import { useCallback } from 'react';
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

  // Display mode
  if (mode === 'display') {
    if (isMultiple) {
      const selectedIds = normalizedValue as string[];
      if (selectedIds.length === 0) {
        return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
      }

      const selectedRecords = selectedIds
        .map((id) => referenceRecords.find((r) => r.id === id))
        .filter(Boolean) as ReferenceRecord[];

      if (selectedRecords.length === 0) {
        return <span className="text-muted-foreground">{selectedIds.join(', ')}</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {selectedRecords.map((record) => (
            <span
              key={record.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {getRecordLabel(record)}
            </span>
          ))}
        </div>
      );
    }

    // Single select display
    const selectedId = normalizedValue as string;
    if (!selectedId) {
      return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
    }

    const selectedRecord = referenceRecords.find((r) => r.id === selectedId);
    if (!selectedRecord) {
      return <span className="text-muted-foreground">{selectedId}</span>;
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        {getRecordLabel(selectedRecord)}
      </span>
    );
  }

  // Edit mode
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
