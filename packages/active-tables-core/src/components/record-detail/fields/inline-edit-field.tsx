/**
 * InlineEditField - Inline editing wrapper with save/cancel buttons
 * Uses FieldRenderer for consistent field editing across the app
 * @module active-tables-core/components/record-detail/fields
 */

import React, { useState, useEffect } from 'react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Button } from '@workspace/ui/components/button';
import { Check, X } from 'lucide-react';
import type { InlineEditFieldProps } from '../../../types/record-detail.js';
import { validateFieldValue } from '../../../utils/field-validation.js';
import { FieldRenderer } from '../../fields/field-renderer.js';
import { FIELD_TYPE_TEXT } from '@workspace/beqeek-shared/constants';

/**
 * Inline edit field component
 * Shows appropriate input with save/cancel buttons
 * Uses FieldRenderer for consistent editing experience
 */
export function InlineEditField({
  field,
  value,
  onSave,
  onCancel,
  autoFocus = false,
  validateOnChange = false,
  className,
  // New props for FieldRenderer
  table,
  workspaceUsers,
  fetchRecords,
  initialRecords,
  referencedTableName,
}: InlineEditFieldProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset value if prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Handle value change
  const handleChange = (newValue: unknown) => {
    setCurrentValue(newValue);

    if (validateOnChange) {
      const validation = validateFieldValue(newValue, field);
      setError(validation.valid ? null : validation.error || null);
    }
  };

  // Handle save
  const handleSave = async () => {
    // Validate before save
    const validation = validateFieldValue(currentValue, field);
    if (!validation.valid) {
      setError(validation.error || 'Invalid value');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(currentValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setCurrentValue(value);
    setError(null);
    onCancel();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Allow Shift+Enter for multiline text
      if (field.type !== FIELD_TYPE_TEXT) {
        e.preventDefault();
        handleSave();
      }
    }
  };

  // Render input using FieldRenderer for consistent editing
  const renderInput = () => {
    // If no table provided, cannot use FieldRenderer properly
    if (!table) {
      return <div className="text-muted-foreground text-sm">Table configuration required for editing</div>;
    }

    return (
      <div onKeyDown={handleKeyDown}>
        <FieldRenderer
          field={field}
          value={currentValue}
          onChange={handleChange}
          mode="edit"
          disabled={isSaving}
          error={error || undefined}
          table={table}
          workspaceUsers={workspaceUsers}
          fetchRecords={fetchRecords}
          initialRecords={initialRecords}
          referencedTableName={referencedTableName || field.referencedTableName}
          hideLabel
        />
      </div>
    );
  };

  return (
    <Stack space="space-100" className={className} onKeyDown={handleKeyDown}>
      {/* Input Field */}
      {renderInput()}

      {/* Error Message */}
      {error && (
        <p id="inline-edit-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Action Buttons */}
      <Inline space="space-100">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || error != null}
          className="gap-1"
          aria-label="Save changes"
        >
          <Check className="h-4 w-4" />
          Save
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          className="gap-1"
          aria-label="Cancel editing"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </Inline>
    </Stack>
  );
}
