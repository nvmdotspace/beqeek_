/**
 * TriggerConfigForm Component
 *
 * Simplified trigger configuration form for workflow events.
 * Displays trigger type and basic configuration fields.
 *
 * NOTE: This is a Phase 4 foundation. Full implementations of individual
 * trigger forms (Schedule, Webhook, Form, Table) will be added in future phases.
 */

import { useState } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { InfoIcon } from 'lucide-react';
import type { EventSourceType, EventSourceParams } from '../api/types';

interface TriggerConfigFormProps {
  workspaceId: string;
  triggerType: EventSourceType;
  triggerParams: EventSourceParams;
  onTriggerTypeChange: (type: EventSourceType) => void;
  onTriggerParamsChange: (params: EventSourceParams) => void;
}

export function TriggerConfigForm({
  workspaceId,
  triggerType,
  triggerParams,
  onTriggerTypeChange,
  onTriggerParamsChange,
}: TriggerConfigFormProps) {
  return (
    <div className="space-y-6">
      {/* Trigger Type Selector */}
      <div className="space-y-2">
        <Label>Trigger Type</Label>
        <Select value={triggerType} onValueChange={(value) => onTriggerTypeChange(value as EventSourceType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SCHEDULE">Schedule (Cron)</SelectItem>
            <SelectItem value="WEBHOOK">Webhook</SelectItem>
            <SelectItem value="OPTIN_FORM">Form Submission</SelectItem>
            <SelectItem value="ACTIVE_TABLE">Table Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progressive Disclosure based on trigger type */}
      {triggerType === 'SCHEDULE' && (
        <ScheduleTriggerFields params={triggerParams as any} onChange={(params) => onTriggerParamsChange(params)} />
      )}

      {triggerType === 'WEBHOOK' && (
        <WebhookTriggerFields params={triggerParams as any} onChange={(params) => onTriggerParamsChange(params)} />
      )}

      {triggerType === 'OPTIN_FORM' && (
        <FormTriggerFields
          workspaceId={workspaceId}
          params={triggerParams as any}
          onChange={(params) => onTriggerParamsChange(params)}
        />
      )}

      {triggerType === 'ACTIVE_TABLE' && (
        <TableTriggerFields
          workspaceId={workspaceId}
          params={triggerParams as any}
          onChange={(params) => onTriggerParamsChange(params)}
        />
      )}
    </div>
  );
}

/**
 * Schedule Trigger Fields (Simplified)
 */
function ScheduleTriggerFields({
  params,
  onChange,
}: {
  params: { expression: string };
  onChange: (params: { expression: string }) => void;
}) {
  const [expression, setExpression] = useState(params?.expression || '0 9 * * 1');

  const handleChange = (value: string) => {
    setExpression(value);
    onChange({ expression: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cron-expression">Cron Expression</Label>
        <Input
          id="cron-expression"
          value={expression}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0 9 * * 1"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">Example: "0 9 * * 1" runs every Monday at 9 AM</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Advanced cron builder with timezone selection will be available in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Webhook Trigger Fields (Simplified)
 */
function WebhookTriggerFields({
  params,
  onChange,
}: {
  params: { webhookId: string };
  onChange: (params: { webhookId: string }) => void;
}) {
  const webhookId = params?.webhookId || crypto.randomUUID();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhook-id">Webhook ID</Label>
        <Input id="webhook-id" value={webhookId} readOnly className="font-mono bg-muted" />
        <p className="text-xs text-muted-foreground">This ID will be used to generate the webhook URL</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Webhook URL display, security token management, and HTTP method selection will be available in a future
          update.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Form Trigger Fields (Simplified)
 */
function FormTriggerFields({
  workspaceId,
  params,
  onChange,
}: {
  workspaceId: string;
  params: { formId: string; webhookId: string; actionId?: string };
  onChange: (params: { formId: string; webhookId: string; actionId?: string }) => void;
}) {
  const [formId, setFormId] = useState(params?.formId || '');

  const handleChange = (value: string) => {
    setFormId(value);
    onChange({
      formId: value,
      webhookId: params?.webhookId || crypto.randomUUID(),
      actionId: params?.actionId,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="form-id">Form ID</Label>
        <Input id="form-id" value={formId} onChange={(e) => handleChange(e.target.value)} placeholder="Enter form ID" />
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Form selection dropdown, action checkboxes (submit/approve/reject), and field conditions will be available in
          a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Table Trigger Fields (Simplified)
 */
function TableTriggerFields({
  workspaceId,
  params,
  onChange,
}: {
  workspaceId: string;
  params: { tableId: string; actionId: string; webhookId: string };
  onChange: (params: { tableId: string; actionId: string; webhookId: string }) => void;
}) {
  const [tableId, setTableId] = useState(params?.tableId || '');

  const handleChange = (value: string) => {
    setTableId(value);
    const actionId = params?.actionId || crypto.randomUUID();
    onChange({
      tableId: value,
      actionId,
      webhookId: actionId, // Same as actionId per API spec
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="table-id">Table ID</Label>
        <Input
          id="table-id"
          value={tableId}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter table ID"
        />
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Table selection dropdown, action checkboxes (create/update/delete), and field conditions will be available in
          a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
