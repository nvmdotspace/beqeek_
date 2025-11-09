import { apiRequest } from '@/shared/api/http-client';

export interface ActionTriggerRequest {
  responseId: string;
  workflowData: Record<string, unknown>;
  extraData?: Record<string, unknown>;
}

export interface ActionResponse {
  message: string;
  data?: Record<string, unknown>;
}

// Endpoints
const triggerActionEndpoint = (workspaceId: string, tableId: string, recordId: string, actionId: string) =>
  `/api/workspace/${workspaceId}/workflow/post/active_tables/${tableId}/records/${recordId}/action/${actionId}`;

// Action operations
export const triggerRecordAction = (
  workspaceId: string,
  tableId: string,
  recordId: string,
  actionId: string,
  request: ActionTriggerRequest,
) =>
  apiRequest<ActionResponse>({
    url: triggerActionEndpoint(workspaceId, tableId, recordId, actionId),
    method: 'POST',
    data: request,
  });

// Helper function to generate response ID
export const generateResponseId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
};

// Helper function to prepare workflow data
export const prepareWorkflowData = (record: Record<string, unknown>): Record<string, unknown> => {
  return {
    ...record,
    timestamp: new Date().toISOString(),
  };
};
