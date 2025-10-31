import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const AnalyticsPageLazy = lazy(() =>
  import('@/features/analytics/pages/analytics-page').then((m) => ({ default: m.AnalyticsPage })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/analytics')({
  component: AnalyticsComponent,
});

function AnalyticsComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AnalyticsPageLazy />
    </Suspense>
  );
}
