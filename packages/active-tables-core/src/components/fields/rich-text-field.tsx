/**
 * RichTextField Component
 *
 * Renders RICH_TEXT field type using Lexical editor
 */

import { useCallback } from 'react';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';
import { LexicalEditor } from './lexical/lexical-editor.js';
// CSS should be imported by the consumer: import '@workspace/active-tables-core/lexical-styles.css';

export function RichTextField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const stringValue = (value as string) ?? '';

  const handleChange = useCallback(
    (content: string) => {
      // Lexical returns '<p></p>' or empty string for empty content
      const isEmpty = content === '<p></p>' || content === '<p><br></p>' || content.trim() === '';
      const newValue = isEmpty ? '' : content;

      // Validate
      const validationError = validateFieldValue(newValue, field);
      if (validationError) {
        console.warn(`Validation error for ${field.name}:`, validationError);
      }

      onChange?.(newValue);
    },
    [onChange, field],
  );

  // Display mode - render HTML safely
  if (mode === 'display') {
    if (!stringValue) {
      return <span className="text-gray-400 italic">{props.messages?.emptyValue || '—'}</span>;
    }

    // Render rich text content with Lexical styling
    return (
      <div className="lexical-display-content">
        <div dangerouslySetInnerHTML={{ __html: stringValue }} />
      </div>
    );
  }

  // Edit mode with Lexical editor
  const fieldId = `field-${field.name}`;

  return (
    <FieldWrapper fieldId={fieldId} label={field.label} required={field.required} error={error}>
      <LexicalEditor
        value={stringValue}
        onChange={handleChange}
        placeholder={field.placeholder || 'Enter rich text content...'}
        disabled={disabled}
        className={className}
      />
      {field.helpText && <p className="text-xs text-gray-500 mt-2">{field.helpText}</p>}
    </FieldWrapper>
  );
}
