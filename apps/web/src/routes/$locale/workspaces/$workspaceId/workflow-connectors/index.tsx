/**
 * Workflow Connectors List Route
 *
 * Displays all connectors in the workspace with filtering by category
 */

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { ConnectorListSkeleton } from '@/features/workflow-connectors/components/connector-list-skeleton';

const ConnectorListPageLazy = lazy(() =>
  import('@/features/workflow-connectors/pages/connector-list-page').then((m) => ({
    default: m.ConnectorListPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors/')({
  component: ConnectorListRoute,
});

function ConnectorListRoute() {
  return (
    <Suspense fallback={<ConnectorListSkeleton />}>
      <ConnectorListPageLazy />
    </Suspense>
  );
}
