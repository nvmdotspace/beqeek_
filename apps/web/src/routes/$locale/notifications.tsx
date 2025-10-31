import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getIsAuthenticated } from '@/features/auth';
import { normalizeLocale } from '../$locale';

const NotificationsPageLazy = lazy(() =>
  import('@/features/notifications/pages/notifications-page').then((m) => ({ default: m.NotificationsPage })),
);

export const Route = createFileRoute('/$locale/notifications')({
  component: NotificationsComponent,
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

function NotificationsComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NotificationsPageLazy />
    </Suspense>
  );
}
