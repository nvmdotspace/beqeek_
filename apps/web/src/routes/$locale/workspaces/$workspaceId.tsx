import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getIsAuthenticated } from '@/features/auth';
import { normalizeLocale } from '../../$locale';

export const Route = createFileRoute('/$locale/workspaces/$workspaceId')({
  component: () => <Outlet />,
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});
