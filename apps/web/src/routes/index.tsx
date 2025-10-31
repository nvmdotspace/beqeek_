import { createFileRoute, redirect } from '@tanstack/react-router';

import { getIsAuthenticated } from '@/features/auth';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    // Always redirect to vi locale route
    if (isAuthenticated) {
      throw redirect({ to: '/$locale/workspaces', params: { locale: 'vi' } });
    } else {
      throw redirect({ to: '/$locale/login', params: { locale: 'vi' } });
    }
  },
});
