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
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
          <AlertDialogTitle>{m.workflowUnits_dialog_deleteTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            <span dangerouslySetInnerHTML={{ __html: m.workflowUnits_dialog_deleteConfirm({ name: unit.name }) }} />
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Warning Alert */}
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>{m.workflowUnits_dialog_deleteWarning()}</AlertDescription>
        </Alert>

        {/* Error Alert */}
        {deleteMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {deleteMutation.error instanceof Error ? deleteMutation.error.message : m.workflowUnits_error_delete()}
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>{m.common_cancel()}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {m.workflowUnits_dialog_deleteButton()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
