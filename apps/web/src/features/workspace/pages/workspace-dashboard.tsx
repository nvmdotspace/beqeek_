import { useMemo, useState } from 'react';

import { PlusCircle, Folder, Zap, Users } from 'lucide-react';

import { useWorkspaces } from '@/features/workspace';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

import { WorkspaceCreateForm } from '../components/workspace-create-form';
import { WorkspaceEmptyState } from '../components/workspace-empty-state';
import { WorkspaceGrid } from '../components/workspace-grid';

export const WorkspaceDashboardPage = () => {
  const { data, isLoading, error } = useWorkspaces();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const totalWorkspaces = data?.meta.total ?? 0;
  const workspaces = data?.data ?? [];

  const subtitle = useMemo(() => {
    if (isLoading) return 'Loading workspaces...';
    if (error) return 'Unable to load data. Please try again.';
    if (totalWorkspaces === 0)
      return 'No workspaces yet. Create your first workspace to start digitizing your work processes.';
    return `${totalWorkspaces} workspaces active`;
  }, [error, isLoading, totalWorkspaces]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Workspace Dashboard</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateForm((prev) => !prev)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoading && !error && totalWorkspaces > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Workspaces</p>
                  <p className="text-2xl font-bold">{totalWorkspaces}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Folder className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tables</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Folder className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workflows</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-orange-600" />
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
              <h2 className="text-xl font-semibold">Create New Workspace</h2>
              <p className="text-sm text-muted-foreground">
                Set up your workspace name, namespace, and description. You can configure teams, roles, and Active
                Tables after creation.
              </p>
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
            <h2 className="text-lg font-semibold text-destructive">Failed to load workspaces</h2>
            <p className="text-sm text-destructive/90 mt-2">
              {(error instanceof Error && error.message) ||
                'An error occurred while connecting to the service. Please try refreshing the page.'}
            </p>
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

      {/* Workspace Grid */}
      {!isLoading && !error && totalWorkspaces > 0 && <WorkspaceGrid workspaces={workspaces} />}
    </div>
  );
};
