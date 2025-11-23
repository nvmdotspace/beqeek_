/**
 * FieldDisplay - Read-only field value renderer
 * Dispatches to appropriate field renderer based on field type
 * @module active-tables-core/components/record-detail/fields
 *
 * Performance: Wrapped with React.memo to prevent unnecessary re-renders
 * when parent components update but field props remain unchanged.
 */

import React, { memo } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldDisplayProps } from '../../../types/record-detail.js';
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
} from '@workspace/beqeek-shared/constants';

// Import field renderers
import { TextFieldDisplay } from './field-renderers/text-field-display.js';
import { RichTextFieldDisplay } from './field-renderers/rich-text-field-display.js';
import { EmailFieldDisplay } from './field-renderers/email-field-display.js';
import { UrlFieldDisplay } from './field-renderers/url-field-display.js';
import { NumberFieldDisplay } from './field-renderers/number-field-display.js';
import { DateFieldDisplay } from './field-renderers/date-field-display.js';
import { DateTimeFieldDisplay } from './field-renderers/datetime-field-display.js';
import { TimeFieldDisplay } from './field-renderers/time-field-display.js';
import { TimeComponentFieldDisplay } from './field-renderers/time-component-field-display.js';
import { CheckboxFieldDisplay } from './field-renderers/checkbox-field-display.js';
import { SelectFieldDisplay } from './field-renderers/select-field-display.js';
import { MultiSelectFieldDisplay } from './field-renderers/multi-select-field-display.js';
import { ReferenceFieldDisplay } from './field-renderers/reference-field-display.js';
import { UserFieldDisplay } from './field-renderers/user-field-display.js';

/**
 * Main field display component
 * Renders field value in read-only mode with appropriate formatting
 *
 * Memoized to prevent re-renders when:
 * - Parent re-renders but field/value unchanged
 * - Sibling fields update in the same form
 */
function FieldDisplayInner({
  field,
  value,
  referenceRecords,
  userRecords,
  onDoubleClick,
  editable = false,
  loading = false,
  error,
  className,
}: FieldDisplayProps) {
  // Loading state
  if (loading) {
    return (
      <div
        className={cn('h-5 bg-muted animate-pulse rounded', className)}
        aria-busy="true"
        aria-label="Loading field value"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('text-sm text-destructive', className)} role="alert" aria-label={`Error: ${error}`}>
        {error}
      </div>
    );
  }

  // Container with double-click handler
  const containerProps = {
    onDoubleClick: editable ? onDoubleClick : undefined,
    className: cn(
      'min-h-[1.25rem]',
      editable && 'cursor-pointer hover:bg-accent/50 rounded px-2 -mx-2 transition-colors',
      className,
    ),
    'data-editable': editable,
    'aria-readonly': !editable,
  };

  // Dispatch to appropriate renderer based on field type
  switch (field.type) {
    // Text fields
    case FIELD_TYPE_SHORT_TEXT:
    case FIELD_TYPE_TEXT:
      return (
        <div {...containerProps}>
          <TextFieldDisplay value={value} field={field} />
        </div>
      );

    case FIELD_TYPE_RICH_TEXT:
      return (
        <div {...containerProps}>
          <RichTextFieldDisplay value={value} />
        </div>
      );

    case FIELD_TYPE_EMAIL:
      return (
        <div {...containerProps}>
          <EmailFieldDisplay value={value} />
        </div>
      );

    case FIELD_TYPE_URL:
      return (
        <div {...containerProps}>
          <UrlFieldDisplay value={value} />
        </div>
      );

    // Number fields
    case FIELD_TYPE_INTEGER:
    case FIELD_TYPE_NUMERIC:
      return (
        <div {...containerProps}>
          <NumberFieldDisplay value={value} field={field} />
        </div>
      );

    // Date/Time fields
    case FIELD_TYPE_DATE:
      return (
        <div {...containerProps}>
          <DateFieldDisplay value={value} />
        </div>
      );

    case FIELD_TYPE_DATETIME:
      return (
        <div {...containerProps}>
          <DateTimeFieldDisplay value={value} />
        </div>
      );

    case FIELD_TYPE_TIME:
      return (
        <div {...containerProps}>
          <TimeFieldDisplay value={value} />
        </div>
      );

    // Time component fields
    case FIELD_TYPE_YEAR:
    case FIELD_TYPE_MONTH:
    case FIELD_TYPE_DAY:
    case FIELD_TYPE_HOUR:
    case FIELD_TYPE_MINUTE:
    case FIELD_TYPE_SECOND:
      return (
        <div {...containerProps}>
          <TimeComponentFieldDisplay value={value} componentType={field.type} />
        </div>
      );

    // Checkbox fields
    case FIELD_TYPE_CHECKBOX_YES_NO:
    case FIELD_TYPE_CHECKBOX_ONE:
      return (
        <div {...containerProps}>
          <CheckboxFieldDisplay value={value} field={field} />
        </div>
      );

    // Select fields
    case FIELD_TYPE_SELECT_ONE:
      return (
        <div {...containerProps}>
          <SelectFieldDisplay value={value} field={field} />
        </div>
      );

    case FIELD_TYPE_SELECT_LIST:
    case FIELD_TYPE_CHECKBOX_LIST:
      return (
        <div {...containerProps}>
          <MultiSelectFieldDisplay value={value} field={field} />
        </div>
      );

    // Reference record fields
    case FIELD_TYPE_SELECT_ONE_RECORD:
    case FIELD_TYPE_SELECT_LIST_RECORD:
    case FIELD_TYPE_FIRST_REFERENCE_RECORD:
      return (
        <div {...containerProps}>
          <ReferenceFieldDisplay value={value} field={field} referenceRecords={referenceRecords} />
        </div>
      );

    // User fields
    case FIELD_TYPE_SELECT_ONE_WORKSPACE_USER:
    case FIELD_TYPE_SELECT_LIST_WORKSPACE_USER:
      return (
        <div {...containerProps}>
          <UserFieldDisplay value={value} field={field} userRecords={userRecords} />
        </div>
      );

    // Unsupported field type
    default:
      return (
        <div {...containerProps}>
          <span className="text-sm text-muted-foreground">{value != null ? String(value) : '-'}</span>
        </div>
      );
  }
}

/**
 * Memoized FieldDisplay component
 * Only re-renders when props actually change (shallow comparison)
 */
export const FieldDisplay = memo(FieldDisplayInner);
