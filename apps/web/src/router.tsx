import { redirect } from '@tanstack/react-router';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { RootLayout } from './routes/root-layout';
// import { LoginPage, getIsAuthenticated } from '@/features/auth';
// import { WorkspaceDashboardPage } from '@/features/workspace';
import { getIsAuthenticated } from '@/features/auth';
import { queryClient } from '@/shared/query-client';
import { workspaceQueryKey } from '@/features/workspace/hooks/use-workspaces';
import { getWorkspaces } from '@/features/workspace/api/workspace-api';
import { NotFound } from '@/components/not-found';
import { RoutePending } from '@/components/route-pending';
import { RouteError } from '@/components/route-error';

// Lazy-loaded pages for code-splitting
const LoginPageLazy = lazy(() => import('@/features/auth/pages/login-page').then((m) => ({ default: m.LoginPage })));
const WorkspaceDashboardPageLazy = lazy(() =>
  import('@/features/workspace/pages/workspace-dashboard').then((m) => ({ default: m.WorkspaceDashboardPage })),
);

// Helpers for locale-aware paths
const getLocaleFromPathname = (pathname: string) => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'vi');
const lp = (path: string, locale: string) => (locale === 'en' ? `/en${path}` : path);

const rootRoute = createRootRoute({
  component: RootLayout,
  pendingComponent: () => <RoutePending />,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

// Index route: decide auth redirect with locale
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    const locale = getLocaleFromPathname(window.location.pathname);

    throw redirect({
      to: lp(isAuthenticated ? '/workspaces' : '/login', locale),
    });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    const locale = getLocaleFromPathname(window.location.pathname);

    if (isAuthenticated) {
      throw redirect({ to: lp('/workspaces', locale) });
    }
  },
});

const workspacesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkspaceDashboardPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    const locale = getLocaleFromPathname(window.location.pathname);

    if (!isAuthenticated) {
      throw redirect({ to: lp('/login', locale) });
    }
  },
  loader: async () => {
    await queryClient.ensureQueryData({ queryKey: workspaceQueryKey, queryFn: () => getWorkspaces() });
  },
});

// English routes (prefix group)
const enIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en',
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    throw redirect({ to: isAuthenticated ? '/en/workspaces' : '/en/login' });
  },
});

const enLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en/login',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (isAuthenticated) {
      throw redirect({ to: '/en/workspaces' });
    }
  },
});

const enWorkspacesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en/workspaces',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkspaceDashboardPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/en/login' });
    }
  },
  loader: async () => {
    await queryClient.ensureQueryData({ queryKey: workspaceQueryKey, queryFn: () => getWorkspaces() });
  },
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <NotFound />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  workspacesRoute,
  enIndexRoute,
  enLoginRoute,
  enWorkspacesRoute,
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
