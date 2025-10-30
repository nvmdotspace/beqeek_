/**
 * RichTextField Component
 *
 * Renders RICH_TEXT field type using Quill.js editor
 */

import { useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import type { FieldRendererProps } from './field-renderer-props.js';
import { FieldWrapper } from '../common/field-wrapper.js';
import { validateFieldValue } from '../../utils/field-validation.js';

/**
 * Quill editor modules configuration
 */
const DEFAULT_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

/**
 * Quill editor formats configuration
 */
const DEFAULT_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'color',
  'background',
  'align',
  'link',
  'image',
];

export function RichTextField(props: FieldRendererProps) {
  const { field, value, onChange, mode, disabled = false, error, className } = props;

  const stringValue = (value as string) ?? '';

  const handleChange = useCallback(
    (content: string) => {
      // Quill returns '<p><br></p>' for empty content
      const isEmpty = content === '<p><br></p>' || content.trim() === '';
      const newValue = isEmpty ? '' : content;

      // Validate
      const validationError = validateFieldValue(newValue, field);
      if (validationError) {
        console.warn(`Validation error for ${field.name}:`, validationError);
      }

      onChange?.(newValue);
    },
    [onChange, field]
  );

  // Memoize modules and formats to prevent re-renders
  const modules = useMemo(() => DEFAULT_MODULES, []);
  const formats = useMemo(() => DEFAULT_FORMATS, []);

  // Display mode - render HTML safely
  if (mode === 'display') {
    if (!stringValue) {
      return (
        <span className="text-gray-400 italic">
          {props.messages?.emptyValue || '—'}
        </span>
      );
    }

    // Render rich text content with Quill's default styling
    return (
      <div className="ql-editor" style={{ padding: 0 }}>
        <div dangerouslySetInnerHTML={{ __html: stringValue }} />
      </div>
    );
  }

  // Edit mode with Quill editor
  const fieldId = `field-${field.name}`;

  const editorClasses = `
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className || ''}
  `.trim();

  return (
    <FieldWrapper
      fieldId={fieldId}
      label={field.label}
      required={field.required}
      error={error}
    >
      <div className={editorClasses}>
        <ReactQuill
          theme="snow"
          value={stringValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          readOnly={disabled}
          placeholder={field.placeholder || 'Enter rich text content...'}
          style={{
            borderRadius: '0.5rem',
            backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
          }}
        />
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-2">{field.helpText}</p>
      )}
    </FieldWrapper>
  );
}
