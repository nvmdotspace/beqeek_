import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId')({
  component: () => <Outlet />,
});
