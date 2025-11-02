import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const KanbanTestPageLazy = lazy(() => import('@/features/test/pages/kanban-test'));

export const Route = createFileRoute('/test-kanban')({
  component: KanbanTestComponent,
});

function KanbanTestComponent() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Kanban...</div>}>
      <KanbanTestPageLazy />
    </Suspense>
  );
}
