// Workflow Unit types
export interface WorkflowUnit {
  id: string; // Snowflake ID
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowUnitRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkflowUnitRequest {
  name?: string;
  description?: string;
}

// Workflow Event types
export type EventSourceType = 'SCHEDULE' | 'WEBHOOK' | 'OPTIN_FORM' | 'ACTIVE_TABLE';

export interface WorkflowEvent {
  id: string; // Snowflake ID
  workflowUnit: string; // Unit ID
  eventName: string;
  eventSourceType: EventSourceType;
  eventSourceParams: EventSourceParams;
  eventActive: boolean;
  yaml: string; // YAML content
  responseId: string; // UUID for WebSocket
  createdAt: string;
  updatedAt: string;
}

export type EventSourceParams = ScheduleParams | WebhookParams | OptinFormParams | ActiveTableParams;

export interface ScheduleParams {
  expression: string; // Cron expression
}

export interface WebhookParams {
  webhookId: string; // UUID
}

export interface OptinFormParams {
  formId: string; // Snowflake ID
  webhookId: string; // UUID
  actionId?: string; // UUID (optional)
}

export interface ActiveTableParams {
  tableId: string; // Snowflake ID
  actionId: string; // UUID
  webhookId: string; // UUID (same as actionId)
}

export interface CreateWorkflowEventRequest {
  workflowUnit: string;
  eventName: string;
  eventSourceType: EventSourceType;
  eventSourceParams: EventSourceParams;
  eventActive?: boolean;
  yaml?: string;
}

export interface UpdateWorkflowEventRequest {
  eventName?: string;
  eventSourceType?: EventSourceType;
  eventSourceParams?: EventSourceParams;
  eventActive?: boolean;
  yaml?: string;
}

// Helper types for UI
export interface WorkflowForm {
  id: string;
  name: string;
}

export interface ActiveTable {
  id: string;
  name: string;
  actions?: TableAction[];
}

export interface TableAction {
  id: string;
  name: string;
  type: string;
}
