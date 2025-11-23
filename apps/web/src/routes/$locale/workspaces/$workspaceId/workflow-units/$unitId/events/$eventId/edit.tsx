import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const WorkflowEventEditorPage = lazy(() => import('@/features/workflow-units/pages/workflow-event-editor'));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit')({
  beforeLoad: async ({ params }) => {
    const isAuthenticated = await getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      });
    }
  },
  component: WorkflowEventEditorRoute,
});

function WorkflowEventEditorRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowEventEditorPage />
    </Suspense>
  );
}
