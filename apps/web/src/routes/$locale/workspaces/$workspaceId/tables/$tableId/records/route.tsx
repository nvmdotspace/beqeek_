import { createFileRoute, Outlet } from '@tanstack/react-router';

/**
 * Layout route for records section
 * This route acts as a parent for:
 * - /records/ (index.tsx)
 * - /records/$recordId ($recordId.tsx)
 */
export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/records')({
  component: RecordsLayout,
});

function RecordsLayout() {
  return <Outlet />;
}
