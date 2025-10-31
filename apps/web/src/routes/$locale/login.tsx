import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getIsAuthenticated } from '@/features/auth';
import { normalizeLocale } from '../$locale';

const LoginPageLazy = lazy(() =>
  import('@/features/auth/pages/login-page').then((m) => ({ default: m.LoginPage })),
);

export const Route = createFileRoute('/$locale/login')({
  component: LoginComponent,
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (isAuthenticated) {
      throw redirect({ to: '/$locale/workspaces', params: { locale } });
    }
  },
});

function LoginComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginPageLazy />
    </Suspense>
  );
}
