import { Outlet } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { AppProviders } from '@/providers/app-providers';
import { AppLayout } from '@/components/app-layout';

export const RootLayout = () => {
  return (
    <AppProviders>
      <AppLayout>
        <Outlet />
      </AppLayout>
      {import.meta.env.DEV ? (
        <>
          <ReactQueryDevtools buttonPosition="bottom-right" />
          <TanStackRouterDevtools position="bottom-left" />
        </>
      ) : null}
    </AppProviders>
  );
};
