import { useEffect } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
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
import { ActivityTracking } from './activity-tracking';

interface AppSidebarProps {
  onToggle?: () => void;
  onCloseMobile?: () => void;
}

export const AppSidebar = ({ onToggle, onCloseMobile }: AppSidebarProps) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const isCollapsed = useSidebarStore(selectIsCollapsed);
  const isMobile = useSidebarStore(selectIsMobile);
  const isTablet = useSidebarStore(selectIsTablet);
  const isSidebarOpen = useSidebarStore(selectIsSidebarOpen);

  const { setCollapsed, setMobile, setTablet, setSidebarOpen, toggleSidebar } = useSidebarStore();

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

  const handleToggle = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setCollapsed(!isCollapsed);
    }
    onToggle?.();
  };

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
            'fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-sidebar border-r border-border transition-transform duration-300 ease-in-out lg:hidden',
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
        'flex h-full flex-col bg-sidebar border-r border-border transition-all duration-300 ease-in-out',
        // Responsive width
        isTablet ? 'w-16' : isCollapsed ? 'w-16' : 'w-64',
        'relative z-10',
      )}
      data-sidebar
    >
      <SidebarContent isCollapsed={isCollapsed || isTablet} onToggle={handleToggle} showCloseButton={false} />
    </div>
  );
};

interface SidebarContentProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCloseMobile?: () => void;
  showCloseButton?: boolean;
}

const SidebarContent = ({
  isCollapsed = false,
  onToggle,
  onCloseMobile,
  showCloseButton = true,
}: SidebarContentProps) => {
    return (
    <>
      {/* Sidebar Header - Logo Only */}
      <div
        className={cn(
          'flex items-center justify-between p-4',
          isCollapsed && 'justify-center px-2 py-3',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <span className="text-lg font-bold">B</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold">BEQEEK</h1>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            {/* Close button for mobile */}
            {showCloseButton && onCloseMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseMobile}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Collapse toggle for desktop/tablet */}
            {onToggle && !showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Workspace Selector Section */}
      <div className={cn('border-b border-border p-4', isCollapsed && 'px-2 py-3')}>
        {isCollapsed ? (
          <WorkspaceSelector isCollapsed disablePadding className="w-full justify-center" />
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">{m.sidebar_workspace()}</p>
            <WorkspaceSelector disablePadding showAvatar={true} className="w-full" />
          </div>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        <div className={cn('space-y-4', isCollapsed ? 'p-2' : 'p-4')}>
          {/* Navigation Menu */}
          <NavigationMenu isCollapsed={isCollapsed} />

          {/* Activity Tracking - Only show when not collapsed */}
          {!isCollapsed && <ActivityTracking />}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className={cn('border-t border-border p-4', isCollapsed && 'px-2')}>
        {/* User Profile */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer',
            isCollapsed && 'justify-center',
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="text-xs">JD</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          )}
        </div>

        {/* Expand button for collapsed state */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full mt-2 h-8 text-muted-foreground hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
};
