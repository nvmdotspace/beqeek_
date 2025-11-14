import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const TeamsPageLazy = lazy(() =>
  import('@/features/team/pages/teams-page').then((m) => ({
    default: m.TeamsPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/team/')({
  component: TeamComponent,
});

function TeamComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading teams...</div>}>
      <TeamsPageLazy />
    </Suspense>
  );
}
