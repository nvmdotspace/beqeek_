/**
 * Workflow Forms List Page
 *
 * Displays all workflow forms for a workspace.
 * Features: search/filter, loading states, empty states, navigation to create/detail.
 */

import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';

import { ROUTES } from '@/shared/route-paths';

import { useWorkflowForms } from '../hooks';
import { FormListItem } from '../components/form-list-item';
import { FormListSkeleton } from '../components/form-list-skeleton';
import { EmptyState } from '../components/empty-state';

// Using the generated route path for index routes (with trailing slash)
const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-forms/');

export function WorkflowFormsList() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useWorkflowForms(workspaceId);
  const forms = data?.data ?? [];

  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (error) {
    throw error; // Caught by error boundary
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Workflow Forms</h1>
        <Button
          onClick={() =>
            navigate({
              to: ROUTES.WORKFLOW_FORMS.SELECT,
              params: { locale, workspaceId },
            })
          }
        >
          Tạo Form
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm form theo tên hoặc mô tả..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 max-w-md border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
      />

      {isLoading ? (
        <FormListSkeleton count={6} />
      ) : filteredForms.length === 0 ? (
        <EmptyState
          message={searchQuery ? 'Không tìm thấy form nào' : 'Chưa có form nào'}
          action={
            !searchQuery ? (
              <Button
                onClick={() =>
                  navigate({
                    to: ROUTES.WORKFLOW_FORMS.SELECT,
                    params: { locale, workspaceId },
                  })
                }
              >
                Tạo form đầu tiên
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <FormListItem key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}
