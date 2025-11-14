import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getIsAuthenticated } from '@/features/auth';

const WorkflowFormsSelectLazy = lazy(() =>
  import('@/features/workflow-forms/pages/workflow-forms-select').then((m) => ({
    default: m.WorkflowFormsSelect,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-forms/select')({
  component: WorkflowFormsSelectPage,
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

function WorkflowFormsSelectPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkflowFormsSelectLazy />
    </Suspense>
  );
}
