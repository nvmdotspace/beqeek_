/**
 * useInlineEdit Hook
 *
 * Manages inline editing state for record detail views
 */

import { useState, useCallback } from 'react';
import type { TableRecord } from '../types/record.js';
import type { InlineEditState } from '../components/record-detail/record-detail-props.js';
import { validateFieldValue } from '../utils/field-validation.js';
import type { FieldConfig } from '../types/field.js';

export interface UseInlineEditOptions {
  /** Initial record data */
  record: TableRecord;

  /** Field configurations for validation */
  fields: FieldConfig[];

  /** Callback when save is triggered */
  onSave?: (recordId: string, updates: Record<string, unknown>) => Promise<void>;
}

export interface UseInlineEditReturn extends InlineEditState {
  /** Start editing a field */
  startEditing: (fieldName: string) => void;

  /** Update a field value */
  updateField: (fieldName: string, value: unknown) => void;

  /** Save changes */
  save: () => Promise<void>;

  /** Cancel editing */
  cancel: () => void;

  /** Check if a specific field is being edited */
  isFieldEditing: (fieldName: string) => boolean;

  /** Get current value for a field (edited or original) */
  getFieldValue: (fieldName: string) => unknown;

  /** Get error for a field */
  getFieldError: (fieldName: string) => string | undefined;
}

/**
 * Hook for managing inline editing state
 */
export function useInlineEdit(options: UseInlineEditOptions): UseInlineEditReturn {
  const { record, fields, onSave } = options;

  const [state, setState] = useState<InlineEditState>({
    isEditing: false,
    editingField: null,
    editedValues: {},
    errors: {},
    isSaving: false,
  });

  // Start editing a field
  const startEditing = useCallback((fieldName: string) => {
    const recordData = record.data || record.record;
    setState((prev) => ({
      ...prev,
      isEditing: true,
      editingField: fieldName,
      editedValues: {
        ...prev.editedValues,
        [fieldName]: recordData[fieldName],
      },
      errors: {
        ...prev.errors,
        [fieldName]: '',
      },
    }));
  }, [record]);

  // Update a field value
  const updateField = useCallback((fieldName: string, value: unknown) => {
    // Find field config for validation
    const fieldConfig = fields.find((f) => f.name === fieldName);

    // Validate the value
    let error = '';
    if (fieldConfig) {
      const validationResult = validateFieldValue(value, fieldConfig);
      error = validationResult.valid ? '' : (validationResult.error || '');
    }

    setState((prev) => ({
      ...prev,
      editedValues: {
        ...prev.editedValues,
        [fieldName]: value,
      },
      errors: {
        ...prev.errors,
        [fieldName]: error,
      },
    }));
  }, [fields]);

  // Save changes
  const save = useCallback(async () => {
    // Check for validation errors
    const hasErrors = Object.values(state.errors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    // Check if there are changes
    if (Object.keys(state.editedValues).length === 0) {
      setState((prev) => ({
        ...prev,
        isEditing: false,
        editingField: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      if (onSave) {
        await onSave(record.id, state.editedValues);
      }

      // Success - reset state
      setState({
        isEditing: false,
        editingField: null,
        editedValues: {},
        errors: {},
        isSaving: false,
      });
    } catch (error) {
      // Keep editing state on error
      setState((prev) => ({
        ...prev,
        isSaving: false,
      }));
      throw error;
    }
  }, [state.errors, state.editedValues, record.id, onSave]);

  // Cancel editing
  const cancel = useCallback(() => {
    setState({
      isEditing: false,
      editingField: null,
      editedValues: {},
      errors: {},
      isSaving: false,
    });
  }, []);

  // Check if a specific field is being edited
  const isFieldEditing = useCallback(
    (fieldName: string) => {
      return state.isEditing && state.editingField === fieldName;
    },
    [state.isEditing, state.editingField]
  );

  // Get current value for a field (edited or original)
  const getFieldValue = useCallback(
    (fieldName: string) => {
      if (fieldName in state.editedValues) {
        return state.editedValues[fieldName];
      }
      const recordData = record.data || record.record;
      return recordData[fieldName];
    },
    [state.editedValues, record]
  );

  // Get error for a field
  const getFieldError = useCallback(
    (fieldName: string) => {
      return state.errors[fieldName];
    },
    [state.errors]
  );

  return {
    ...state,
    startEditing,
    updateField,
    save,
    cancel,
    isFieldEditing,
    getFieldValue,
    getFieldError,
  };
}
