import { useMemo, useState } from 'react';

import { Folder, Zap, Users, Table } from 'lucide-react';

import { useWorkspaces } from '../hooks/use-workspaces';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Inline, Stack } from '@workspace/ui/components/primitives';

import { WorkspaceCreateForm } from '../components/workspace-create-form';
import { WorkspaceEmptyState } from '../components/workspace-empty-state';
import { WorkspaceGrid } from '../components/workspace-grid';
import { StatBadge } from '../components/stat-badge';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export const WorkspaceDashboardPage = () => {
  const { data, isLoading, error } = useWorkspaces();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const totalWorkspaces = data?.meta?.total ?? data?.data?.length ?? 0;
  const workspaces = data?.data ?? [];

  const subtitle = useMemo(() => {
    if (isLoading) return m.workspace_dashboard_loading();
    if (error) return m.workspace_dashboard_error();
    if (totalWorkspaces === 0) return m.workspace_dashboard_noWorkspacesSubtitle();
    return `${totalWorkspaces} ${m.workspace_dashboard_activeWorkspaces()}`;
  }, [error, isLoading, totalWorkspaces]);

  return (
    <div className="p-[var(--space-400)]">
      <Stack space="space-600">
        {/* Page Title */}
        <div>
          <Heading level={2} className="text-2xl font-bold">
            {m.workspace_dashboard_title()}
          </Heading>
        </div>

        {/* Quick Summary Stats */}
        {!isLoading && !error && totalWorkspaces > 0 && (
          <Stack space="space-300">
            <Heading level={3} className="text-lg font-semibold">
              Tổng quan
            </Heading>
            <Inline space="space-250" align="center" wrap className="gap-y-[var(--space-250)]">
              <StatBadge
                icon={Folder}
                value={totalWorkspaces}
                label={m.workspace_dashboard_totalWorkspaces()}
                color="accent-blue"
                loading={isLoading}
              />
              <StatBadge icon={Table} value={24} label="Modules" color="primary" loading={isLoading} />
              <StatBadge icon={Zap} value={8} label="Workflows" color="accent-purple" loading={isLoading} />
              <StatBadge
                icon={Users}
                value={15}
                label={m.workspace_dashboard_teamMembers()}
                color="warning"
                loading={isLoading}
              />
            </Inline>
          </Stack>
        )}

        {/* Create Form */}
        {showCreateForm && totalWorkspaces > 0 && (
          <Card>
            <CardContent className="pt-6">
              <Stack space="space-050" className="mb-[var(--space-300)]">
                <Heading level={2}>{m.workspace_dashboard_createNewTitle()}</Heading>
                <Text size="small" color="muted">
                  {m.workspace_dashboard_createNewDescription()}
                </Text>
              </Stack>
              <WorkspaceCreateForm onSuccess={() => setShowCreateForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-[var(--space-300)] md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <Stack space="space-200">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <Stack space="space-100">
                <Heading level={2} className="text-destructive">
                  {m.workspace_dashboard_loadFailed()}
                </Heading>
                <Text size="small" className="text-destructive/90">
                  {(error instanceof Error && error.message) || m.workspace_dashboard_errorRetry()}
                </Text>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && totalWorkspaces === 0 ? (
          <WorkspaceEmptyState
            onCreateClick={() => setShowCreateForm((prev) => !prev)}
            createForm={<WorkspaceCreateForm onSuccess={() => setShowCreateForm(false)} />}
            showForm={showCreateForm}
          />
        ) : null}

        {/* Workspace List Section */}
        {!isLoading && !error && totalWorkspaces > 0 && (
          <Stack space="space-300">
            <div className="flex items-center justify-between">
              <div>
                <Heading level={3} className="text-lg font-semibold">
                  Danh sách workspace của bạn
                </Heading>
                <Text size="small" color="muted">
                  {totalWorkspaces} workspace đang hoạt động
                </Text>
              </div>
            </div>
            <WorkspaceGrid workspaces={workspaces} onFavorite={(id) => console.log('Toggle favorite:', id)} />
          </Stack>
        )}
      </Stack>
    </div>
  );
};
