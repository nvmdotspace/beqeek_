/**
 * ReferenceField Component
 *
 * Renders SELECT_ONE_RECORD and SELECT_LIST_RECORD field types
 * Note: This component requires parent app to provide record data
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export interface ReferenceRecord {
  id: string;
  [key: string]: unknown;
}

export interface ReferenceFieldProps extends FieldRendererProps {
  /** Referenced records data - provided by parent app */
  referenceRecords?: ReferenceRecord[];
  /** Loading state for reference records */
  loading?: boolean;
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
  } = props;

  const isMultiple = field.type === FIELD_TYPES.SELECT_LIST_RECORD;

  // Normalize value
  const normalizedValue = isMultiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ?? '');

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

  if (loading) {
    return (
      <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
        <div className="text-sm text-muted-foreground italic">{props.messages?.loading || 'Loading...'}</div>
      </FieldWrapper>
    );
  }

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
