import { redirect } from '@tanstack/react-router';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { RootLayout } from './routes/root-layout';
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

// Locale helpers: default vi, support en; fallback to vi for others
const SUPPORTED_LOCALES = ['vi', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'vi';
const isSupportedLocale = (loc?: string): loc is Locale => !!loc && SUPPORTED_LOCALES.includes(loc.toLowerCase() as Locale);
const normalizeLocale = (loc?: string): Locale => (isSupportedLocale(loc) ? (loc!.toLowerCase() as Locale) : DEFAULT_LOCALE);
const lp = (path: string, locale: Locale) => (locale !== DEFAULT_LOCALE ? `/${locale}${path}` : path);

const rootRoute = createRootRoute({
  component: RootLayout,
  pendingComponent: () => <RoutePending />,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

// Index route: default to vi, redirect to login/workspaces
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    throw redirect({ to: isAuthenticated ? '/workspaces' : '/login' });
  },
});

// vi (default) routes
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
    if (isAuthenticated) {
      throw redirect({ to: '/workspaces' });
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
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async () => {
    await queryClient.ensureQueryData({ queryKey: workspaceQueryKey, queryFn: () => getWorkspaces() });
  },
});

// Dynamic locale-prefixed routes (e.g., /en/*). Unsupported locale => fallback to vi.
const localeIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale',
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    throw redirect({ to: lp(isAuthenticated ? '/workspaces' : '/login', locale) });
  },
});

const localeLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/login',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (isAuthenticated) {
      throw redirect({ to: lp('/workspaces', locale) });
    }
  },
});

const localeWorkspacesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkspaceDashboardPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: lp('/login', locale) });
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
  localeIndexRoute,
  localeLoginRoute,
  localeWorkspacesRoute,
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
