import { ReactNode } from 'react';
import { Outlet } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { AppProviders } from '@/providers/app-providers';
import { AppLayout } from '@/components/app-layout';
import { useInitializeLanguage } from '@/stores/language-store';

interface RootLayoutProps {
  children?: ReactNode;
  showSidebar?: boolean;
}

export const RootLayout = ({ children, showSidebar = true }: RootLayoutProps) => {
  // Initialize language on app start
  useInitializeLanguage();

  return (
    <AppProviders>
      <AppLayout showSidebar={showSidebar}>
        {children || <Outlet />}
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
