import { useCallback } from 'react';
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
import { useCreateWorkflowUnit } from '../../hooks/use-create-workflow-unit';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const createWorkflowUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
});

type CreateWorkflowUnitForm = z.infer<typeof createWorkflowUnitSchema>;

interface CreateWorkflowUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  locale: string;
}

export function CreateWorkflowUnitDialog({ open, onOpenChange, workspaceId, locale }: CreateWorkflowUnitDialogProps) {
  const navigate = useNavigate();
  const createMutation = useCreateWorkflowUnit();

  const form = useForm<CreateWorkflowUnitForm>({
    resolver: zodResolver(createWorkflowUnitSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    setTimeout(() => {
      const firstInput = document.querySelector('[data-autofocus="true"]');
      (firstInput as HTMLElement)?.focus();
    }, 100);
  }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const response = await createMutation.mutateAsync({
        workspaceId,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      });

      // Navigate to detail page on success
      navigate({
        to: ROUTES.WORKFLOW_UNITS.DETAIL,
        params: { locale, workspaceId, unitId: response.id },
      });

      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error already handled by mutation hook
      console.error('Create workflow unit error:', error);
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
        aria-describedby="create-workflow-unit-description"
      >
        <DialogHeader>
          <DialogTitle>Create Workflow Unit</DialogTitle>
          <DialogDescription id="create-workflow-unit-description">
            Create a new workflow unit to organize your automation workflows
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              data-autofocus="true"
              placeholder="Enter workflow unit name"
              {...form.register('name')}
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
            />
            {form.formState.errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)"
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Error Alert */}
          {createMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Failed to create workflow unit'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
