import { redirect } from '@tanstack/react-router';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { RootLayout } from './routes/root-layout';
import { getIsAuthenticated } from '@/features/auth';
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
const ActiveTableSettingsPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-settings-page').then((m) => ({
    default: m.ActiveTableSettingsPage,
  })),
);
const WorkflowsPageLazy = lazy(() =>
  import('@/features/workflows/pages/workflows-page').then((m) => ({ default: m.WorkflowsPage })),
);
const TeamPageLazy = lazy(() => import('@/features/team/pages/team-page').then((m) => ({ default: m.TeamPage })));
const RolesPermissionsPageLazy = lazy(() =>
  import('@/features/roles/pages/roles-permissions-page').then((m) => ({ default: m.RolesPermissionsPage })),
);
const AnalyticsPageLazy = lazy(() =>
  import('@/features/analytics/pages/analytics-page').then((m) => ({ default: m.AnalyticsPage })),
);
const StarredPageLazy = lazy(() =>
  import('@/features/organization/pages/starred-page').then((m) => ({ default: m.StarredPage })),
);
const RecentActivityPageLazy = lazy(() =>
  import('@/features/organization/pages/recent-activity-page').then((m) => ({ default: m.RecentActivityPage })),
);
const ArchivedPageLazy = lazy(() =>
  import('@/features/organization/pages/archived-page').then((m) => ({ default: m.ArchivedPage })),
);
const NotificationsPageLazy = lazy(() =>
  import('@/features/notifications/pages/notifications-page').then((m) => ({ default: m.NotificationsPage })),
);
const SearchPageLazy = lazy(() =>
  import('@/features/search/pages/search-page').then((m) => ({ default: m.SearchPage })),
);
const HelpCenterPageLazy = lazy(() =>
  import('@/features/support/pages/help-center-page').then((m) => ({ default: m.HelpCenterPage })),
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

// Index route: default to vi, redirect to log in/workspaces
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

const activeTableSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/tables/$tableId/settings',
  validateSearch: (search: Record<string, unknown>) => ({
    workspaceId: typeof search.workspaceId === 'string' ? search.workspaceId : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableSettingsPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const workflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/workflows',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkflowsPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/team',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TeamPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/roles',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RolesPermissionsPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/analytics',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AnalyticsPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const starredRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/starred',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <StarredPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const recentActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/recent-activity',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RecentActivityPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const archivedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces/archived',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ArchivedPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NotificationsPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SearchPageLazy />
    </Suspense>
  ),
  beforeLoad: () => {
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/help',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <HelpCenterPageLazy />
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

const localeActiveTableSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/tables/$tableId/settings',
  validateSearch: (search: Record<string, unknown>) => ({
    workspaceId: typeof search.workspaceId === 'string' ? search.workspaceId : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableSettingsPageLazy />
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

const localeWorkflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/workflows',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkflowsPageLazy />
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

const localeTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/team',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TeamPageLazy />
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

const localeRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/roles',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RolesPermissionsPageLazy />
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

const localeAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/analytics',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AnalyticsPageLazy />
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

const localeStarredRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/starred',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <StarredPageLazy />
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

const localeRecentActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/recent-activity',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RecentActivityPageLazy />
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

const localeArchivedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/archived',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ArchivedPageLazy />
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

const localeNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/notifications',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NotificationsPageLazy />
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

const localeSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/search',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SearchPageLazy />
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

const localeHelpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/help',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <HelpCenterPageLazy />
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
  activeTableSettingsRoute,
  workflowsRoute,
  teamRoute,
  rolesRoute,
  analyticsRoute,
  starredRoute,
  recentActivityRoute,
  archivedRoute,
  notificationsRoute,
  searchRoute,
  helpRoute,
  localeIndexRoute,
  localeLoginRoute,
  localeWorkspacesRoute,
  localeActiveTablesRoute,
  localeActiveTableDetailRoute,
  localeActiveTableSettingsRoute,
  localeWorkflowsRoute,
  localeTeamRoute,
  localeRolesRoute,
  localeAnalyticsRoute,
  localeStarredRoute,
  localeRecentActivityRoute,
  localeArchivedRoute,
  localeNotificationsRoute,
  localeSearchRoute,
  localeHelpRoute,
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
