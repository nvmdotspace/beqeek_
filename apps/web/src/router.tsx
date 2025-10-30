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
const ActiveTableRecordsPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-records-page').then((m) => ({
    default: m.ActiveTableRecordsPage,
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

const rootRoute = createRootRoute({
  component: RootLayout,
  pendingComponent: () => <RoutePending />,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

// ========== Index Route - Always redirect to locale route ==========
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
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

// ========== Locale Index Route ==========
const localeIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale',
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

// ========== Login Route ==========
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
      throw redirect({ to: '/$locale/workspaces', params: { locale } });
    }
  },
});

// ========== Workspace Dashboard ==========
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
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Active Tables Routes ==========
const localeActiveTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/tables',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTablesPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

const localeActiveTableDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/tables/$tableId',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableDetailPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

const localeActiveTableRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/tables/$tableId/records',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableRecordsPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

const localeActiveTableSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/tables/$tableId/settings',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableSettingsPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Workflows Routes ==========
const localeWorkflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/workflows',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WorkflowsPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Team Routes ==========
const localeTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/team',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TeamPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Roles Routes ==========
const localeRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/roles',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RolesPermissionsPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Analytics Routes ==========
const localeAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/analytics',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AnalyticsPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Starred Routes ==========
const localeStarredRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/starred',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <StarredPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Recent Activity Routes ==========
const localeRecentActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/recent-activity',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RecentActivityPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Archived Routes ==========
const localeArchivedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/workspaces/$workspaceId/archived',
  component: () => (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ArchivedPageLazy />
    </Suspense>
  ),
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Notifications Routes (global, not workspace-scoped) ==========
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
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Search Routes (global, not workspace-scoped) ==========
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
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Help Routes (global, not workspace-scoped) ==========
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
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

// ========== Not Found Route ==========
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <NotFound />,
});

// ========== Route Tree (ONLY locale routes) ==========
const routeTree = rootRoute.addChildren([
  indexRoute,
  localeIndexRoute,
  localeLoginRoute,
  localeWorkspacesRoute,
  localeActiveTablesRoute,
  localeActiveTableDetailRoute,
  localeActiveTableRecordsRoute,
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
