import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const WorkflowsPageLazy = lazy(() =>
  import('@/features/workflows/pages/workflows-page').then((m) => ({ default: m.WorkflowsPage })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflows')({
  component: WorkflowsComponent,
});

function WorkflowsComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkflowsPageLazy />
    </Suspense>
  );
}
