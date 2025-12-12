/**
 * Workflow Forms List Page
 *
 * Displays all workflow forms for a workspace.
 * Features: search/filter, loading states, empty states, navigation to create/detail.
 */

import { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Badge } from '@workspace/ui/components/badge';
import { FilterChip } from '@workspace/ui/components/filter-chip';
import { Search, Filter, FileText } from 'lucide-react';
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';

import { ROUTES } from '@/shared/route-paths';
import { useSidebarStore } from '@/stores/sidebar-store';

import { useWorkflowForms } from '../hooks';
import { FormListItem } from '../components/form-list-item';
import { FormListSkeleton } from '../components/form-list-skeleton';
import { EmptyState } from '../components/empty-state';
import { CreateFormDialog } from '../components/create-form-dialog';
import type { FormType } from '../types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.LIST);

export function WorkflowFormsList() {
  const { workspaceId, locale: _locale } = route.useParams();
  const _navigate = route.useNavigate();
  const currentWorkspace = useSidebarStore((state) => state.currentWorkspace);
  const [searchQuery, setSearchQuery] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<FormType | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, error } = useWorkflowForms(workspaceId);
  const forms = useMemo(() => data?.data ?? [], [data?.data]);

  // Calculate stats
  const totalForms = forms.length;
  const formTypeCounts = useMemo(() => {
    const counts = { BASIC: 0, SUBSCRIPTION: 0, SURVEY: 0 };
    forms.forEach((form) => {
      counts[form.formType] = (counts[form.formType] || 0) + 1;
    });
    return counts;
  }, [forms]);

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = formTypeFilter === 'all' || form.formType === formTypeFilter;
    return matchesSearch && matchesType;
  });

  if (error) {
    throw error; // Caught by error boundary
  }

  const activeFilterCount = formTypeFilter !== 'all' ? 1 : 0;

  return (
    <Box padding="space-300">
      <Stack space="space-300">
        {/* Header Section - Matching Active Tables pattern */}
        {/* TODO: Migrate to primitives when responsive gap support is added */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Stack space="space-025">
            <Heading level={1}>{m.workflowForms_page_title()}</Heading>
            <Text size="small" color="muted">
              {currentWorkspace?.workspaceName
                ? `Workspace • ${currentWorkspace.workspaceName}`
                : m.workflowForms_page_subtitle()}
            </Text>
          </Stack>

          {/* TODO: Migrate to primitives when responsive gap support is added */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={m.workflowForms_page_searchPlaceholder()}
                className="h-10 rounded-lg border-border/60 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="brand-primary" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              {m.workflowForms_page_createButton()}
            </Button>
          </div>
        </div>

        {/* Stats badges */}
        <Inline space="space-250" align="center" wrap className="gap-y-[var(--space-250)]">
          <Badge variant="outline" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>{m.workflowForms_page_formsCount({ count: totalForms })}</span>
          </Badge>
        </Inline>

        {/* Filter Section - Matching Active Tables pattern */}
        <Stack space="space-100">
          <Inline space="space-050" wrap className="text-xs text-muted-foreground">
            <Badge variant="outline" className="border-dashed">
              {m.workflowForms_page_formsCount({ count: filteredForms.length })}
            </Badge>
            <div className="rounded-full border border-border/60 text-xs text-foreground">
              <Box padding="space-025" className="px-3">
                <Inline space="space-050" align="center">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  {activeFilterCount
                    ? m.workflowForms_page_filterActive({ count: activeFilterCount })
                    : m.workflowForms_page_noFilters()}
                </Inline>
              </Box>
            </div>
          </Inline>

          <Box padding="space-100" backgroundColor="card" borderRadius="xl" border="default" className="shadow-sm">
            <Stack space="space-100">
              {/* Form Type Filter */}
              <Inline space="space-100" align="start">
                <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1">
                  {m.workflowForms_page_filterLabel()}
                </Text>
                <Inline space="space-075" wrap align="center" className="flex-1">
                  <FilterChip active={formTypeFilter === 'all'} onClick={() => setFormTypeFilter('all')}>
                    {m.workflowForms_page_filterAll()}
                  </FilterChip>
                  <FilterChip active={formTypeFilter === 'BASIC'} onClick={() => setFormTypeFilter('BASIC')}>
                    {m.workflowForms_type_basicWithCount({ count: formTypeCounts.BASIC })}
                  </FilterChip>
                  <FilterChip
                    active={formTypeFilter === 'SUBSCRIPTION'}
                    onClick={() => setFormTypeFilter('SUBSCRIPTION')}
                  >
                    {m.workflowForms_type_subscriptionWithCount({ count: formTypeCounts.SUBSCRIPTION })}
                  </FilterChip>
                  <FilterChip
                    active={formTypeFilter === 'SURVEY'}
                    onClick={() => setFormTypeFilter('SURVEY')}
                    variant="warning"
                  >
                    {m.workflowForms_type_surveyWithCount({ count: formTypeCounts.SURVEY })}
                  </FilterChip>
                </Inline>
              </Inline>
            </Stack>
          </Box>
        </Stack>

        {/* Forms Grid */}
        {isLoading ? (
          <FormListSkeleton count={6} />
        ) : filteredForms.length === 0 ? (
          <EmptyState
            message={searchQuery ? m.workflowForms_empty_noResults() : m.workflowForms_empty_noForms()}
            action={
              !searchQuery ? (
                <Button onClick={() => setIsCreateDialogOpen(true)}>{m.workflowForms_empty_createFirst()}</Button>
              ) : undefined
            }
          />
        ) : (
          <Grid
            columns={1}
            gap="space-100"
            className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {filteredForms.map((form) => (
              <FormListItem key={form.id} form={form} />
            ))}
          </Grid>
        )}
      </Stack>

      <CreateFormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        workspaceId={workspaceId}
      />
    </Box>
  );
}
