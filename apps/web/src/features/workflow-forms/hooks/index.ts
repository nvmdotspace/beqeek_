/**
 * Workflow Forms Hooks
 *
 * Barrel export for all workflow forms React Query hooks.
 * Import from this file for cleaner imports.
 *
 * @example
 * ```typescript
 * import {
 *   useWorkflowForms,
 *   useWorkflowForm,
 *   useCreateWorkflowForm,
 *   useUpdateWorkflowForm,
 *   useDeleteWorkflowForm,
 * } from '@/features/workflow-forms/hooks';
 * ```
 */

// Query hooks
export { useWorkflowForms, workflowFormsQueryKey } from './use-workflow-forms';
export { useWorkflowForm, workflowFormQueryKey } from './use-workflow-form';

// Mutation hooks
export { useCreateWorkflowForm } from './use-create-workflow-form';
export { useUpdateWorkflowForm, type UpdateWorkflowFormParams } from './use-update-workflow-form';
export { useDeleteWorkflowForm } from './use-delete-workflow-form';
