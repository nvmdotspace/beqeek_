/**
 * EditEventDialog Component
 *
 * Simple dialog for editing existing workflow events.
 * Allows updating event name, description, and trigger configuration.
 */

import { useState, useEffect } from 'react';
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
import { Textarea } from '@workspace/ui/components/textarea';
import { Loader2 } from 'lucide-react';
import { TriggerConfigForm } from '../trigger-config-form';
import { useUpdateWorkflowEvent } from '../../hooks/use-update-workflow-event';
import type { WorkflowEvent, EventSourceType, EventSourceParams } from '../../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  event: WorkflowEvent;
}

export function EditEventDialog({ open, onOpenChange, workspaceId, event }: EditEventDialogProps) {
  const [name, setName] = useState(event.eventName);
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<EventSourceType>(event.eventSourceType);
  const [triggerParams, setTriggerParams] = useState<EventSourceParams>(event.eventSourceParams);

  const updateEvent = useUpdateWorkflowEvent();

  // Reset form when event changes
  useEffect(() => {
    setName(event.eventName);
    setTriggerType(event.eventSourceType);
    setTriggerParams(event.eventSourceParams);
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    updateEvent.mutate(
      {
        workspaceId,
        eventId: event.id,
        data: {
          eventName: name.trim(),
          eventSourceType: triggerType,
          eventSourceParams: triggerParams,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{m.workflowEvents_dialog_editTitle()}</DialogTitle>
          <DialogDescription>{m.workflowEvents_dialog_editDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-event-name">{m.workflowEvents_form_nameLabel()}</Label>
              <Input
                id="edit-event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={m.workflowEvents_form_namePlaceholder()}
                required
                maxLength={100}
                disabled={updateEvent.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-description">{m.workflowEvents_form_descriptionLabel()}</Label>
              <Textarea
                id="edit-event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={m.workflowEvents_form_descriptionPlaceholder()}
                rows={3}
                maxLength={500}
                disabled={updateEvent.isPending}
              />
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-4">{m.workflowEvents_dialog_triggerConfig()}</h3>
            <TriggerConfigForm
              workspaceId={workspaceId}
              triggerType={triggerType}
              triggerParams={triggerParams}
              onTriggerTypeChange={setTriggerType}
              onTriggerParamsChange={setTriggerParams}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateEvent.isPending}
            >
              {m.common_cancel()}
            </Button>
            <Button type="submit" disabled={!name.trim() || updateEvent.isPending}>
              {updateEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {m.common_saveChanges()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
