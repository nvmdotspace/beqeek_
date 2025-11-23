import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const WorkflowUnitsListPage = lazy(() => import('@/features/workflow-units/pages/workflow-units-list'));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-units/')({
  beforeLoad: async ({ params }) => {
    const isAuthenticated = await getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      });
    }
  },
  component: WorkflowUnitsListRoute,
});

function WorkflowUnitsListRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowUnitsListPage />
    </Suspense>
  );
}
