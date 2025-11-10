/**
 * Create Record Dialog Component
 *
 * Enhanced with:
 * - Full accessibility (WCAG 2.1 AA compliant)
 * - Mobile-optimized responsive design
 * - Success feedback with toast notifications
 * - Improved error handling and focus management
 * - Design token compliance
 */

import { useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { useCreateRecord } from '../../hooks/use-create-record';
import type { Table } from '@workspace/active-tables-core';
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

interface CreateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table;
  workspaceId: string;
  tableId: string;
  onSuccess?: (recordId: string) => void;
}

export function CreateRecordDialog({
  open,
  onOpenChange,
  table,
  workspaceId,
  tableId,
  onSuccess,
}: CreateRecordDialogProps) {
  const [firstErrorField, setFirstErrorField] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getDefaultValues(table),
  });

  const createMutation = useCreateRecord(workspaceId, tableId, table);

  // Focus first input when dialog opens
  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const firstInput = document.querySelector('[data-autofocus="true"] input, [data-autofocus="true"] textarea');
      (firstInput as HTMLElement)?.focus();
    }, 100);
  }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Clean up the data - remove undefined values
      const cleanedData: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanedData[key] = value;
        }
      });

      const response = await createMutation.mutateAsync({
        record: cleanedData,
      });

      // Success toast notification
      toast.success('Record created successfully', {
        description: `Created record in ${table.name}`,
        duration: 3000,
      });

      // Small delay to show success state
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
      setFirstErrorField(null);

      if (onSuccess) {
        onSuccess(response.data.id);
      }
    } catch (error) {
      // Find first error field for focus management
      const errorField = Object.keys(form.formState.errors)[0];
      setFirstErrorField(errorField || null);

      console.error('Create record error:', error);

      // Error toast (mutation error is also shown in dialog)
      toast.error('Failed to create record', {
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

  // Week 3: Keyboard shortcuts (Cmd+Enter to submit, Esc handled by Dialog)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Enter (Mac) or Ctrl+Enter (Windows) to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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

  // Get visible fields (exclude FIRST_REFERENCE_RECORD - auto-calculated)
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
          <DialogTitle>Create New Record</DialogTitle>
          <DialogDescription>
            Fill in the fields below to create a new record in <strong>{table.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="create-record-form" onSubmit={onSubmit}>
            {/* E2EE Warning */}
            {table.config.e2eeEncryption && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>End-to-End Encryption Enabled</AlertTitle>
                <AlertDescription>
                  This record will be encrypted with your encryption key before being sent to the server.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Summary (Accessible) */}
            {createMutation.isError && (
              <Alert variant="destructive" className="mb-6" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Error Creating Record</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    {createMutation.error?.message || 'Failed to create record. Please try again.'}
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

            {/* Field Grid - Responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleFields.map((field, index) => {
                // Full width for rich text, long text, and multi-select reference fields
                const fullWidthTypes = [
                  FIELD_TYPE_RICH_TEXT,
                  FIELD_TYPE_TEXT,
                  FIELD_TYPE_SELECT_LIST_RECORD,
                  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
                ];
                const isFullWidth = fullWidthTypes.includes(field.type as any);

                return (
                  <div key={field.name} className={cn(isFullWidth && 'md:col-span-2')}>
                    <FieldInput
                      field={field}
                      form={form}
                      table={table}
                      workspaceId={workspaceId}
                      disabled={createMutation.isPending}
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
            disabled={createMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-record-form"
            disabled={createMutation.isPending}
            className="w-full sm:w-auto"
            aria-label={createMutation.isPending ? 'Creating record, please wait' : 'Create record'}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Creating...</span>
                {/* Screen reader announcement */}
                <span className="sr-only" role="status" aria-live="polite">
                  Creating record, please wait
                </span>
              </>
            ) : (
              'Create Record'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Generate default values for form fields
 */
function getDefaultValues(table: Table): Record<string, any> {
  const defaults: Record<string, any> = {};

  table.config.fields.forEach((field) => {
    // Skip auto-calculated fields
    if (field.type === FIELD_TYPE_FIRST_REFERENCE_RECORD) {
      return;
    }

    // Set default value if provided
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      defaults[field.name] = field.defaultValue;
    } else {
      // Set empty defaults based on field type
      if (field.type === FIELD_TYPE_CHECKBOX_YES_NO) {
        defaults[field.name] = false;
      } else if (field.type === FIELD_TYPE_SELECT_LIST || field.type === FIELD_TYPE_CHECKBOX_LIST) {
        defaults[field.name] = [];
      } else {
        defaults[field.name] = '';
      }
    }
  });

  return defaults;
}
