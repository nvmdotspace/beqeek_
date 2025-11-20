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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workflow Event</DialogTitle>
          <DialogDescription>
            Create a new event to trigger your workflow. Configure the event name and trigger settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name *</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Daily customer sync"
                required
                maxLength={100}
                disabled={createEvent.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description (optional)</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Syncs customer data from CRM to database every day at 9 AM"
                rows={3}
                maxLength={500}
                disabled={createEvent.isPending}
              />
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-4">Trigger Configuration</h3>
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
              onClick={() => handleOpenChange(false)}
              disabled={createEvent.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createEvent.isPending}>
              {createEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
