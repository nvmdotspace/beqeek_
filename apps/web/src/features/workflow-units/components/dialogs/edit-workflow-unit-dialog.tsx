import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useUpdateWorkflowUnit } from '../../hooks/use-update-workflow-unit';
import type { WorkflowUnit } from '../../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const editWorkflowUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
});

type EditWorkflowUnitForm = z.infer<typeof editWorkflowUnitSchema>;

interface EditWorkflowUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  unit: WorkflowUnit;
}

export function EditWorkflowUnitDialog({ open, onOpenChange, workspaceId, unit }: EditWorkflowUnitDialogProps) {
  const updateMutation = useUpdateWorkflowUnit();

  const form = useForm<EditWorkflowUnitForm>({
    resolver: zodResolver(editWorkflowUnitSchema),
    defaultValues: {
      name: unit.name,
      description: unit.description || '',
    },
  });

  // Reset form when unit changes
  useEffect(() => {
    form.reset({
      name: unit.name,
      description: unit.description || '',
    });
  }, [unit, form]);

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    setTimeout(() => {
      const firstInput = document.querySelector('[data-autofocus="true"]');
      (firstInput as HTMLElement)?.focus();
    }, 100);
  }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateMutation.mutateAsync({
        workspaceId,
        unitId: unit.id,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      });

      // Close dialog on success
      onOpenChange(false);
    } catch (error) {
      // Error already handled by mutation hook
      console.error('Update workflow unit error:', error);
    }
  });

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px]"
        onOpenAutoFocus={handleOpenAutoFocus}
        aria-describedby="edit-workflow-unit-description"
      >
        <DialogHeader>
          <DialogTitle>{m.workflowUnits_dialog_editTitle()}</DialogTitle>
          <DialogDescription id="edit-workflow-unit-description">
            {m.workflowUnits_dialog_editDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              {m.workflowUnits_form_nameLabel()} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              data-autofocus="true"
              placeholder={m.workflowUnits_form_namePlaceholder()}
              {...form.register('name')}
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? 'edit-name-error' : undefined}
            />
            {form.formState.errors.name && (
              <p id="edit-name-error" className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">{m.workflowUnits_form_descriptionLabel()}</Label>
            <Textarea
              id="edit-description"
              placeholder={m.workflowUnits_form_descriptionPlaceholder()}
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Error Alert */}
          {updateMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                {updateMutation.error instanceof Error ? updateMutation.error.message : m.workflowUnits_error_update()}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={updateMutation.isPending}>
              {m.common_cancel()}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              {m.common_saveChanges()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
