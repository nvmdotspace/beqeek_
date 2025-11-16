import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors')({
  component: () => <Outlet />,
});
