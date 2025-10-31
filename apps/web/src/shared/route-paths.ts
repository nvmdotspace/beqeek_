/**
 * Centralized Route Path Constants
 *
 * This file provides type-safe constants for all application routes.
 * Use these constants with getRouteApi() to ensure consistency and avoid typos.
 *
 * @example
 * ```tsx
 * import { getRouteApi } from '@tanstack/react-router';
 * import { ROUTES } from '@/shared/route-paths';
 *
 * const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);
 *
 * export function MyPage() {
 *   const { tableId, workspaceId, locale } = route.useParams();
 * }
 * ```
 */

/**
 * Root and base routes
 */
export const ROUTES = {
  /** Root route: / */
  ROOT: '/',

  /** Locale-prefixed routes: /$locale */
  LOCALE: '/$locale',

  /** Locale root: /$locale/ */
  LOCALE_ROOT: '/$locale/index' as const,

  /** Login page: /$locale/login */
  LOGIN: '/$locale/login' as const,

  /** Workspaces list: /$locale/workspaces */
  WORKSPACES: '/$locale/workspaces' as const,

  /** Notifications: /$locale/notifications */
  NOTIFICATIONS: '/$locale/notifications' as const,

  /** Global search: /$locale/search */
  SEARCH: '/$locale/search' as const,

  /** Help center: /$locale/help */
  HELP: '/$locale/help' as const,

  /** Catch-all 404: /$ */
  NOT_FOUND: '/$' as const,

  /**
   * Active Tables feature routes
   */
  ACTIVE_TABLES: {
    /** Tables list: /$locale/workspaces/$workspaceId/tables */
    LIST: '/$locale/workspaces/$workspaceId/tables' as const,

    /** Table detail: /$locale/workspaces/$workspaceId/tables/$tableId */
    TABLE_DETAIL: '/$locale/workspaces/$workspaceId/tables/$tableId' as const,

    /** Table records: /$locale/workspaces/$workspaceId/tables/$tableId/records */
    TABLE_RECORDS: '/$locale/workspaces/$workspaceId/tables/$tableId/records' as const,

    /** Table settings: /$locale/workspaces/$workspaceId/tables/$tableId/settings */
    TABLE_SETTINGS: '/$locale/workspaces/$workspaceId/tables/$tableId/settings' as const,
  },

  /**
   * Workspace feature routes
   */
  WORKSPACE: {
    /** Workflows: /$locale/workspaces/$workspaceId/workflows */
    WORKFLOWS: '/$locale/workspaces/$workspaceId/workflows' as const,

    /** Team management: /$locale/workspaces/$workspaceId/team */
    TEAM: '/$locale/workspaces/$workspaceId/team' as const,

    /** Roles & permissions: /$locale/workspaces/$workspaceId/roles */
    ROLES: '/$locale/workspaces/$workspaceId/roles' as const,

    /** Analytics: /$locale/workspaces/$workspaceId/analytics */
    ANALYTICS: '/$locale/workspaces/$workspaceId/analytics' as const,

    /** Starred items: /$locale/workspaces/$workspaceId/starred */
    STARRED: '/$locale/workspaces/$workspaceId/starred' as const,

    /** Recent activity: /$locale/workspaces/$workspaceId/recent-activity */
    RECENT_ACTIVITY: '/$locale/workspaces/$workspaceId/recent-activity' as const,

    /** Archived items: /$locale/workspaces/$workspaceId/archived */
    ARCHIVED: '/$locale/workspaces/$workspaceId/archived' as const,
  },
} as const;

/**
 * Type-safe route path type
 * Extracts all possible route paths from ROUTES constant
 */
export type RoutePath = string;

/**
 * Helper to check if a string is a valid route path
 */
export function isValidRoutePath(path: string): boolean {
  const allPaths = new Set<string>([
    ROUTES.ROOT,
    ROUTES.LOCALE,
    ROUTES.LOCALE_ROOT,
    ROUTES.LOGIN,
    ROUTES.WORKSPACES,
    ROUTES.NOTIFICATIONS,
    ROUTES.SEARCH,
    ROUTES.HELP,
    ROUTES.NOT_FOUND,
    ...Object.values(ROUTES.ACTIVE_TABLES),
    ...Object.values(ROUTES.WORKSPACE),
  ]);

  return allPaths.has(path);
}

/**
 * Route groups for easier filtering/navigation
 */
export const ROUTE_GROUPS = {
  /** All Active Tables routes */
  ACTIVE_TABLES: Object.values(ROUTES.ACTIVE_TABLES),

  /** All Workspace feature routes */
  WORKSPACE: Object.values(ROUTES.WORKSPACE),

  /** All authenticated routes (require login) */
  AUTHENTICATED: [
    ROUTES.WORKSPACES,
    ROUTES.NOTIFICATIONS,
    ROUTES.SEARCH,
    ...Object.values(ROUTES.ACTIVE_TABLES),
    ...Object.values(ROUTES.WORKSPACE),
  ],

  /** All public routes (no auth required) */
  PUBLIC: [
    ROUTES.ROOT,
    ROUTES.LOCALE,
    ROUTES.LOGIN,
    ROUTES.HELP,
  ],
} as const;
