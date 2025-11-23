import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useDeleteWorkflowUnit } from '../../hooks/use-delete-workflow-unit';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import type { WorkflowUnit } from '../../api/types';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  locale: string;
  unit: WorkflowUnit;
}

export function DeleteConfirmDialog({ open, onOpenChange, workspaceId, locale, unit }: DeleteConfirmDialogProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteWorkflowUnit();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        workspaceId,
        unitId: unit.id,
      });

      // Navigate to list page on success
      navigate({
        to: ROUTES.WORKFLOW_UNITS.LIST,
        params: { locale, workspaceId },
      });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      // Error already handled by mutation hook
      console.error('Delete workflow unit error:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workflow Unit</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{unit.name}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Warning Alert */}
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            This action will permanently delete the workflow unit and all associated workflow events. This cannot be
            undone.
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {deleteMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete workflow unit'}
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
