import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getIsAuthenticated } from '@/features/auth';
import { normalizeLocale } from '../$locale';

const HelpCenterPageLazy = lazy(() =>
  import('@/features/support/pages/help-center-page').then((m) => ({ default: m.HelpCenterPage })),
);

export const Route = createFileRoute('/$locale/help')({
  component: HelpComponent,
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

function HelpComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <HelpCenterPageLazy />
    </Suspense>
  );
}
