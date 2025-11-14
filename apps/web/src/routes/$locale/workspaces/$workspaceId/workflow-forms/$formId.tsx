import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getIsAuthenticated } from '@/features/auth';

const WorkflowFormDetailLazy = lazy(() =>
  import('@/features/workflow-forms/pages/workflow-form-detail').then((m) => ({
    default: m.WorkflowFormDetail,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-forms/$formId')({
  component: WorkflowFormDetailPage,
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

function WorkflowFormDetailPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkflowFormDetailLazy />
    </Suspense>
  );
}
