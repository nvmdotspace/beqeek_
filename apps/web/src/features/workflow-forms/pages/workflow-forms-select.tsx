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
import { Search } from 'lucide-react';

import { ROUTES } from '@/shared/route-paths';

import { FORM_TYPES } from '../constants';
import { FormTemplateCard } from '../components/form-template-card';
import { CreateFormDialog } from '../components/create-form-dialog';
import { EmptyState } from '../components/empty-state';

import type { FormType } from '../types';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.SELECT);

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold tracking-tight">Chọn Mẫu Form</h1>
            </div>
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mẫu form..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Templates Grid - Compact 2-column layout for better readability */}
          {filteredTemplates.length === 0 ? (
            <EmptyState message="Không tìm thấy mẫu form nào" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredTemplates.map((template) => (
                <FormTemplateCard
                  key={template.type}
                  template={template}
                  onSelect={() => setSelectedTemplate(template.type)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateFormDialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        templateType={selectedTemplate}
        workspaceId={workspaceId}
      />
    </div>
  );
}
