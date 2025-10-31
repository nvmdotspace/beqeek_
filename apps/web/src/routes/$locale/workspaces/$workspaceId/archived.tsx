import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ArchivedPageLazy = lazy(() =>
  import('@/features/organization/pages/archived-page').then((m) => ({ default: m.ArchivedPage })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/archived')({
  component: ArchivedComponent,
});

function ArchivedComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ArchivedPageLazy />
    </Suspense>
  );
}
