/**
 * Field Deletion Warning Dialog
 *
 * Shows users which configurations will be affected when deleting a field
 * that is referenced in other parts of the table configuration.
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
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';

export interface FieldReference {
  location: string;
  details: string;
}

export interface FieldDeletionWarningDialogProps {
  /** Whether the dialog is open */
  open: boolean;

  /** Callback when dialog state changes */
  onOpenChange: (open: boolean) => void;

  /** Field name being deleted */
  fieldName: string;

  /** Field label being deleted */
  fieldLabel: string;

  /** List of references to this field */
  references: FieldReference[];

  /** Callback when deletion is confirmed */
  onConfirm: () => void;

  /** Callback when deletion is cancelled */
  onCancel: () => void;
}

/**
 * Field Deletion Warning Dialog
 *
 * Warns users about dependent configurations before deleting a field.
 * Shows all locations where the field is used and explains what will happen.
 */
export function FieldDeletionWarningDialog({
  open,
  onOpenChange,
  fieldName,
  fieldLabel,
  references,
  onConfirm,
  onCancel,
}: FieldDeletionWarningDialogProps) {
  const hasReferences = references.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <AlertDialogTitle>{hasReferences ? 'Field is Used in Configurations' : 'Delete Field'}</AlertDialogTitle>
              <AlertDialogDescription>
                {hasReferences ? (
                  <>
                    The field <span className="font-mono font-semibold">{fieldLabel}</span> ({fieldName}) is currently
                    being used in the following configurations. Deleting this field will automatically remove or update
                    these references.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete the field{' '}
                    <span className="font-mono font-semibold">{fieldLabel}</span> ({fieldName})? This action cannot be
                    undone.
                  </>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {hasReferences && (
          <div className="my-4 max-h-[300px] space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-4">
            {references.map((ref, index) => (
              <div key={index} className="flex items-start gap-3 rounded-md bg-background p-3">
                <Badge variant="outline" className="mt-0.5 shrink-0">
                  {ref.location}
                </Badge>
                <p className="text-sm text-muted-foreground">{ref.details}</p>
              </div>
            ))}
          </div>
        )}

        {hasReferences && (
          <div className="rounded-lg border border-warning/20 bg-warning-subtle p-4">
            <p className="text-sm font-medium text-warning">What will happen:</p>
            <ul className="mt-2 space-y-1 text-xs text-warning-subtle-foreground">
              <li>• The field will be removed from all configurations</li>
              <li>• Configurations that become invalid will be automatically deleted</li>
              <li>• Existing data in this field will be permanently deleted</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Field
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
