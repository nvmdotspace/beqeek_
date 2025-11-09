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
  type FieldType,
} from '../../types/field.js';

const BASIC_TEXT_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
]);
const NUMBER_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([FIELD_TYPE_INTEGER, FIELD_TYPE_NUMERIC]);
const TIME_COMPONENT_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
]);
const SELECT_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
]);
const REFERENCE_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
]);
const USER_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
]);

/**
 * Main field renderer that routes to the appropriate component based on field type
 */
export function FieldRenderer(props: FieldRendererProps) {
  const { field } = props;

  // Text fields
  if (BASIC_TEXT_TYPES.has(field.type)) {
    return <TextField {...props} />;
  }

  if (field.type === FIELD_TYPE_TEXT) {
    return <TextareaField {...props} />;
  }

  if (field.type === FIELD_TYPE_RICH_TEXT) {
    return <RichTextField {...props} />;
  }

  // Number fields
  if (NUMBER_TYPES.has(field.type)) {
    return <NumberField {...props} />;
  }

  // Time component fields (simple number inputs)
  if (TIME_COMPONENT_TYPES.has(field.type)) {
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
  if (SELECT_TYPES.has(field.type)) {
    return <SelectField {...props} />;
  }

  if (field.type === FIELD_TYPE_CHECKBOX_YES_NO) {
    return <CheckboxField {...props} />;
  }

  // Reference fields
  if (REFERENCE_TYPES.has(field.type)) {
    return <ReferenceField {...props} />;
  }

  // User fields
  if (USER_TYPES.has(field.type)) {
    return <UserField {...props} />;
  }

  // Fallback for unknown types
  return <div className="text-muted-foreground italic">Unsupported field type: {field.type}</div>;
}
