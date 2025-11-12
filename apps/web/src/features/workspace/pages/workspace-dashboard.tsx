import { useMemo, useState } from 'react';

import { Folder, Zap, Users } from 'lucide-react';

import { useWorkspaces } from '../hooks/use-workspaces';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Heading, Text, Metric } from '@workspace/ui/components/typography';

import { WorkspaceCreateForm } from '../components/workspace-create-form';
import { WorkspaceEmptyState } from '../components/workspace-empty-state';
import { WorkspaceGrid } from '../components/workspace-grid';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Heading level={1}>{m.workspace_dashboard_title()}</Heading>
          <Text color="muted">{subtitle}</Text>
        </div>
        {/* <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateForm((prev) => !prev)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {m.workspace_dashboard_newWorkspace()}
          </Button>
        </div> */}
      </div>

      {/* Stats Cards */}
      {!isLoading && !error && totalWorkspaces > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Metric size="medium" value={totalWorkspaces} label={m.workspace_dashboard_totalWorkspaces()} />
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Folder className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Metric size="medium" value={24} label={m.workspace_dashboard_activeTables()} />
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Folder className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Metric size="medium" value={24} label={m.workspace_dashboard_activeTables()} />
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Folder className="h-4 w-4 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Metric size="medium" value={8} label={m.workspace_dashboard_workflows()} />
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Metric size="medium" value={15} label={m.workspace_dashboard_teamMembers()} />
                <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && totalWorkspaces > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 space-y-1">
              <Heading level={2}>{m.workspace_dashboard_createNewTitle()}</Heading>
              <Text size="small" color="muted">
                {m.workspace_dashboard_createNewDescription()}
              </Text>
            </div>
            <WorkspaceCreateForm onSuccess={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <Heading level={2} className="text-destructive">
              {m.workspace_dashboard_loadFailed()}
            </Heading>
            <Text size="small" className="text-destructive/90 mt-2">
              {(error instanceof Error && error.message) || m.workspace_dashboard_errorRetry()}
            </Text>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading level={2}>Danh sách workspace của bạn</Heading>
            <Text size="small" color="muted">
              {totalWorkspaces} workspace
            </Text>
          </div>
          <WorkspaceGrid workspaces={workspaces} />
        </div>
      )}
    </div>
  );
};
