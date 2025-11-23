import { apiClient } from '@/shared/api/http-client';
import type {
  WorkflowEvent,
  CreateWorkflowEventRequest,
  UpdateWorkflowEventRequest,
  WorkflowForm,
  ActiveTable,
} from './types';

const getBasePath = (workspaceId: string) => `/api/workspace/${workspaceId}/workflow`;

export const workflowEventsApi = {
  /**
   * Get list of workflow events (optionally filter by unit ID)
   */
  async getWorkflowEvents(workspaceId: string, unitId?: string): Promise<WorkflowEvent[]> {
    const response = await apiClient.post<{ data: WorkflowEvent[] }>(
      `${getBasePath(workspaceId)}/get/workflow_events`,
      {
        filtering: { workflowUnit: unitId },
      },
    );
    return response.data.data;
  },

  /**
   * Get single workflow event by ID
   */
  async getWorkflowEvent(workspaceId: string, eventId: string): Promise<WorkflowEvent> {
    const response = await apiClient.post<{ data: WorkflowEvent }>(
      `${getBasePath(workspaceId)}/get/workflow_events/${eventId}`,
    );
    return response.data.data;
  },

  /**
   * Create new workflow event
   */
  async createWorkflowEvent(workspaceId: string, data: CreateWorkflowEventRequest): Promise<WorkflowEvent> {
    const response = await apiClient.post<WorkflowEvent>(`${getBasePath(workspaceId)}/post/workflow_events`, data);
    return response.data;
  },

  /**
   * Update existing workflow event
   */
  async updateWorkflowEvent(
    workspaceId: string,
    eventId: string,
    data: UpdateWorkflowEventRequest,
  ): Promise<WorkflowEvent> {
    const response = await apiClient.post<WorkflowEvent>(
      `${getBasePath(workspaceId)}/patch/workflow_events/${eventId}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete workflow event
   */
  async deleteWorkflowEvent(workspaceId: string, eventId: string): Promise<void> {
    await apiClient.post(`${getBasePath(workspaceId)}/delete/workflow_events/${eventId}`);
  },

  /**
   * Toggle event active status
   */
  async toggleEventActive(workspaceId: string, eventId: string, active: boolean): Promise<WorkflowEvent> {
    const response = await apiClient.post<WorkflowEvent>(
      `${getBasePath(workspaceId)}/patch/workflow_events/${eventId}`,
      { eventActive: active },
    );
    return response.data;
  },

  /**
   * Get list of workflow forms (helper for OPTIN_FORM trigger)
   */
  async getWorkflowForms(workspaceId: string): Promise<WorkflowForm[]> {
    const response = await apiClient.post<WorkflowForm[]>(`${getBasePath(workspaceId)}/get/workflow_forms`);
    return response.data;
  },

  /**
   * Get list of active tables (helper for ACTIVE_TABLE trigger)
   */
  async getActiveTables(workspaceId: string): Promise<ActiveTable[]> {
    const response = await apiClient.post<ActiveTable[]>(`${getBasePath(workspaceId)}/get/active_tables`);
    return response.data;
  },

  /**
   * Get single active table with actions (helper for ACTIVE_TABLE trigger)
   */
  async getActiveTable(workspaceId: string, tableId: string): Promise<ActiveTable> {
    const response = await apiClient.post<ActiveTable>(`${getBasePath(workspaceId)}/get/active_tables/${tableId}`);
    return response.data;
  },
};
