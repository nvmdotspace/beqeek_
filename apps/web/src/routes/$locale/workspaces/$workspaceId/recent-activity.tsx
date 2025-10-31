import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const RecentActivityPageLazy = lazy(() =>
  import('@/features/organization/pages/recent-activity-page').then((m) => ({ default: m.RecentActivityPage })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/recent-activity')({
  component: RecentActivityComponent,
});

function RecentActivityComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RecentActivityPageLazy />
    </Suspense>
  );
}
