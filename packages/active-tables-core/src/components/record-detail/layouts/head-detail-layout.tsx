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
}: HeadDetailLayoutProps) {
  const { startEdit, cancelEdit } = useDetailViewStore();

  // Get field configurations
  const getField = (fieldName: string) => table.config.fields.find((f) => f.name === fieldName);

  // Title field
  const titleField = getField(config.titleField);
  const titleValue = (record as any)[config.titleField];
  const isTitleEditing = useIsFieldEditing(record.id, config.titleField);

  // Sub-line fields (displayed as badges below title)
  const subLineFields = config.subLineFields
    .map((fieldName) => ({
      field: getField(fieldName),
      value: (record as any)[fieldName],
      name: fieldName,
    }))
    .filter((item) => item.field != null);

  // Tail fields (main content fields)
  const tailFields = config.tailFields
    .map((fieldName) => ({
      field: getField(fieldName),
      value: (record as any)[fieldName],
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
      {/* Title Section */}
      <Box className="border-b border-border pb-4">
        <Stack space="space-200">
          {/* Title Field */}
          {titleField && (
            <div>
              {isTitleEditing ? (
                <InlineEditField
                  field={titleField}
                  value={titleValue}
                  onSave={(value) => handleFieldSave(config.titleField, value)}
                  onCancel={cancelEdit}
                  autoFocus
                />
              ) : (
                <Heading
                  level={1}
                  className={cn(
                    canEdit(config.titleField) &&
                      'cursor-pointer hover:bg-accent/50 rounded px-2 -mx-2 transition-colors',
                  )}
                  onDoubleClick={() => {
                    if (canEdit(config.titleField)) {
                      startEdit(record.id, config.titleField);
                    }
                  }}
                >
                  {titleValue != null ? String(titleValue) : 'Untitled'}
                </Heading>
              )}
            </div>
          )}

          {/* Sub-line Fields (badges) */}
          {subLineFields.length > 0 && (
            <Inline space="space-100" wrap>
              {subLineFields.map(({ field, value, name }) => {
                if (!field) return null;

                const isEditing = useIsFieldEditing(record.id, name);

                if (isEditing) {
                  return (
                    <InlineEditField
                      key={name}
                      field={field}
                      value={value}
                      onSave={(newValue) => handleFieldSave(name, newValue)}
                      onCancel={cancelEdit}
                      autoFocus
                    />
                  );
                }

                return (
                  <FieldDisplay
                    key={name}
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
                );
              })}
            </Inline>
          )}
        </Stack>
      </Box>

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
