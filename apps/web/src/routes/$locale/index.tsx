import { createFileRoute, redirect } from '@tanstack/react-router';

import { getIsAuthenticated } from '@/features/auth';
import { normalizeLocale } from '../$locale';

export const Route = createFileRoute('/$locale/')({
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (isAuthenticated) {
      throw redirect({ to: '/$locale/workspaces', params: { locale } });
    } else {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});
