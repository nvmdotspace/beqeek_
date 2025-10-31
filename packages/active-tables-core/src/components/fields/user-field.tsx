/**
 * UserField Component
 *
 * Renders SELECT_ONE_WORKSPACE_USER and SELECT_LIST_WORKSPACE_USER field types
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';

export function UserField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className, workspaceUsers = [] } = props;

  const isMultiple = field.type === FIELD_TYPES.SELECT_LIST_WORKSPACE_USER;

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

  // Get user label
  const getUserLabel = useCallback(
    (userId: string) => {
      const user = workspaceUsers.find((u: { id: string }) => u.id === userId);
      if (!user) return userId;

      const labelField = field.referenceLabelField || 'name';
      return String(user[labelField as keyof typeof user] || user.name || user.email || user.id);
    },
    [workspaceUsers, field.referenceLabelField],
  );

  // Display mode
  if (mode === 'display') {
    if (isMultiple) {
      const selectedIds = normalizedValue as string[];
      if (selectedIds.length === 0) {
        return <span className="text-gray-400 italic">{props.messages?.emptyValue || '—'}</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((userId) => (
            <span
              key={userId}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
            >
              {getUserLabel(userId)}
            </span>
          ))}
        </div>
      );
    }

    // Single select display
    const selectedId = normalizedValue as string;
    if (!selectedId) {
      return <span className="text-gray-400 italic">{props.messages?.emptyValue || '—'}</span>;
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
        {getUserLabel(selectedId)}
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
        size={isMultiple ? Math.min(workspaceUsers.length + 1, 6) : undefined}
        className={selectClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      >
        {!isMultiple && (
          <option value="">{field.placeholder || props.messages?.selectPlaceholder || 'Select a user'}</option>
        )}
        {workspaceUsers.map((user: { id: string; fullName?: string; email?: string }) => (
          <option key={user.id} value={user.id}>
            {user.fullName || user.email}
          </option>
        ))}
      </select>
      {isMultiple && (
        <p className="text-xs text-gray-500 mt-1">
          {props.messages?.multiSelectHint || 'Hold Ctrl/Cmd to select multiple users'}
        </p>
      )}
    </FieldWrapper>
  );
}
