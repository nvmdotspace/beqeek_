/**
 * Danger Zone Section
 *
 * Handles irreversible and dangerous actions like table deletion
 */

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { SettingsSection } from '../settings-layout';

export interface DangerZoneSectionProps {
  /** Table name for confirmation */
  tableName: string;

  /** Callback when delete is confirmed */
  onDelete: () => void;

  /** Whether delete is in progress */
  isDeleting?: boolean;
}

/**
 * Danger Zone Section
 */
export function DangerZoneSection({ tableName, onDelete, isDeleting = false }: DangerZoneSectionProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
    setConfirmText('');
  };

  const handleConfirmDelete = () => {
    if (confirmText === tableName) {
      onDelete();
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmText('');
  };

  const isConfirmValid = confirmText === tableName;

  return (
    <>
      <SettingsSection
        title="Danger Zone"
        description="Irreversible and dangerous actions"
        className="border-destructive"
      >
        <div className="space-y-6">
          {/* Warning */}
          <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Warning: Irreversible Actions</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Actions in this section are permanent and cannot be undone. Please proceed with extreme caution.
                </p>
              </div>
            </div>
          </div>

          {/* Delete Table */}
          <div className="rounded-lg border-2 border-destructive p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete This Table
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Permanently delete this table and all associated data. This action cannot be undone.
              </p>
            </div>

            <div className="rounded-md bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">This will permanently delete:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>All table records and data</li>
                <li>All comments and attachments</li>
                <li>All table configuration and settings</li>
                <li>All permissions and access rules</li>
                <li>All associated views (Kanban, Gantt, etc.)</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="w-full"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              {isDeleting ? 'Deleting...' : 'Delete This Table Permanently'}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Before You Delete</p>
            <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <li>• Make sure you have exported any data you need to keep</li>
              <li>• Inform your team members about the deletion</li>
              <li>• Consider archiving the table instead of deleting it</li>
              <li>• Verify that no critical workflows depend on this table</li>
            </ul>
          </div>
        </div>
      </SettingsSection>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Table Deletion
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All data will be lost forever.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">You are about to delete:</p>
              <p className="mt-2 text-base font-bold">{tableName}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-text">
                Type the table name to confirm: <span className="font-mono font-bold">{tableName}</span>
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type table name here..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                This confirmation ensures you really want to delete this table.
              </p>
            </div>

            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> This will immediately delete the table and all its data. There is no way to
                recover it after deletion.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!isConfirmValid || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
