import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ActiveTableRecordsPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-records-page').then((m) => ({
    default: m.ActiveTableRecordsPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/records')({
  component: RecordsComponent,
});

function RecordsComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableRecordsPageLazy />
    </Suspense>
  );
}
