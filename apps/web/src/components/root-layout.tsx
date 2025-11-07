import { ReactNode } from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { AppLayout } from '@/components/app-layout';
import { PageTransition } from '@/components/page-transition';

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
      <AppLayout showSidebar={showSidebar}>
        <PageTransition>{children || <Outlet />}</PageTransition>
      </AppLayout>
    </>
  );
};
