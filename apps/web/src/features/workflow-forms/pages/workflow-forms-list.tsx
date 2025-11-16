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

import { ROUTES } from '@/shared/route-paths';
import { useSidebarStore, selectCurrentWorkspace } from '@/stores/sidebar-store';

import { useWorkflowForms } from '../hooks';
import { FormListItem } from '../components/form-list-item';
import { FormListSkeleton } from '../components/form-list-skeleton';
import { EmptyState } from '../components/empty-state';
import type { FormType } from '../types';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.LIST);

export function WorkflowFormsList() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const [searchQuery, setSearchQuery] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<FormType | 'all'>('all');

  const { data, isLoading, error } = useWorkflowForms(workspaceId);
  const forms = data?.data ?? [];

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
    <div className="space-y-6 p-6">
      {/* Header Section - Matching Active Tables pattern */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <Heading level={1}>Biểu mẫu</Heading>
            <Text size="small" color="muted">
              {currentWorkspace?.workspaceName
                ? `Workspace • ${currentWorkspace.workspaceName}`
                : 'Quản lý biểu mẫu workflow'}
            </Text>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm form theo tên hoặc mô tả..."
                className="h-10 rounded-lg border-border/60 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="brand-primary"
                size="sm"
                onClick={() => navigate({ to: ROUTES.WORKFLOW_FORMS.SELECT, params: { locale, workspaceId } })}
              >
                Tạo Form
              </Button>
            </div>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>{totalForms} biểu mẫu</span>
          </Badge>
        </div>
      </div>

      {/* Filter Section - Matching Active Tables pattern */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-dashed">
            {filteredForms.length} biểu mẫu
          </Badge>
          <div className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-foreground">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {activeFilterCount ? `${activeFilterCount} filter active` : 'No filters applied'}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="space-y-3">
            {/* Form Type Filter */}
            <div className="flex items-start gap-3">
              <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1.5">
                Loại form
              </Text>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                <FilterChip active={formTypeFilter === 'all'} onClick={() => setFormTypeFilter('all')}>
                  Tất cả
                </FilterChip>
                <FilterChip active={formTypeFilter === 'BASIC'} onClick={() => setFormTypeFilter('BASIC')}>
                  Cơ bản ({formTypeCounts.BASIC})
                </FilterChip>
                <FilterChip
                  active={formTypeFilter === 'SUBSCRIPTION'}
                  onClick={() => setFormTypeFilter('SUBSCRIPTION')}
                >
                  Đăng ký ({formTypeCounts.SUBSCRIPTION})
                </FilterChip>
                <FilterChip
                  active={formTypeFilter === 'SURVEY'}
                  onClick={() => setFormTypeFilter('SURVEY')}
                  variant="warning"
                >
                  Khảo sát ({formTypeCounts.SURVEY})
                </FilterChip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
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
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredForms.map((form) => (
            <FormListItem key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}
