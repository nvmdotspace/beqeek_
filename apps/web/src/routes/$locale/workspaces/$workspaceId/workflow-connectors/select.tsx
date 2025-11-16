/**
 * Workflow Connectors Select Route
 *
 * Displays connector type catalog for creating new connectors
 */

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { ConnectorCardSkeleton } from '@/features/workflow-connectors/components/connector-card-skeleton';

const ConnectorSelectPageLazy = lazy(() =>
  import('@/features/workflow-connectors/pages/connector-select-page').then((m) => ({
    default: m.ConnectorSelectPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors/select')({
  component: ConnectorSelectRoute,
});

function ConnectorSelectRoute() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <ConnectorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ConnectorSelectPageLazy />
    </Suspense>
  );
}
