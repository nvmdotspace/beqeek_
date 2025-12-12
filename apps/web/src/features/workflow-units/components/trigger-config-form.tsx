/**
 * TriggerConfigForm Component
 *
 * Simplified trigger configuration form for workflow events.
 * Displays trigger type and basic configuration fields.
 *
 * NOTE: This is a Phase 4 foundation. Full implementations of individual
 * trigger forms (Schedule, Webhook, Form, Table) will be added in future phases.
 */

import { useState, useEffect } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { InfoIcon } from 'lucide-react';
import type { EventSourceType, EventSourceParams } from '../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface TriggerConfigFormProps {
  workspaceId: string;
  triggerType: EventSourceType;
  triggerParams: EventSourceParams;
  onTriggerTypeChange: (type: EventSourceType) => void;
  onTriggerParamsChange: (params: EventSourceParams) => void;
}

const getTriggerTypeLabel = (type: EventSourceType): string => {
  const labels: Record<EventSourceType, () => string> = {
    SCHEDULE: () => m.workflowTrigger_type_schedule(),
    WEBHOOK: () => m.workflowTrigger_type_webhook(),
    OPTIN_FORM: () => m.workflowTrigger_type_form(),
    ACTIVE_TABLE: () => m.workflowTrigger_type_table(),
  };
  return labels[type]();
};

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
        <Label>{m.workflowTrigger_type_label()}</Label>
        <Select value={triggerType} onValueChange={(value) => onTriggerTypeChange(value as EventSourceType)}>
          <SelectTrigger>
            <SelectValue placeholder={m.workflowTrigger_type_placeholder()}>
              {getTriggerTypeLabel(triggerType)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SCHEDULE">{m.workflowTrigger_type_schedule()}</SelectItem>
            <SelectItem value="WEBHOOK">{m.workflowTrigger_type_webhook()}</SelectItem>
            <SelectItem value="OPTIN_FORM">{m.workflowTrigger_type_form()}</SelectItem>
            <SelectItem value="ACTIVE_TABLE">{m.workflowTrigger_type_table()}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progressive Disclosure based on trigger type */}
      {triggerType === 'SCHEDULE' && (
        <ScheduleTriggerFields
          params={triggerParams as { expression: string }}
          onChange={(params) => onTriggerParamsChange(params)}
        />
      )}

      {triggerType === 'WEBHOOK' && (
        <WebhookTriggerFields
          params={triggerParams as { webhookId: string }}
          onChange={(params) => onTriggerParamsChange(params)}
        />
      )}

      {triggerType === 'OPTIN_FORM' && (
        <FormTriggerFields
          _workspaceId={workspaceId}
          params={triggerParams as { formId: string; webhookId: string; actionId?: string }}
          onChange={(params) => onTriggerParamsChange(params)}
        />
      )}

      {triggerType === 'ACTIVE_TABLE' && (
        <TableTriggerFields
          _workspaceId={workspaceId}
          params={triggerParams as { tableId: string; actionId: string; webhookId: string }}
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
        <Label htmlFor="cron-expression">{m.workflowTrigger_cronExpression_label()}</Label>
        <Input
          id="cron-expression"
          value={expression}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0 9 * * 1"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">{m.workflowTrigger_cronExpression_hint()}</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>{m.workflowTrigger_schedule_alert()}</AlertDescription>
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
  // Use stable webhookId - only generate once if not provided
  const [webhookId] = useState(() => params?.webhookId || crypto.randomUUID());

  // Sync generated webhookId to parent on mount
  useEffect(() => {
    if (!params?.webhookId && webhookId) {
      onChange({ webhookId });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhook-id">{m.workflowTrigger_webhookId_label()}</Label>
        <Input id="webhook-id" value={webhookId} readOnly className="font-mono bg-muted" />
        <p className="text-xs text-muted-foreground">{m.workflowTrigger_webhookId_hint()}</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>{m.workflowTrigger_webhook_alert()}</AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Form Trigger Fields (Simplified)
 */
function FormTriggerFields({
  _workspaceId,
  params,
  onChange,
}: {
  _workspaceId: string;
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
        <Label htmlFor="form-id">{m.workflowTrigger_formId_label()}</Label>
        <Input
          id="form-id"
          value={formId}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={m.workflowTrigger_formId_placeholder()}
        />
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>{m.workflowTrigger_form_alert()}</AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Table Trigger Fields (Simplified)
 */
function TableTriggerFields({
  _workspaceId,
  params,
  onChange,
}: {
  _workspaceId: string;
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
        <Label htmlFor="table-id">{m.workflowTrigger_tableId_label()}</Label>
        <Input
          id="table-id"
          value={tableId}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={m.workflowTrigger_tableId_placeholder()}
        />
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>{m.workflowTrigger_table_alert()}</AlertDescription>
      </Alert>
    </div>
  );
}
