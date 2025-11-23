/**
 * HeadDetailLayout - Mobile-friendly single-column record detail layout
 * @module active-tables-core/components/record-detail/layouts
 */

import React from 'react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Box } from '@workspace/ui/components/primitives/box';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { cn } from '@workspace/ui/lib/utils';
import type { HeadDetailLayoutProps } from '../../../types/record-detail.js';
import { FieldDisplay } from '../fields/field-display.js';
import { useDetailViewStore, useIsFieldEditing } from '../../../stores/detail-view-store.js';
import { InlineEditField } from '../fields/inline-edit-field.js';

/**
 * Head-detail layout component
 * Single-column layout with prominent title field at top
 * Optimized for mobile but works on all screen sizes
 */
export function HeadDetailLayout({
  record,
  table,
  config,
  referenceRecords,
  userRecords,
  onFieldChange,
  readOnly = false,
  className,
  inlineEditContext,
}: HeadDetailLayoutProps) {
  const { startEdit, cancelEdit } = useDetailViewStore();

  // Get field configurations
  const getField = (fieldName: string) => table.config.fields.find((f) => f.name === fieldName);

  // Get record data (supports both record.data and direct field access)
  const recordData = (record as any).data || record;

  // Title field
  const titleField = getField(config.titleField);
  const titleValue = recordData[config.titleField];
  const isTitleEditing = useIsFieldEditing(record.id, config.titleField);

  // Sub-line fields (displayed as badges below title)
  const subLineFields = config.subLineFields
    .map((fieldName) => ({
      field: getField(fieldName),
      value: recordData[fieldName],
      name: fieldName,
    }))
    .filter((item) => item.field != null);

  // Tail fields (main content fields)
  const tailFields = config.tailFields
    .map((fieldName) => ({
      field: getField(fieldName),
      value: recordData[fieldName],
      name: fieldName,
    }))
    .filter((item) => item.field != null);

  // Handle field save
  const handleFieldSave = async (fieldName: string, value: unknown) => {
    if (onFieldChange) {
      await onFieldChange(fieldName, value);
    }
    cancelEdit();
  };

  // Check if user can edit field
  const canEdit = (fieldName: string): boolean => {
    if (readOnly) return false;
    // TODO: Check field-level permissions from record.permissions
    return true;
  };

  return (
    <Stack className={cn('w-full', className)} space="space-400">
      {/* NOTE: Title and subline fields are now displayed in RecordHeader (sticky header)
          This component only shows tailFields (body content) per recordDetailConfig spec */}

      {/* Tail Fields (main content) */}
      <Stack space="space-300">
        {tailFields.map(({ field, value, name }) => {
          if (!field) return null;

          const isEditing = useIsFieldEditing(record.id, name);

          return (
            <Stack key={name} space="space-050">
              {/* Field Label */}
              <Text size="small" weight="medium" className="text-muted-foreground">
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1" aria-label="required">
                    *
                  </span>
                )}
              </Text>

              {/* Field Value or Edit Mode */}
              {isEditing ? (
                <InlineEditField
                  field={field}
                  value={value}
                  onSave={(newValue) => handleFieldSave(name, newValue)}
                  onCancel={cancelEdit}
                  autoFocus
                  table={table}
                  workspaceUsers={inlineEditContext?.workspaceUsers}
                  fetchRecords={inlineEditContext?.getFetchRecords?.(name)}
                  initialRecords={inlineEditContext?.getInitialRecords?.(name)}
                  referencedTableName={field.referencedTableName}
                />
              ) : (
                <FieldDisplay
                  field={field}
                  value={value}
                  referenceRecords={referenceRecords}
                  userRecords={userRecords}
                  editable={canEdit(name)}
                  onDoubleClick={() => {
                    if (canEdit(name)) {
                      startEdit(record.id, name);
                    }
                  }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
