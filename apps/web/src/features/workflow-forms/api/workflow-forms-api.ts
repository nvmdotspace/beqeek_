/**
 * Workflow Forms API Client
 *
 * API client for workflow forms CRUD operations.
 * Follows POST-based RPC pattern used in legacy implementation.
 *
 * All operations use POST method with verb in URL:
 * - GET operations: POST /api/workspace/{id}/workflow/get/workflow_forms
 * - CREATE: POST /api/workspace/{id}/workflow/post/workflow_forms
 * - UPDATE: POST /api/workspace/{id}/workflow/patch/workflow_forms/{formId}
 * - DELETE: POST /api/workspace/{id}/workflow/delete/workflow_forms/{formId}
 *
 * @see /docs/html-module/workflow-forms.blade.php (lines 417-471)
 * @see /docs/workflow-forms-functional-spec.md (lines 147-172)
 */

import { apiRequest } from '@/shared/api/http-client';

import type {
  FormCreatePayload,
  FormCreateResponse,
  FormDeleteResponse,
  FormDetailResponse,
  FormListResponse,
  FormUpdatePayload,
  FormUpdateResponse,
} from '../types';

/**
 * Build API path for workflow forms endpoints
 *
 * @param workspaceId - Workspace ID
 * @param verb - HTTP verb (get, post, patch, delete)
 * @param resource - Resource name (workflow_forms)
 * @param id - Optional resource ID
 * @returns Complete API path
 *
 * @example
 * ```typescript
 * getApiPath('ws123', 'get', 'workflow_forms')
 * // => '/api/workspace/ws123/workflow/get/workflow_forms'
 *
 * getApiPath('ws123', 'patch', 'workflow_forms', 'form456')
 * // => '/api/workspace/ws123/workflow/patch/workflow_forms/form456'
 * ```
 */
const getApiPath = (workspaceId: string, verb: string, resource: string, id?: string): string => {
  const base = `/api/workspace/${workspaceId}/workflow/${verb}/${resource}`;
  return id ? `${base}/${id}` : base;
};

/**
 * Fetch all workflow forms in a workspace
 *
 * @param workspaceId - Workspace ID
 * @returns Promise resolving to form list response
 *
 * @example
 * ```typescript
 * const { data } = await getWorkflowForms('workspace123');
 * console.log(data); // FormInstance[]
 * ```
 */
export const getWorkflowForms = async (workspaceId: string): Promise<FormListResponse> => {
  return apiRequest<FormListResponse>({
    method: 'POST',
    url: getApiPath(workspaceId, 'get', 'workflow_forms'),
  });
};

/**
 * Fetch single workflow form by ID
 *
 * @param workspaceId - Workspace ID
 * @param formId - Form ID
 * @returns Promise resolving to form detail response
 *
 * @throws {ApiError} If form not found or access denied
 *
 * @example
 * ```typescript
 * const { data } = await getWorkflowFormById('workspace123', 'form456');
 * console.log(data.name); // Form name
 * ```
 */
export const getWorkflowFormById = async (workspaceId: string, formId: string): Promise<FormDetailResponse> => {
  return apiRequest<FormDetailResponse>({
    method: 'POST',
    url: getApiPath(workspaceId, 'get', 'workflow_forms', formId),
  });
};

/**
 * Create a new workflow form
 *
 * @param workspaceId - Workspace ID
 * @param payload - Form creation data (name, description, formType, config)
 * @returns Promise resolving to create response with server-generated form ID
 *
 * @throws {ApiError} If validation fails or insufficient permissions
 *
 * @example
 * ```typescript
 * const { data, message } = await createWorkflowForm('workspace123', {
 *   name: 'Contact Form',
 *   description: 'Customer contact form',
 *   formType: 'BASIC',
 *   config: FORM_CONFIGS.BASIC,
 * });
 * console.log(data.id); // Server-generated form ID
 * console.log(message); // Success message
 * ```
 */
export const createWorkflowForm = async (
  workspaceId: string,
  payload: FormCreatePayload,
): Promise<FormCreateResponse> => {
  return apiRequest<FormCreateResponse, FormCreatePayload>({
    method: 'POST',
    url: getApiPath(workspaceId, 'post', 'workflow_forms'),
    data: payload,
  });
};

/**
 * Update an existing workflow form
 *
 * Overwrites entire form config (no versioning).
 *
 * @param workspaceId - Workspace ID
 * @param formId - Form ID to update
 * @param payload - Updated form data (name, description, config)
 * @returns Promise resolving to update response with success message
 *
 * @throws {ApiError} If form not found or insufficient permissions
 *
 * @example
 * ```typescript
 * const { message } = await updateWorkflowForm('workspace123', 'form456', {
 *   name: 'Updated Form Name',
 *   description: 'Updated description',
 *   config: updatedConfig,
 * });
 * console.log(message); // Success message
 * ```
 */
export const updateWorkflowForm = async (
  workspaceId: string,
  formId: string,
  payload: FormUpdatePayload,
): Promise<FormUpdateResponse> => {
  return apiRequest<FormUpdateResponse, FormUpdatePayload>({
    method: 'POST',
    url: getApiPath(workspaceId, 'patch', 'workflow_forms', formId),
    data: payload,
  });
};

/**
 * Delete a workflow form
 *
 * Permanently removes form and all its configuration.
 * Cannot be undone.
 *
 * @param workspaceId - Workspace ID
 * @param formId - Form ID to delete
 * @returns Promise resolving to delete response with success message
 *
 * @throws {ApiError} If form not found or insufficient permissions
 *
 * @example
 * ```typescript
 * const { message } = await deleteWorkflowForm('workspace123', 'form456');
 * console.log(message); // Success message
 * ```
 */
export const deleteWorkflowForm = async (workspaceId: string, formId: string): Promise<FormDeleteResponse> => {
  return apiRequest<FormDeleteResponse>({
    method: 'POST',
    url: getApiPath(workspaceId, 'delete', 'workflow_forms', formId),
  });
};
