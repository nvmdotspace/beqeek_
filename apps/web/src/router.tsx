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
const ActiveTablesPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-tables-page').then((m) => ({ default: m.ActiveTablesPage })),
);
const ActiveTableDetailPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-detail-page').then((m) => ({ default: m.ActiveTableDetailPage })),
);
const ActiveTableRecordsPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-records-page').then((m) => ({
    default: m.ActiveTableRecordsPage,
  })),
);
const EncryptionSettingsPageLazy = lazy(() =>
  import('@/features/encryption/pages/encryption-settings-page').then((m) => ({ default: m.EncryptionSettingsPage })),
);

// Locale helpers: default vi, support en; fallback to vi for others
const SUPPORTED_LOCALES = ['vi', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'vi';
const isSupportedLocale = (loc?: string): loc is Locale =>
  !!loc && SUPPORTED_LOCALES.includes(loc.toLowerCase() as Locale);
const normalizeLocale = (loc?: string): Locale =>
  isSupportedLocale(loc) ? (loc!.toLowerCase() as Locale) : DEFAULT_LOCALE;
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

const activeTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/tables',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTablesPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const activeTableDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/tables/$tableId',
  validateSearch: (search: Record<string, unknown>) => ({
    workspaceId: typeof search.workspaceId === 'string' ? search.workspaceId : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableDetailPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const activeTableRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/tables/$tableId/records',
  validateSearch: (search: Record<string, unknown>) => ({
    workspaceId: typeof search.workspaceId === 'string' ? search.workspaceId : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableRecordsPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const encryptionSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/encryption',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <EncryptionSettingsPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

// Locale-prefixed routes
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

const localeActiveTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/tables',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTablesPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: lp('/login', locale) });
    }
  },
});

const localeActiveTableDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/tables/$tableId',
  validateSearch: (search: Record<string, unknown>) => ({
    workspaceId: typeof search.workspaceId === 'string' ? search.workspaceId : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableDetailPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: lp('/login', locale) });
    }
  },
});

const localeActiveTableRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/tables/$tableId/records',
  validateSearch: (search: Record<string, unknown>) => ({
    workspaceId: typeof search.workspaceId === 'string' ? search.workspaceId : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableRecordsPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: lp('/login', locale) });
    }
  },
});

const localeEncryptionSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/settings/encryption',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <EncryptionSettingsPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: lp('/login', locale) });
    }
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
  activeTablesRoute,
  activeTableDetailRoute,
  activeTableRecordsRoute,
  encryptionSettingsRoute,
  localeIndexRoute,
  localeLoginRoute,
  localeWorkspacesRoute,
  localeActiveTablesRoute,
  localeActiveTableDetailRoute,
  localeActiveTableRecordsRoute,
  localeEncryptionSettingsRoute,
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
