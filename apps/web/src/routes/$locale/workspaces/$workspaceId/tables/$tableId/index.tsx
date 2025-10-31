import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ActiveTableDetailPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-detail-page').then((m) => ({
    default: m.ActiveTableDetailPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/')({
  component: TableDetailComponent,
});

function TableDetailComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableDetailPageLazy />
    </Suspense>
  );
}
