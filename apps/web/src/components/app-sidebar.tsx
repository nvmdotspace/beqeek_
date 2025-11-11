import { useEffect } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { X } from 'lucide-react';
import { useBadgeCounts } from '@/hooks/use-badge-counts';
import {
  useSidebarStore,
  selectIsCollapsed,
  selectIsMobile,
  selectIsTablet,
  selectIsSidebarOpen,
} from '@/stores/sidebar-store';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/stores/auth-store';
import { WorkspaceSelector } from './workspace-selector';
import { NavigationMenu } from './navigation-menu';

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

export const AppSidebar = ({ onCloseMobile }: AppSidebarProps) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const isCollapsed = useSidebarStore(selectIsCollapsed);
  const isMobile = useSidebarStore(selectIsMobile);
  const isTablet = useSidebarStore(selectIsTablet);
  const isSidebarOpen = useSidebarStore(selectIsSidebarOpen);

  const { setCollapsed, setMobile, setTablet, setSidebarOpen } = useSidebarStore();

  // Initialize real-time badge counts
  useBadgeCounts();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      const newIsTablet = width >= 768 && width < 1024;

      setMobile(newIsMobile);
      setTablet(newIsTablet);

      // Auto-collapse on tablet
      if (newIsTablet && !isCollapsed) {
        setCollapsed(true);
      }

      // Auto-expand on desktop if previously collapsed on tablet
      if (!newIsTablet && !newIsMobile && isCollapsed) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, setCollapsed, setMobile, setTablet]);

  const handleCloseMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    onCloseMobile?.();
  };

  if (!isAuthenticated) {
    return null;
  }

  // Mobile overlay behavior
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleCloseMobile}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-background border-r border-border transition-transform duration-300 ease-in-out lg:hidden',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          data-sidebar
        >
          <SidebarContent onCloseMobile={handleCloseMobile} />
        </div>
      </>
    );
  }

  // Desktop/Tablet sidebar
  return (
    <div
      className={cn(
        'flex h-full flex-col bg-background border-r border-border transition-all duration-300 ease-in-out',
        // Responsive width
        isTablet ? 'w-16' : isCollapsed ? 'w-16' : 'w-64',
        'relative z-10',
      )}
      data-sidebar
    >
      <SidebarContent isCollapsed={isCollapsed || isTablet} showCloseButton={false} />
    </div>
  );
};

interface SidebarContentProps {
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
  showCloseButton?: boolean;
}

const SidebarContent = ({ isCollapsed = false, onCloseMobile, showCloseButton = true }: SidebarContentProps) => {
  return (
    <>
      {/* Workspace Selector at Top */}
      <div className={cn('p-3', isCollapsed && 'px-2')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <WorkspaceSelector isCollapsed={isCollapsed} disablePadding showAvatar={true} className="w-full" />
          </div>
          {/* Close button for mobile */}
          {!isCollapsed && showCloseButton && onCloseMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        <div className={cn('space-y-4', isCollapsed ? 'p-2' : 'p-4')}>
          {/* Navigation Menu */}
          <NavigationMenu isCollapsed={isCollapsed} />
        </div>
      </div>
    </>
  );
};
