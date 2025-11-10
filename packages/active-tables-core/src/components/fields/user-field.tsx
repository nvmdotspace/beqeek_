/**
 * UserField Component
 *
 * Renders SELECT_ONE_WORKSPACE_USER and SELECT_LIST_WORKSPACE_USER field types
 *
 * Week 2: Enhanced with UserSelect for better UX
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { FIELD_TYPES } from '../../types/field.js';
import { validateFieldValue } from '../../utils/field-validation.js';
import { UserSelect } from './user-select.js';

export function UserField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className, workspaceUsers = [] } = props;

  const isMultiple = field.type === FIELD_TYPES.SELECT_LIST_WORKSPACE_USER;

  // Normalize value
  const normalizedValue = isMultiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ?? '');

  // Handle change for UserSelect (Week 2)
  const handleUserSelectChange = useCallback(
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

  // Get user label
  const getUserLabel = useCallback(
    (userId: string) => {
      const user = workspaceUsers.find((u: { id: string }) => u.id === userId);
      if (!user) return userId;

      const labelField = field.referenceLabelField || 'name';
      return String(user[labelField as keyof typeof user] || user.name || user.id);
    },
    [workspaceUsers, field.referenceLabelField],
  );

  // Display mode
  if (mode === 'display') {
    if (isMultiple) {
      const selectedIds = normalizedValue as string[];
      if (selectedIds.length === 0) {
        return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
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
      return <span className="text-muted-foreground italic">{props.messages?.emptyValue || '—'}</span>;
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
        {getUserLabel(selectedId)}
      </span>
    );
  }

  // Edit mode
  const fieldId = `field-${field.name}`;

  // Week 2: Use UserSelect for better UX (always use new component)
  // Map workspaceUsers to expected format
  // Note: WorkspaceUser from responses.ts already has correct 'name' field

  const mappedUsers = workspaceUsers.map((user: any) => ({
    id: user.id,
    name: user.name || '', // Use 'name' directly (already mapped from API)
    email: user.email || '',
    avatar: user.avatar || user.photoUrl || '',
  }));

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <UserSelect
        value={normalizedValue as string | string[]}
        onChange={handleUserSelectChange}
        multiple={isMultiple}
        placeholder={field.placeholder || props.messages?.selectPlaceholder || 'Select a user'}
        disabled={disabled}
        users={mappedUsers}
        loading={false}
        error={error}
      />
    </FieldWrapper>
  );
}
