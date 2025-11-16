/**
 * Workflow Form Detail Page
 *
 * Form builder/editor for creating and editing workflow forms.
 * Two-panel layout with config (left) and preview (right).
 */

import { useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { ROUTES } from '@/shared/route-paths';

import { useWorkflowForm, useUpdateWorkflowForm, useDeleteWorkflowForm } from '../hooks';
import { useFormBuilderStore } from '../stores/form-builder-store';
import { FormBuilderLayout } from '../components/form-builder-layout';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.FORM_DETAIL);

export function WorkflowFormDetail() {
  const { workspaceId, formId, locale } = route.useParams();
  const navigate = route.useNavigate();

  const { data, isLoading, error } = useWorkflowForm(workspaceId, formId);
  const updateMutation = useUpdateWorkflowForm(workspaceId);
  const deleteMutation = useDeleteWorkflowForm(workspaceId);

  const { title, submitButtonText, fields, setConfig, reset } = useFormBuilderStore();

  const form = data?.data;

  // Initialize form builder state from API data
  useEffect(() => {
    if (form?.config) {
      setConfig(form.config);
    }
    return () => reset();
  }, [form?.config, setConfig, reset]);

  const handleSave = async () => {
    if (!form) return;

    try {
      await updateMutation.mutateAsync({
        formId,
        payload: {
          name: title || form.name,
          description: form.description,
          config: {
            title: title || form.name,
            fields,
            submitButton: {
              text: submitButtonText,
            },
          },
        },
      });

      // Show success message (toast notification)
      console.log('Form saved successfully');
    } catch (err) {
      console.error('Failed to save form:', err);
      // Show error message (toast notification)
    }
  };

  const handleDelete = async () => {
    if (!form) return;

    const confirmed = confirm(`Xóa vĩnh viễn form "${form.name}"? Không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(formId);

      // Navigate to list view
      navigate({
        to: ROUTES.WORKFLOW_FORMS.LIST,
        params: { locale, workspaceId },
      });
    } catch (err) {
      console.error('Failed to delete form:', err);
      // Show error message (toast notification)
    }
  };

  if (error) {
    throw error; // Caught by error boundary
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Form không tồn tại.</p>
      </div>
    );
  }

  return (
    <FormBuilderLayout
      form={form}
      onSave={handleSave}
      onDelete={handleDelete}
      isSaving={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
}
