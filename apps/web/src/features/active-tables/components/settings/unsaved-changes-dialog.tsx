/**
 * Unsaved Changes Dialog
 *
 * Warns users when they try to navigate away with unsaved changes.
 */

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

export interface UnsavedChangesDialogProps {
  /** Whether the dialog is open */
  open: boolean;

  /** Callback when dialog state changes */
  onOpenChange: (open: boolean) => void;

  /** Callback when user confirms leaving */
  onConfirm: () => void;

  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * Unsaved Changes Dialog
 *
 * Shows a confirmation dialog when user tries to navigate away with unsaved changes.
 * Follows WCAG 2.1 AA guidelines with proper focus management and keyboard navigation.
 */
export function UnsavedChangesDialog({ open, onOpenChange, onConfirm, onCancel }: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes that will be lost if you leave this page. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Stay on Page</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Leave Without Saving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
