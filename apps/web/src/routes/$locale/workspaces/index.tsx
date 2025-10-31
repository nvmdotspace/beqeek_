import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const WorkspaceDashboardPageLazy = lazy(() =>
  import('@/features/workspace/pages/workspace-dashboard').then((m) => ({ default: m.WorkspaceDashboardPage })),
);

export const Route = createFileRoute('/$locale/workspaces/')({
  component: WorkspacesDashboardComponent,
});

function WorkspacesDashboardComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkspaceDashboardPageLazy />
    </Suspense>
  );
}
