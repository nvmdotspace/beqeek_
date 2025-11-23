import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const WorkflowUnitDetailPage = lazy(() => import('@/features/workflow-units/pages/workflow-unit-detail'));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-units/$unitId/')({
  beforeLoad: async ({ params }) => {
    const isAuthenticated = await getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      });
    }
  },
  component: WorkflowUnitDetailRoute,
});

function WorkflowUnitDetailRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowUnitDetailPage />
    </Suspense>
  );
}
