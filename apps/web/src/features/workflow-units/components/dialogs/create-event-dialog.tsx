/**
 * CreateEventDialog Component
 *
 * Simple single-step dialog for creating workflow events.
 * Collects basic info + trigger configuration, then creates event with empty YAML.
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
import { Textarea } from '@workspace/ui/components/textarea';
import { Loader2 } from 'lucide-react';
import { TriggerConfigForm } from '../trigger-config-form';
import { useCreateWorkflowEvent } from '../../hooks/use-create-workflow-event';
import type { EventSourceType, EventSourceParams } from '../../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  unitId: string;
}

export function CreateEventDialog({ open, onOpenChange, workspaceId, unitId }: CreateEventDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<EventSourceType>('SCHEDULE');
  const [triggerParams, setTriggerParams] = useState<EventSourceParams>({ expression: '0 9 * * 1' });

  const createEvent = useCreateWorkflowEvent();

  const generateUUIDv7 = () => {
    const timestamp = Date.now();
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const randomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x70;
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;
    const randomHex = randomBytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-7${randomHex.slice(1, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8, 20)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    // Generate webhookId for all trigger types (required by backend)
    const webhookId = generateUUIDv7();

    createEvent.mutate(
      {
        workspaceId,
        data: {
          workflowUnit: unitId,
          eventName: name.trim(),
          eventSourceType: triggerType,
          eventSourceParams: {
            ...triggerParams,
            webhookId, // Always include webhookId
          },
          eventActive: false,
          yaml: '{}', // Empty YAML - will be populated when user adds workflow steps
        },
      },
      {
        onSuccess: () => {
          // Reset form
          setName('');
          setDescription('');
          setTriggerType('SCHEDULE');
          setTriggerParams({ expression: '0 9 * * 1' });
          onOpenChange(false);
        },
      },
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createEvent.isPending) {
      // Reset form when closing
      setName('');
      setDescription('');
      setTriggerType('SCHEDULE');
      setTriggerParams({ expression: '0 9 * * 1' });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{m.workflowEvents_dialog_createTitle()}</DialogTitle>
          <DialogDescription className="text-sm">{m.workflowEvents_dialog_createDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div className="space-y-1.5">
            <Label htmlFor="event-name" className="text-sm font-medium">
              {m.workflowEvents_form_nameLabel()}
            </Label>
            <Input
              id="event-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={m.workflowEvents_form_namePlaceholder()}
              required
              maxLength={100}
              disabled={createEvent.isPending}
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="event-description" className="text-sm font-medium">
              {m.workflowEvents_form_descriptionLabel()}
            </Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={m.workflowEvents_form_descriptionPlaceholder()}
              rows={2}
              maxLength={500}
              disabled={createEvent.isPending}
              className="text-sm resize-none"
            />
          </div>

          {/* Trigger Configuration */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-semibold">{m.workflowEvents_dialog_triggerConfig()}</h3>
            <TriggerConfigForm
              workspaceId={workspaceId}
              triggerType={triggerType}
              triggerParams={triggerParams}
              onTriggerTypeChange={setTriggerType}
              onTriggerParamsChange={setTriggerParams}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={createEvent.isPending}
            >
              {m.common_cancel()}
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim() || createEvent.isPending}>
              {createEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {m.workflowEvents_createButton()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
