/**
 * Connector Detail Route
 *
 * Route file for connector detail view with config management
 */

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { ConnectorDetailSkeleton } from '@/features/workflow-connectors/components/connector-detail-skeleton';

const ConnectorDetailPageLazy = lazy(() =>
  import('@/features/workflow-connectors/pages/connector-detail-page').then((m) => ({
    default: m.ConnectorDetailPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId/')({
  component: ConnectorDetailRoute,
});

function ConnectorDetailRoute() {
  return (
    <Suspense fallback={<ConnectorDetailSkeleton />}>
      <ConnectorDetailPageLazy />
    </Suspense>
  );
}
