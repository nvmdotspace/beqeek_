import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const RecordDetailPageLazy = lazy(() =>
  import('@/features/active-tables/pages/record-detail-page').then((m) => ({
    default: m.RecordDetailPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/records/$recordId')({
  component: RecordDetailComponent,
});

function RecordDetailComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading record...</div>}>
      <RecordDetailPageLazy />
    </Suspense>
  );
}
