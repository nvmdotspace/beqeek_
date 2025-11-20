import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const WorkflowConsolePage = lazy(() => import('@/features/workflow-units/pages/workflow-console'));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/console')(
  {
    beforeLoad: async ({ params }) => {
      const isAuthenticated = await getIsAuthenticated();
      if (!isAuthenticated) {
        throw redirect({
          to: '/$locale/login',
          params: { locale: params.locale },
        });
      }
    },
    component: WorkflowConsoleRoute,
  },
);

function WorkflowConsoleRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowConsolePage />
    </Suspense>
  );
}
