import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { RootLayout } from './routes/root-layout';
import { AppProviders } from '@/providers/app-providers';
import { LoginPage, useAuthStore } from '@/features/auth';
import { WorkspaceDashboardPage } from '@/features/workspace';

const rootRoute = createRootRoute({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    throw redirect({
      to: isAuthenticated ? '/workspaces' : '/login',
    });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <AppProviders>
      <RootLayout showSidebar={false}>
        <LoginPage />
      </RootLayout>
    </AppProviders>
  ),
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) {
      throw redirect({ to: '/workspaces' });
    }
  },
});

const workspacesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces',
  component: () => (
    <AppProviders>
      <RootLayout showSidebar={true}>
        <WorkspaceDashboardPage />
      </RootLayout>
    </AppProviders>
  ),
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, workspacesRoute]);

export const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
