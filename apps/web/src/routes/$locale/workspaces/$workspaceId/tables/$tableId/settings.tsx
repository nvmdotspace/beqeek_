import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ActiveTableSettingsPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-settings-page').then((m) => ({
    default: m.ActiveTableSettingsPage,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/settings')({
  component: SettingsComponent,
});

function SettingsComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableSettingsPageLazy />
    </Suspense>
  );
}
