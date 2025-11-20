import { apiClient } from '@/shared/api/http-client';
import type { WorkflowUnit, CreateWorkflowUnitRequest, UpdateWorkflowUnitRequest } from './types';

const getBasePath = (workspaceId: string) => `/api/workspace/${workspaceId}/workflow`;

export const workflowUnitsApi = {
  /**
   * Get list of workflow units
   */
  async getWorkflowUnits(workspaceId: string): Promise<WorkflowUnit[]> {
    const response = await apiClient.post<{ data: WorkflowUnit[] }>(`${getBasePath(workspaceId)}/get/workflow_units`);
    return response.data.data;
  },

  /**
   * Get single workflow unit by ID
   */
  async getWorkflowUnit(workspaceId: string, unitId: string): Promise<WorkflowUnit> {
    const response = await apiClient.post<WorkflowUnit>(`${getBasePath(workspaceId)}/get/workflow_units/${unitId}`);
    return response.data;
  },

  /**
   * Create new workflow unit
   */
  async createWorkflowUnit(workspaceId: string, data: CreateWorkflowUnitRequest): Promise<WorkflowUnit> {
    const response = await apiClient.post<WorkflowUnit>(`${getBasePath(workspaceId)}/post/workflow_units`, data);
    return response.data;
  },

  /**
   * Update existing workflow unit
   */
  async updateWorkflowUnit(
    workspaceId: string,
    unitId: string,
    data: UpdateWorkflowUnitRequest,
  ): Promise<WorkflowUnit> {
    const response = await apiClient.post<WorkflowUnit>(
      `${getBasePath(workspaceId)}/patch/workflow_units/${unitId}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete workflow unit
   */
  async deleteWorkflowUnit(workspaceId: string, unitId: string): Promise<void> {
    await apiClient.post(`${getBasePath(workspaceId)}/delete/workflow_units/${unitId}`);
  },
};
