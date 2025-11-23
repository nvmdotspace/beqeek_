/**
 * TwoColumnDetailLayout - Desktop-optimized two-column record detail layout
 * @module active-tables-core/components/record-detail/layouts
 */

import React from 'react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Grid, GridItem } from '@workspace/ui/components/primitives/grid';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Box } from '@workspace/ui/components/primitives/box';
import { Heading, Text } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import type { TwoColumnDetailLayoutProps } from '../../../types/record-detail.js';
import type { FieldConfig } from '../../../types/field.js';
import { FieldDisplay } from '../fields/field-display.js';
import { useDetailViewStore } from '../../../stores/detail-view-store.js';
import { InlineEditField } from '../fields/inline-edit-field.js';

/**
 * Two-column layout component
 * Desktop-optimized layout with header section and two-column field grid
 * Collapses to single column on mobile
 */
export function TwoColumnDetailLayout({
  record,
  table,
  config,
  referenceRecords,
  userRecords,
  onFieldChange,
  readOnly = false,
  className,
  inlineEditContext,
}: TwoColumnDetailLayoutProps) {
  const { startEdit, cancelEdit } = useDetailViewStore();

  // Get editing state once at top level (NOT in loop) - performance optimization
  const editingFieldName = useDetailViewStore((state) =>
    state.editingRecordId === record.id ? state.editingFieldName : null,
  );

  // Get field configurations
  const getField = (fieldName: string) => table.config.fields.find((f) => f.name === fieldName);

  // Get record data (supports both record.data and direct field access)
  const recordData = (record as any).data || record;

  // Head section fields
  const titleField = getField(config.headTitleField || '');
  const titleValue = recordData[config.headTitleField || ''];
  const isTitleEditing = editingFieldName === (config.headTitleField || '');

  const subLineFields = (config.headSubLineFields || [])
    .map((fieldName) => ({
      field: getField(fieldName),
      value: recordData[fieldName],
      name: fieldName,
    }))
    .filter((item) => item.field != null);

  // Column 1 fields
  const column1Fields = (config.column1Fields || [])
    .map((fieldName) => ({
      field: getField(fieldName),
      value: recordData[fieldName],
      name: fieldName,
    }))
    .filter((item) => item.field != null);

  // Column 2 fields
  const column2Fields = (config.column2Fields || [])
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

  // Render a field group - uses pre-computed editingFieldName instead of hook
  const renderField = (fieldName: string, field: FieldConfig, value: unknown) => {
    const isEditing = editingFieldName === fieldName;

    return (
      <Stack key={fieldName} space="space-050">
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
            onSave={(newValue) => handleFieldSave(fieldName, newValue)}
            onCancel={cancelEdit}
            autoFocus
            table={table}
            workspaceUsers={inlineEditContext?.workspaceUsers}
            fetchRecords={inlineEditContext?.getFetchRecords?.(fieldName)}
            initialRecords={inlineEditContext?.getInitialRecords?.(fieldName)}
            referencedTableName={field.referencedTableName}
          />
        ) : (
          <FieldDisplay
            field={field}
            value={value}
            referenceRecords={referenceRecords}
            userRecords={userRecords}
            editable={canEdit(fieldName)}
            onDoubleClick={() => {
              if (canEdit(fieldName)) {
                startEdit(record.id, fieldName);
              }
            }}
          />
        )}
      </Stack>
    );
  };

  return (
    <Stack className={cn('w-full', className)} space="space-400">
      {/* Header Section */}
      <Box className="border-b border-border pb-4">
        <Stack space="space-200">
          {/* Title Field */}
          {titleField && (
            <div>
              {isTitleEditing ? (
                <InlineEditField
                  field={titleField}
                  value={titleValue}
                  onSave={(value) => handleFieldSave(config.headTitleField, value)}
                  onCancel={cancelEdit}
                  autoFocus
                  table={table}
                  workspaceUsers={inlineEditContext?.workspaceUsers}
                  fetchRecords={inlineEditContext?.getFetchRecords?.(config.headTitleField)}
                  initialRecords={inlineEditContext?.getInitialRecords?.(config.headTitleField)}
                  referencedTableName={titleField.referencedTableName}
                />
              ) : (
                <Heading
                  level={1}
                  className={cn(
                    canEdit(config.headTitleField) &&
                      'cursor-pointer hover:bg-accent/50 rounded px-2 -mx-2 transition-colors',
                  )}
                  onDoubleClick={() => {
                    if (canEdit(config.headTitleField)) {
                      startEdit(record.id, config.headTitleField);
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

                // Use pre-computed editing state instead of hook in loop
                const isEditing = editingFieldName === name;

                if (isEditing) {
                  return (
                    <InlineEditField
                      key={name}
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

      {/* Two-Column Field Grid */}
      <Grid columns={12} gap="space-400">
        {/* Column 1 - spans 6 columns on desktop, full width on mobile */}
        <GridItem span={12} spanMd={6}>
          <Stack space="space-300">
            {column1Fields.map(({ field, value, name }) => (field ? renderField(name, field, value) : null))}
          </Stack>
        </GridItem>

        {/* Column 2 - spans 6 columns on desktop, full width on mobile */}
        <GridItem span={12} spanMd={6}>
          <Stack space="space-300">
            {column2Fields.map(({ field, value, name }) => (field ? renderField(name, field, value) : null))}
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  );
}
