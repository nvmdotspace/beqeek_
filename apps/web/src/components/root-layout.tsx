import { ReactNode } from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { AppLayout } from '@/components/app-layout';

interface RootLayoutProps {
  children?: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const hideSidebar = pathname.endsWith('/login');
  const showSidebar = !hideSidebar;

  return (
    <>
      <AppLayout showSidebar={showSidebar}>{children || <Outlet />}</AppLayout>
      {import.meta.env.DEV ? (
        <>
          <ReactQueryDevtools buttonPosition="bottom-right" />
          <TanStackRouterDevtools position="bottom-left" />
        </>
      ) : null}
    </>
  );
};
