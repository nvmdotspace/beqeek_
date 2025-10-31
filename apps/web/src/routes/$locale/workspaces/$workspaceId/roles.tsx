import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const RolesPermissionsPageLazy = lazy(() =>
  import('@/features/roles/pages/roles-permissions-page').then((m) => ({ default: m.RolesPermissionsPage })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/roles')({
  component: RolesComponent,
});

function RolesComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RolesPermissionsPageLazy />
    </Suspense>
  );
}
