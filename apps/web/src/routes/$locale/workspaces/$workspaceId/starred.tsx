import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const StarredPageLazy = lazy(() =>
  import('@/features/organization/pages/starred-page').then((m) => ({ default: m.StarredPage })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/starred')({
  component: StarredComponent,
});

function StarredComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <StarredPageLazy />
    </Suspense>
  );
}
