/**
 * Workflow Forms Template Selection Page
 *
 * Displays form templates for selection (BASIC, SUBSCRIPTION, SURVEY).
 * Features: search/filter templates, create dialog on selection.
 */

import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';

import { ROUTES } from '@/shared/route-paths';

import { FORM_TYPES } from '../constants';
import { FormTemplateCard } from '../components/form-template-card';
import { CreateFormDialog } from '../components/create-form-dialog';
import { EmptyState } from '../components/empty-state';

import type { FormType } from '../types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-forms/select');

export function WorkflowFormsSelect() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FormType | null>(null);

  const filteredTemplates = FORM_TYPES.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Chọn Mẫu Form</h1>
        <Button
          variant="outline"
          onClick={() =>
            navigate({
              to: ROUTES.WORKFLOW_FORMS.LIST,
              params: { locale, workspaceId },
            })
          }
        >
          Xem danh sách
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm mẫu form..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 max-w-md border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
      />

      {filteredTemplates.length === 0 ? (
        <EmptyState message="Không tìm thấy mẫu form nào" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <FormTemplateCard
              key={template.type}
              template={template}
              onSelect={() => setSelectedTemplate(template.type)}
            />
          ))}
        </div>
      )}

      <CreateFormDialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        templateType={selectedTemplate}
        workspaceId={workspaceId}
      />
    </div>
  );
}
