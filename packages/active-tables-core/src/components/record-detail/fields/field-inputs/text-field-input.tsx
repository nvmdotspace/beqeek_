/**
 * TextFieldInput - Input component for text-based fields
 * @module active-tables-core/components/record-detail/fields/field-inputs
 */

import React, { useRef, useEffect } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import type { FieldConfig } from '../../../../types/field.js';
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_TEXT,
} from '@workspace/beqeek-shared/constants';

interface TextFieldInputProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  field: FieldConfig;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/**
 * Text field input component
 * Renders Input for SHORT_TEXT, EMAIL, URL
 * Renders auto-resizing Textarea for TEXT
 */
export function TextFieldInput({
  value,
  onChange,
  onKeyDown,
  autoFocus,
  disabled,
  field,
  ...ariaProps
}: TextFieldInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stringValue = value != null ? String(value) : '';

  // Auto-resize textarea
  useEffect(() => {
    if (field.type === FIELD_TYPE_TEXT && textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight (content height)
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [stringValue, field.type]);

  // Determine input type based on field type
  const getInputType = () => {
    switch (field.type) {
      case FIELD_TYPE_EMAIL:
        return 'email';
      case FIELD_TYPE_URL:
        return 'url';
      case FIELD_TYPE_SHORT_TEXT:
      default:
        return 'text';
    }
  };

  // Render textarea for TEXT field type
  if (field.type === FIELD_TYPE_TEXT) {
    return (
      <Textarea
        ref={textareaRef}
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={field.placeholder}
        className="min-h-[80px] resize-none"
        {...ariaProps}
      />
    );
  }

  // Render input for other text field types
  return (
    <Input
      type={getInputType()}
      value={stringValue}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      disabled={disabled}
      placeholder={field.placeholder}
      {...ariaProps}
    />
  );
}
