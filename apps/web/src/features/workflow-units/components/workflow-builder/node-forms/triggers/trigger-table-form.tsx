/**
 * TriggerTableForm - Active Table trigger configuration
 *
 * Configures which table action triggers this workflow.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Info } from 'lucide-react';
import { FormField } from '../form-field';

interface TriggerTableFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function TriggerTableForm({ data, onUpdate }: TriggerTableFormProps) {
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'table_trigger';
  const tableId = (config.tableId as string) || '';
  const actionId = (config.actionId as string) || '';
  const webhookId = (config.webhookId as string) || '';

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="trigger-name" description="Unique identifier for this trigger" required>
        <Input
          id="trigger-name"
          value={name}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="table_trigger"
        />
      </FormField>

      <FormField label="Table ID" htmlFor="trigger-table-id" description="Snowflake ID of the Active Table" required>
        <Input
          id="trigger-table-id"
          value={tableId}
          onChange={(e) => updateConfig({ tableId: e.target.value })}
          placeholder="Enter table ID"
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Action Type"
        htmlFor="trigger-action-type"
        description="Which table action triggers this workflow"
        required
      >
        <Select value={actionId || 'create'} onValueChange={(value) => updateConfig({ actionId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">On Record Create</SelectItem>
            <SelectItem value="update">On Record Update</SelectItem>
            <SelectItem value="delete">On Record Delete</SelectItem>
            <SelectItem value="comment_create">On Comment Create</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Webhook ID" htmlFor="trigger-webhook-id" description="UUID for the table webhook">
        <Input
          id="trigger-webhook-id"
          value={webhookId}
          onChange={(e) => updateConfig({ webhookId: e.target.value })}
          placeholder="Auto-generated UUID"
          className="font-mono text-sm"
        />
      </FormField>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Table selector with list of Active Tables will be available in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
