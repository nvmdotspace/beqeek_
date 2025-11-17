/**
 * Update Record Dialog Component
 *
 * Dialog for editing existing records with same features as Create Dialog:
 * - Full accessibility (WCAG 2.1 AA compliant)
 * - Mobile-optimized responsive design
 * - Success feedback with toast notifications
 * - Improved error handling and focus management
 * - Design token compliance
 * - E2EE support
 */

import { useCallback, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@workspace/ui/lib/utils';
import { FieldInput } from './field-input';
import { useBatchUpdateRecord } from '../../hooks/use-update-record';
import type { Table, TableRecord } from '@workspace/active-tables-core';
import {
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
} from '@workspace/beqeek-shared';
import { MultiSelectField as ReusableMultiSelectField } from '../settings/multi-select-field';
import { Label } from '@workspace/ui/components/label';

/**
 * Type for field values in form data
 */
type RecordFieldValue = string | number | boolean | string[];

// Multi-select field types
const MULTI_SELECT_FIELD_TYPES = new Set<string>([FIELD_TYPE_SELECT_LIST, FIELD_TYPE_CHECKBOX_LIST]);

interface UpdateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table;
  record: TableRecord;
  workspaceId: string;
  tableId: string;
  onSuccess?: () => void;
}

export function UpdateRecordDialog({
  open,
  onOpenChange,
  table,
  record,
  workspaceId,
  tableId,
  onSuccess,
}: UpdateRecordDialogProps) {
  const [firstErrorField, setFirstErrorField] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getRecordValues(record, table),
  });

  const updateMutation = useBatchUpdateRecord(workspaceId, tableId, table);

  // Reset form when record changes
  useEffect(() => {
    if (open && record) {
      form.reset(getRecordValues(record, table));
    }
  }, [open, record, table, form]);

  // Focus first input when dialog opens
  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    setTimeout(() => {
      const firstInput = document.querySelector('[data-autofocus="true"] input, [data-autofocus="true"] textarea');
      (firstInput as HTMLElement)?.focus();
    }, 100);
  }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Get only changed fields
      const originalValues = getRecordValues(record, table);
      const updates: Record<string, RecordFieldValue> = {};

      Object.entries(data).forEach(([key, value]) => {
        // Compare with original value
        const originalValue = originalValues[key];
        const hasChanged = JSON.stringify(value) !== JSON.stringify(originalValue);

        if (hasChanged && value !== undefined && value !== '') {
          updates[key] = value as RecordFieldValue;
        }
      });

      // If no changes, just close
      if (Object.keys(updates).length === 0) {
        toast.info('No changes detected');
        onOpenChange(false);
        return;
      }

      await updateMutation.mutateAsync({
        recordId: record.id,
        updates,
      });

      // Success toast
      toast.success('Record updated successfully', {
        description: `Updated ${Object.keys(updates).length} field(s) in ${table.name}`,
        duration: 3000,
      });

      // Small delay to show success state
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Close dialog
      onOpenChange(false);
      setFirstErrorField(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Find first error field for focus management
      const errorField = Object.keys(form.formState.errors)[0];
      setFirstErrorField(errorField || null);

      console.error('Update record error:', error);

      // Error toast
      toast.error('Failed to update record', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  });

  // Adjust dialog height for mobile keyboards
  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--viewport-height', `${vh}px`);
    };

    if (open) {
      handleResize();
      window.visualViewport?.addEventListener('resize', handleResize);
    }

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [open]);

  // Keyboard shortcuts (Cmd+Enter to submit)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onSubmit]);

  // Jump to first error field
  const handleJumpToError = useCallback(() => {
    if (firstErrorField) {
      const errorElement = document.querySelector(
        `[data-field-name="${firstErrorField}"] input, [data-field-name="${firstErrorField}"] textarea, [data-field-name="${firstErrorField}"] button`,
      );
      (errorElement as HTMLElement)?.focus();
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [firstErrorField]);

  // Get visible fields
  const visibleFields = table.config.fields.filter((field) => field.type !== FIELD_TYPE_FIRST_REFERENCE_RECORD);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-[95vw] sm:w-full',
          'sm:max-w-[800px]',
          'max-h-[calc(var(--viewport-height,100vh)*0.9)]',
          'flex flex-col',
          'gap-0 p-0',
        )}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Update Record</DialogTitle>
          <DialogDescription>
            Edit the fields below to update this record in <strong>{table.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="update-record-form" onSubmit={onSubmit}>
            {/* E2EE Warning */}
            {table.config.e2eeEncryption && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>End-to-End Encryption Enabled</AlertTitle>
                <AlertDescription>
                  Your changes will be encrypted with your encryption key before being sent to the server.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Summary */}
            {updateMutation.isError && (
              <Alert variant="destructive" className="mb-6" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Error Updating Record</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    {updateMutation.error?.message || 'Failed to update record. Please try again.'}
                  </p>

                  {firstErrorField && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleJumpToError}
                      aria-label="Jump to first error field"
                      className="mt-2"
                    >
                      Go to Error Field
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Field Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleFields.map((field, index) => {
                const fullWidthTypes: readonly string[] = [
                  FIELD_TYPE_RICH_TEXT,
                  FIELD_TYPE_TEXT,
                  FIELD_TYPE_SELECT_LIST_RECORD,
                  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
                  FIELD_TYPE_CHECKBOX_YES_NO,
                ];
                const isFullWidth = fullWidthTypes.includes(field.type);
                const isMultiSelectField = MULTI_SELECT_FIELD_TYPES.has(field.type);

                if (isMultiSelectField) {
                  return (
                    <div key={field.name} className={cn(isFullWidth && 'md:col-span-2')}>
                      <Controller
                        name={field.name}
                        control={form.control}
                        rules={{
                          required: field.required ? `${field.label} is required` : false,
                        }}
                        render={({ field: formField, fieldState }) => {
                          const options = Array.isArray(field.options)
                            ? field.options.map(
                                (option: {
                                  value: string;
                                  text: string;
                                  text_color?: string;
                                  background_color?: string;
                                }) => ({
                                  value: option.value,
                                  label: option.text,
                                  textColor: option.text_color,
                                  backgroundColor: option.background_color,
                                }),
                              )
                            : [];

                          return (
                            <div data-field-name={field.name} data-autofocus={index === 0} className="space-y-2">
                              <Label htmlFor={`field-${field.name}`} className="text-sm font-medium text-foreground">
                                {field.label}
                                {field.required && <span className="ml-1 text-destructive">*</span>}
                              </Label>
                              <ReusableMultiSelectField
                                id={`field-${field.name}`}
                                options={options}
                                value={Array.isArray(formField.value) ? formField.value : []}
                                onChange={(nextValues) => formField.onChange(nextValues)}
                                placeholder={field.placeholder || 'Select options'}
                                disabled={updateMutation.isPending}
                              />
                              {fieldState.error && (
                                <p className="text-xs text-destructive">{fieldState.error.message}</p>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.name} className={cn(isFullWidth && 'md:col-span-2')}>
                    <FieldInput
                      field={field}
                      form={form}
                      table={table}
                      workspaceId={workspaceId}
                      disabled={updateMutation.isPending}
                      autoFocus={index === 0}
                    />
                  </div>
                );
              })}
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              form.reset();
              setFirstErrorField(null);
            }}
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="update-record-form"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto"
            aria-label={updateMutation.isPending ? 'Updating record, please wait' : 'Update record'}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Updating...</span>
                <span className="sr-only" role="status" aria-live="polite">
                  Updating record, please wait
                </span>
              </>
            ) : (
              'Update Record'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Extract record field values for form initialization
 */
function getRecordValues(record: TableRecord, table: Table): Record<string, RecordFieldValue> {
  const values: Record<string, RecordFieldValue> = {};
  const recordData = record.data || record.record;

  table.config.fields.forEach((field) => {
    // Skip auto-calculated fields
    if (field.type === FIELD_TYPE_FIRST_REFERENCE_RECORD) {
      return;
    }

    const value = recordData[field.name];

    // Set value from record or default
    if (value !== undefined && value !== null) {
      values[field.name] = value as RecordFieldValue;
    } else {
      // Set empty defaults based on field type
      if (field.type === FIELD_TYPE_CHECKBOX_YES_NO) {
        values[field.name] = false;
      } else if (field.type === FIELD_TYPE_SELECT_LIST || field.type === FIELD_TYPE_CHECKBOX_LIST) {
        values[field.name] = [];
      } else {
        values[field.name] = '';
      }
    }
  });

  return values;
}
