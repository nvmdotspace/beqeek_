/**
 * FieldRenderer Component
 *
 * Router component that renders the appropriate field component based on field type
 */

import { TextField } from './text-field.js';
import { TextareaField } from './textarea-field.js';
import { NumberField } from './number-field.js';
import { DateField } from './date-field.js';
import { DateTimeField } from './datetime-field.js';
import { TimeField } from './time-field.js';
import { SelectField } from './select-field.js';
import { CheckboxField } from './checkbox-field.js';
import { ReferenceField } from './reference-field.js';
import { UserField } from './user-field.js';
import { RichTextField } from './rich-text-field.js';
import type { FieldRendererProps } from './field-renderer-props.js';
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
} from '../../types/field.js';

/**
 * Main field renderer that routes to the appropriate component based on field type
 */
export function FieldRenderer(props: FieldRendererProps) {
  const { field } = props;

  // Text fields
  if ([FIELD_TYPE_SHORT_TEXT, FIELD_TYPE_EMAIL, FIELD_TYPE_URL].includes(field.type as any)) {
    return <TextField {...props} />;
  }

  if (field.type === FIELD_TYPE_TEXT) {
    return <TextareaField {...props} />;
  }

  if (field.type === FIELD_TYPE_RICH_TEXT) {
    return <RichTextField {...props} />;
  }

  // Number fields
  if ([FIELD_TYPE_INTEGER, FIELD_TYPE_NUMERIC].includes(field.type as any)) {
    return <NumberField {...props} />;
  }

  // Time component fields (simple number inputs)
  if (
    [FIELD_TYPE_YEAR, FIELD_TYPE_MONTH, FIELD_TYPE_DAY, FIELD_TYPE_HOUR, FIELD_TYPE_MINUTE, FIELD_TYPE_SECOND].includes(
      field.type as any,
    )
  ) {
    return <NumberField {...props} />;
  }

  // Date/Time fields
  if (field.type === FIELD_TYPE_DATE) {
    return <DateField {...props} />;
  }

  if (field.type === FIELD_TYPE_DATETIME) {
    return <DateTimeField {...props} />;
  }

  if (field.type === FIELD_TYPE_TIME) {
    return <TimeField {...props} />;
  }

  // Selection fields
  if (
    [FIELD_TYPE_SELECT_ONE, FIELD_TYPE_SELECT_LIST, FIELD_TYPE_CHECKBOX_ONE, FIELD_TYPE_CHECKBOX_LIST].includes(
      field.type as any,
    )
  ) {
    return <SelectField {...props} />;
  }

  if (field.type === FIELD_TYPE_CHECKBOX_YES_NO) {
    return <CheckboxField {...props} />;
  }

  // Reference fields
  if ([FIELD_TYPE_SELECT_ONE_RECORD, FIELD_TYPE_SELECT_LIST_RECORD].includes(field.type as any)) {
    return <ReferenceField {...props} />;
  }

  // User fields
  if ([FIELD_TYPE_SELECT_ONE_WORKSPACE_USER, FIELD_TYPE_SELECT_LIST_WORKSPACE_USER].includes(field.type as any)) {
    return <UserField {...props} />;
  }

  // Fallback for unknown types
  return <div className="text-gray-500 italic">Unsupported field type: {field.type}</div>;
}
