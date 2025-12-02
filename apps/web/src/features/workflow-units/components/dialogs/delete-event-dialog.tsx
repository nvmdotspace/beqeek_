/**
 * DeleteEventDialog Component
 *
 * Confirmation dialog for deleting workflow events.
 * Requires typing event name to enable delete button (prevents accidental deletion).
 */

import { useState } from 'react';
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
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteWorkflowEvent } from '../../hooks/use-delete-workflow-event';
import type { WorkflowEvent } from '../../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  event: WorkflowEvent;
}

export function DeleteEventDialog({ open, onOpenChange, workspaceId, event }: DeleteEventDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const deleteEvent = useDeleteWorkflowEvent();

  const isDeleteEnabled = confirmText === event.eventName;

  const handleDelete = async () => {
    if (!isDeleteEnabled) return;

    deleteEvent.mutate(
      {
        workspaceId,
        eventId: event.id,
      },
      {
        onSuccess: () => {
          setConfirmText('');
          onOpenChange(false);
        },
      },
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !deleteEvent.isPending) {
      setConfirmText('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {m.workflowEvents_dialog_deleteTitle()}
          </DialogTitle>
          <DialogDescription>{m.workflowEvents_dialog_deleteDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>{m.workflowEvents_dialog_eventName()}:</strong> {event.eventName}
              <br />
              <strong>{m.workflowEvents_dialog_triggerType()}:</strong> {event.eventSourceType}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              {m.workflowEvents_dialog_typeToConfirm()} <strong className="font-mono">{event.eventName}</strong>
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={event.eventName}
              disabled={deleteEvent.isPending}
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleteEvent.isPending}
          >
            {m.common_cancel()}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isDeleteEnabled || deleteEvent.isPending}
          >
            {deleteEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {m.workflowEvents_dialog_deleteButton()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
