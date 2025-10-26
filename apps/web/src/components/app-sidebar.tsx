import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import {
  Home,
  Users,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  BarChart3,
  Calendar,
  MessageSquare,
  Search,
  Plus,
  Folder,
  Star,
  Archive,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar = ({ isCollapsed, onToggle, isMobile, onCloseMobile }: AppSidebarProps) => {
  const location = useLocation();
  const { t } = useTranslation();

  const navigationItems = [
    {
      title: t('sidebar.dashboard') || 'Dashboard',
      href: '/dashboard',
      icon: Home,
      badge: null,
    },
    {
      title: t('sidebar.tables') || 'Active Tables',
      href: '/tables',
      icon: FileText,
      badge: '12',
    },
    {
      title: t('sidebar.team') || 'Team',
      href: '/team',
      icon: Users,
      badge: null,
    },
    {
      title: t('sidebar.analytics') || 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      title: t('sidebar.calendar') || 'Calendar',
      href: '/calendar',
      icon: Calendar,
      badge: '3',
    },
    {
      title: t('sidebar.messages') || 'Messages',
      href: '/messages',
      icon: MessageSquare,
      badge: '5',
    },
  ];

  const quickActions = [
    {
      title: t('sidebar.newTable') || 'New Table',
      icon: Plus,
      action: () => console.log('Create new table'),
    },
    {
      title: t('sidebar.search') || 'Search',
      icon: Search,
      action: () => console.log('Open search'),
    },
  ];

  const workspaceItems = [
    {
      title: t('sidebar.starred') || 'Starred',
      href: '/starred',
      icon: Star,
      badge: null,
    },
    {
      title: t('sidebar.projects') || 'Projects',
      href: '/projects',
      icon: Folder,
      badge: '8',
    },
    {
      title: t('sidebar.archived') || 'Archived',
      href: '/archived',
      icon: Archive,
      badge: null,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-sidebar border-r border-border transition-all duration-300 ease-in-out',
        // Mobile: Full width sidebar
        isMobile && 'w-80 max-w-[85vw]',
        // Desktop/Tablet: Responsive width
        !isMobile && (isCollapsed ? 'w-16' : 'w-64'),
        // Ensure proper z-index and positioning
        'relative z-10'
      )}
    >
      {/* Sidebar Header */}
      <div className={cn(
        'flex items-center justify-between border-b border-border p-4',
        isCollapsed && !isMobile && 'px-2'
      )}>
        {/* Logo and Brand */}
        <div className={cn(
          'flex items-center gap-3',
          isCollapsed && !isMobile && 'justify-center'
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Beqeek</span>
              <span className="text-xs text-muted-foreground">Workspace</span>
            </div>
          )}
        </div>

        {/* Close button for mobile */}
        {isMobile && (
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
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'h-8 w-8 text-muted-foreground hover:text-foreground',
              isCollapsed && 'hidden'
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        <div className="space-y-6 p-4">
          {/* Quick Actions - Only show when not collapsed or on mobile */}
          {(!isCollapsed || isMobile) && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('sidebar.quickActions') || 'Quick Actions'}
              </h3>
              <div className="space-y-1">
                {quickActions.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-9 px-3 text-sm font-normal"
                    onClick={item.action}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="space-y-2">
            {(!isCollapsed || isMobile) && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('sidebar.navigation') || 'Navigation'}
              </h3>
            )}
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive(item.href) && 'bg-accent text-accent-foreground',
                    isCollapsed && !isMobile && 'justify-center px-2'
                  )}
                  onClick={isMobile ? onCloseMobile : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <>
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {isCollapsed && !isMobile && item.badge && (
                    <div className="absolute left-full ml-2 rounded bg-accent px-1.5 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.badge}
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Workspace Section */}
          <div className="space-y-2">
            {(!isCollapsed || isMobile) && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('sidebar.workspace') || 'Workspace'}
              </h3>
            )}
            <nav className="space-y-1">
              {workspaceItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive(item.href) && 'bg-accent text-accent-foreground',
                    isCollapsed && !isMobile && 'justify-center px-2'
                  )}
                  onClick={isMobile ? onCloseMobile : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <>
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className={cn(
        'border-t border-border p-4',
        isCollapsed && !isMobile && 'px-2'
      )}>
        {/* Settings and Help */}
        <div className={cn(
          'space-y-1 mb-4',
          isCollapsed && !isMobile && 'space-y-2'
        )}>
          <Link
            to="/settings/encryption"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive('/settings/encryption') && 'bg-accent text-accent-foreground',
              isCollapsed && !isMobile && 'justify-center px-2'
            )}
            onClick={isMobile ? onCloseMobile : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="truncate">{t('sidebar.settings') || 'Settings'}</span>
            )}
          </Link>
          
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
              'hover:bg-accent hover:text-accent-foreground',
              isCollapsed && !isMobile && 'justify-center px-2'
            )}
            onClick={isMobile ? onCloseMobile : undefined}
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="truncate">{t('sidebar.help') || 'Help & Support'}</span>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer',
          isCollapsed && !isMobile && 'justify-center'
        )}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="text-xs">JD</AvatarFallback>
          </Avatar>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          )}
        </div>

        {/* Expand button for collapsed state */}
        {isCollapsed && !isMobile && (
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
    </div>
  );
};
