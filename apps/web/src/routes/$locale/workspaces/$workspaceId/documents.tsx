import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

// Lazy load the documents page component
const DocumentsPageLazy = lazy(() => import('@/features/documents/pages/documents-page'));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/documents')({
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground">Loading documents...</div>
        </div>
      }
    >
      <DocumentsPageLazy />
    </Suspense>
  );
}
