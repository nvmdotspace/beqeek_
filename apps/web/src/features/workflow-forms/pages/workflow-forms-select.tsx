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
import { Heading } from '@workspace/ui/components/typography';
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';
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
        <Box padding="space-200" className="px-6">
          <div className="flex items-center justify-between">
            <Inline space="space-100" align="center">
              <Heading level={1}>Chọn Mẫu Form</Heading>
            </Inline>
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
        </Box>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Box padding="space-300" className="px-6">
          <Stack space="space-300">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mẫu form..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Templates Grid - Compact 2-column layout for better readability */}
            {filteredTemplates.length === 0 ? (
              <EmptyState message="Không tìm thấy mẫu form nào" />
            ) : (
              <Grid columns={1} gap="space-050" className="sm:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <FormTemplateCard
                    key={template.type}
                    template={template}
                    onSelect={() => setSelectedTemplate(template.type)}
                  />
                ))}
              </Grid>
            )}
          </Stack>
        </Box>
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
