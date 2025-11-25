/**
 * Prototype route for Multi-Reply Comments UI/UX
 * Access at: /{locale}/prototype/comments
 */

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const MultiReplyCommentsPrototype = lazy(() => import('@/features/active-tables/pages/comment-prototype'));

export const Route = createFileRoute('/$locale/prototype/comments')({
  component: PrototypeCommentsPage,
});

function PrototypeCommentsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading prototype...</div>}>
      <MultiReplyCommentsPrototype />
    </Suspense>
  );
}
