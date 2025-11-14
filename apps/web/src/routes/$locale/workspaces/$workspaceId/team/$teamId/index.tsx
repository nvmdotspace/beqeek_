import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const TeamDetailPageLazy = lazy(() =>
  import('@/features/team/pages/team-detail-page').then((m) => ({
    default: m.TeamDetailPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/team/$teamId/')({
  component: TeamDetailComponent,
});

function TeamDetailComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading team details...</div>}>
      <TeamDetailPageLazy />
    </Suspense>
  );
}
