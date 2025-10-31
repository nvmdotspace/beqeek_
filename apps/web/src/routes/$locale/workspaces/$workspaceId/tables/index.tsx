import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ActiveTablesPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-tables-page').then((m) => ({ default: m.ActiveTablesPage })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/')({
  component: TablesListComponent,
});

function TablesListComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTablesPageLazy />
    </Suspense>
  );
}
