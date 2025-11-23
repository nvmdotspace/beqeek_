import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';
import { RecordLoadingSkeleton } from '@/features/active-tables/components/record-loading-skeleton';

const RecordDetailPage = lazy(() => import('@/features/active-tables/pages/record-detail-page'));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/records/$recordId')({
  component: RecordDetailComponent,
  beforeLoad: async ({ params }) => {
    // Auth guard
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      });
    }
  },
});

function RecordDetailComponent() {
  return (
    <Suspense fallback={<RecordLoadingSkeleton />}>
      <RecordDetailPage />
    </Suspense>
  );
}
