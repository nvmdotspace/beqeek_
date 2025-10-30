import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@workspace/ui/lib/utils';
import { Badge } from '@workspace/ui/components/badge';
import { Home, Database, Bell, Menu, Plus, Search } from 'lucide-react';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import {
  useSidebarStore,
  selectCurrentWorkspace,
  selectBadgeCounts,
  selectCanViewSection,
  selectCanCreateItem,
} from '@/stores/sidebar-store';
import React from 'react';

interface MobileBottomNavProps {
  className?: string;
}

interface MobileNavItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: keyof ReturnType<typeof selectBadgeCounts>;
  requiresPermission?: string;
  action?: () => void;
}

export const MobileBottomNav = ({ className }: MobileBottomNavProps) => {
  const location = useLocation();
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const badgeCounts = useSidebarStore(selectBadgeCounts);
  const canViewSection = useSidebarStore(selectCanViewSection);
  const canCreateItem = useSidebarStore(selectCanCreateItem);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Mobile navigation structure - simplified for bottom nav
  const mobileNavItems: MobileNavItem[] = [
    {
      id: 'dashboard',
      label: m.navigation_dashboard(),
      href: '/workspaces',
      icon: Home,
    },
    {
      id: 'tables',
      label: m.navigation_tables(),
      href: currentWorkspace ? '/workspaces/tables' : '/workspaces',
      icon: Database,
      badge: 'tables',
      requiresPermission: 'tables',
    },
    {
      id: 'notifications',
      label: m.navigation_notifications(),
      href: '/notifications',
      icon: Bell,
      badge: 'notifications',
    },
    {
      id: 'search',
      label: m.navigation_search(),
      href: '/search',
      icon: Search,
    },
    {
      id: 'menu',
      label: m.navigation_menu(),
      icon: Menu,
      action: () => toggleSidebar(),
    },
  ];

  // Filter items based on permissions and workspace context
  const filteredItems = mobileNavItems.filter((item) => {
    // Check workspace requirements
    if (item.id !== 'dashboard' && item.id !== 'menu' && !currentWorkspace) {
      return false;
    }

    // Check permissions
    return !(item.requiresPermission && !canViewSection(item.requiresPermission));


  });

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden',
        'safe-area-inset-bottom', // Account for iPhone home indicator
        className,
      )}
    >
      <nav className="flex items-center justify-around h-16 px-2">
        {filteredItems.map((item) => {
          const badgeValue = item.badge ? badgeCounts[item.badge] : undefined;
          const active = isActive(item.href);

          if (item.action) {
            // Action button (like menu toggle)
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-0 flex-1 h-full py-1 px-2',
                  'text-muted-foreground hover:text-foreground transition-colors',
                  active && 'text-foreground',
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {badgeValue !== undefined && badgeValue > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {badgeValue > 9 ? '9+' : badgeValue}
                    </Badge>
                  )}
                </div>
                <span className="text-xs truncate max-w-full">{item.label}</span>
              </button>
            );
          }

          // Navigation link
          return (
            <Link
              key={item.id}
              to={item.href || '#'}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-0 flex-1 h-full py-1 px-2',
                'text-muted-foreground hover:text-foreground transition-colors',
                active && 'text-foreground',
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {badgeValue !== undefined && badgeValue > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {badgeValue > 9 ? '9+' : badgeValue}
                  </Badge>
                )}
              </div>
              <span className="text-xs truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// Floating Action Button for quick actions on mobile
export const MobileFloatingAction = () => {
    const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const canCreateItem = useSidebarStore(selectCanCreateItem);

  // Only show if user can create something in current workspace
  if (!currentWorkspace || !canCreateItem('table')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      <button
        className={cn(
          'h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg',
          'flex items-center justify-center',
          'hover:bg-primary/90 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        )}
        onClick={() => {
          // TODO: Open quick actions modal or navigate to create page
          console.log('Open quick actions');
        }}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};
