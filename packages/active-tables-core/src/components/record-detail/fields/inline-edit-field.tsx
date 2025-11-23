/**
 * InlineEditField - Inline editing wrapper with save/cancel buttons
 * @module active-tables-core/components/record-detail/fields
 */

import React, { useState, useEffect } from 'react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Button } from '@workspace/ui/components/button';
import { Check, X } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { InlineEditFieldProps } from '../../../types/record-detail.js';
import { validateFieldValue } from '../../../utils/field-validation.js';

// Import field input components (to be created)
import { TextFieldInput } from './field-inputs/text-field-input.js';
import { NumberFieldInput } from './field-inputs/number-field-input.js';
import { DateFieldInput } from './field-inputs/date-field-input.js';
import { SelectFieldInput } from './field-inputs/select-field-input.js';
import { CheckboxFieldInput } from './field-inputs/checkbox-field-input.js';

import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
} from '@workspace/beqeek-shared/constants';

/**
 * Inline edit field component
 * Shows appropriate input with save/cancel buttons
 */
export function InlineEditField({
  field,
  value,
  onSave,
  onCancel,
  autoFocus = false,
  validateOnChange = false,
  className,
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

  // Render appropriate input based on field type
  const renderInput = () => {
    const commonProps = {
      value: currentValue,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      autoFocus,
      disabled: isSaving,
      'aria-invalid': error != null,
      'aria-describedby': error ? 'inline-edit-error' : undefined,
    };

    switch (field.type) {
      case FIELD_TYPE_SHORT_TEXT:
      case FIELD_TYPE_TEXT:
      case FIELD_TYPE_EMAIL:
      case FIELD_TYPE_URL:
        return <TextFieldInput {...commonProps} field={field} />;

      case FIELD_TYPE_INTEGER:
      case FIELD_TYPE_NUMERIC:
        return <NumberFieldInput {...commonProps} field={field} />;

      case FIELD_TYPE_DATE:
      case FIELD_TYPE_DATETIME:
      case FIELD_TYPE_TIME:
        return <DateFieldInput {...commonProps} field={field} />;

      case FIELD_TYPE_CHECKBOX_YES_NO:
        return <CheckboxFieldInput {...commonProps} field={field} />;

      case FIELD_TYPE_SELECT_ONE:
      case FIELD_TYPE_SELECT_LIST:
        return <SelectFieldInput {...commonProps} field={field} />;

      default:
        // Fallback to text input for unsupported types
        return <TextFieldInput {...commonProps} field={field} />;
    }
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
