/**
 * TriggerFormForm - Form submission trigger configuration
 *
 * Configures which workflow form triggers this event.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Info } from 'lucide-react';
import { FormField } from '../form-field';

interface TriggerFormFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function TriggerFormForm({ data, onUpdate }: TriggerFormFormProps) {
  const name = (data.name as string) || 'form_trigger';
  const formId = (data.formId as string) || '';
  const webhookId = (data.webhookId as string) || '';
  const actionId = (data.actionId as string) || '';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="trigger-name" description="Unique identifier for this trigger" required>
        <Input
          id="trigger-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="form_trigger"
        />
      </FormField>

      <FormField label="Form ID" htmlFor="trigger-form-id" description="Snowflake ID of the workflow form" required>
        <Input
          id="trigger-form-id"
          value={formId}
          onChange={(e) => onUpdate({ formId: e.target.value })}
          placeholder="Enter form ID"
          className="font-mono"
        />
      </FormField>

      <FormField label="Webhook ID" htmlFor="trigger-webhook-id" description="UUID for the form webhook">
        <Input
          id="trigger-webhook-id"
          value={webhookId}
          onChange={(e) => onUpdate({ webhookId: e.target.value })}
          placeholder="Auto-generated UUID"
          className="font-mono text-sm"
        />
      </FormField>

      <FormField label="Action" htmlFor="trigger-action" description="Which form action triggers this workflow">
        <Select value={actionId || 'submit'} onValueChange={(value) => onUpdate({ actionId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="submit">On Submit</SelectItem>
            <SelectItem value="validate">On Validate</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Form selector with list of available workflow forms will be available in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
