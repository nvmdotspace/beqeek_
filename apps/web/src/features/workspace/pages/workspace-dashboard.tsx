import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';

import { PlusCircle, Folder, Zap, Users, Database } from 'lucide-react';

import { useWorkspaces } from '../hooks/use-workspaces';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

import { WorkspaceCreateForm } from '../components/workspace-create-form';
import { WorkspaceEmptyState } from '../components/workspace-empty-state';
import { WorkspaceGrid } from '../components/workspace-grid';
import { useTranslation } from '@/hooks/use-translation';

export const WorkspaceDashboardPage = () => {
  const { data, isLoading, error } = useWorkspaces();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { t } = useTranslation();

  const totalWorkspaces = data?.meta?.total ?? data?.data?.length ?? 0;
  const workspaces = data?.data ?? [];

  const subtitle = useMemo(() => {
    if (isLoading) return t('workspace.dashboard.loading');
    if (error) return t('workspace.dashboard.error');
    if (totalWorkspaces === 0) return t('workspace.dashboard.noWorkspacesSubtitle');
    return `${totalWorkspaces} ${t('workspace.dashboard.activeWorkspaces')}`;
  }, [error, isLoading, totalWorkspaces, t]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t('workspace.dashboard.title')}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateForm((prev) => !prev)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('workspace.dashboard.newWorkspace')}
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
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('workspace.dashboard.totalWorkspaces')}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">{t('workspace.dashboard.activeTables')}</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Folder className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('workspace.dashboard.activeTables')}</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Folder className="h-4 w-4 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('workspace.dashboard.workflows')}</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('workspace.dashboard.teamMembers')}</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
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
              <h2 className="text-xl font-semibold">{t('workspace.dashboard.createNewTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('workspace.dashboard.createNewDescription')}</p>
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
            <h2 className="text-lg font-semibold text-destructive">{t('workspace.dashboard.loadFailed')}</h2>
            <p className="text-sm text-destructive/90 mt-2">
              {(error instanceof Error && error.message) || t('workspace.dashboard.errorRetry')}
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

      {/* Quick Access */}
      {!isLoading && !error && totalWorkspaces > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t('workspace.dashboard.quickAccess')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/workspaces/tables">
                <Database className="mr-2 h-4 w-4" />
                {t('workspace.dashboard.viewAllTables')}
              </Link>
            </Button>
            {workspaces.slice(0, 3).map((workspace) => (
              <Button key={workspace.id} asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link to="/workspaces/tables" search={{ workspaceId: workspace.id }}>
                  <Folder className="mr-2 h-4 w-4" />
                  {t('workspace.dashboard.workspaceTables', { name: workspace.workspaceName })}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Workspace Grid */}
      {!isLoading && !error && totalWorkspaces > 0 && <WorkspaceGrid workspaces={workspaces} />}
    </div>
  );
};
