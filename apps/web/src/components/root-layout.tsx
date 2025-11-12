import { ReactNode } from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { AppLayout } from '@/components/app-layout';
import { PageTransition } from '@/components/page-transition';
import { PageProvider, usePageContext } from '@/contexts/page-context';

interface RootLayoutProps {
  children?: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <PageProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </PageProvider>
  );
};

const RootLayoutContent = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const hideSidebar = pathname.endsWith('/login');
  const showSidebar = !hideSidebar;
  const { pageTitle, pageIcon } = usePageContext();

  return (
    <AppLayout showSidebar={showSidebar} pageTitle={pageTitle} pageIcon={pageIcon}>
      <PageTransition>{children || <Outlet />}</PageTransition>
    </AppLayout>
  );
};
