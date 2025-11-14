import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getIsAuthenticated } from '@/features/auth';

const WorkflowFormsListLazy = lazy(() =>
  import('@/features/workflow-forms/pages/workflow-forms-list').then((m) => ({
    default: m.WorkflowFormsList,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-forms/')({
  component: WorkflowFormsListPage,
  beforeLoad: ({ params, location }) => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
        search: { redirect: location.href },
      });
    }
  },
});

function WorkflowFormsListPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkflowFormsListLazy />
    </Suspense>
  );
}
