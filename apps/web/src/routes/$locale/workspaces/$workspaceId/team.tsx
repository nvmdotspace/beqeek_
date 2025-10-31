import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const TeamPageLazy = lazy(() => import('@/features/team/pages/team-page').then((m) => ({ default: m.TeamPage })));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/team')({
  component: TeamComponent,
});

function TeamComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TeamPageLazy />
    </Suspense>
  );
}
