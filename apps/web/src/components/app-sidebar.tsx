import { useEffect, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { X, Search } from 'lucide-react';
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
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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

      // Note: Removed auto-expand logic to allow manual collapse on desktop
      // Users can manually toggle collapse/expand on desktop via the button
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
  const [searchQuery, setSearchQuery] = useState('');

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

      {/* Search Bar - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-muted-foreground" />
            <Input
              placeholder={m.common_searchPlaceholder()}
              className="pl-9 pr-12 w-full h-10 bg-muted/30 border-border/40 rounded-lg transition-all hover:bg-muted/50 focus:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/40 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60 opacity-100">
              /
            </kbd>
          </div>
        </div>
      )}

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
