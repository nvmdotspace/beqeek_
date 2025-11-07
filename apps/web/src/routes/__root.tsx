import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { RootLayout } from '@/components/root-layout';
import { RoutePending } from '@/components/route-pending';
import { RouteError } from '@/components/route-error';
import { NavigationProgress } from '@/components/navigation-progress';

export const Route = createRootRoute({
  component: RootComponent,
  pendingComponent: () => <RoutePending />,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

function RootComponent() {
  return (
    <>
      <NavigationProgress />
      <RootLayout>
        <Outlet />
      </RootLayout>
      {import.meta.env.DEV ? (
        <>
          <ReactQueryDevtools buttonPosition="bottom-right" />
          {/* <TanStackRouterDevtools position="bottom-left" /> */}
        </>
      ) : null}
    </>
  );
}
