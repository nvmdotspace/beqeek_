import React, { useState, useEffect } from 'react';

import { AppSidebar } from './app-sidebar';
import { Button } from '@workspace/ui/components/button';
import { Menu, Search, Bell, Settings, X, Mic, Filter } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

import { cn } from '@workspace/ui/lib/utils';
import { useAuthStore } from '@/features/auth';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/hooks/use-translation';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout = ({ children, showSidebar = true }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const userId = useAuthStore((state) => state.userId);
  const logout = useLogout();
  const locale = useLanguageStore((state) => state.locale);
  const { t } = useTranslation();

  // Improved responsive behavior with proper breakpoint handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Update device type states
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Close mobile sidebar when switching to desktop
      if (width >= 1024) {
        setMobileSidebarOpen(false);
        // Reset sidebar collapsed state on desktop
        setSidebarCollapsed(false);
      }
      
      // Auto-collapse sidebar on tablet for better space utilization
      if (width >= 768 && width < 1024) {
        setSidebarCollapsed(true);
      }
      
      // Ensure mobile sidebar is closed when resizing to mobile
      if (width < 768) {
        setMobileSidebarOpen(false);
        // Reset collapsed state for mobile (will be handled by mobile overlay)
        setSidebarCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileSidebarOpen && isMobile) {
        const sidebar = document.querySelector('[data-sidebar]');
        const menuButton = document.querySelector('[data-menu-button]');
        
        if (
          sidebar && 
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)
        ) {
          setMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileSidebarOpen, isMobile]);

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileSearchOpen) {
          setMobileSearchOpen(false);
        }
        if (mobileSidebarOpen && isMobile) {
          setMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileSearchOpen, mobileSidebarOpen, isMobile]);

  if (!showSidebar) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-background relative mobile-viewport-fix">
      {/* Mobile Sidebar Overlay - Only show on mobile */}
      {mobileSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" 
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        data-sidebar
        className={cn(
          'transition-all duration-300 ease-in-out',
          // Mobile: Fixed positioning with transform
          isMobile && [
            'fixed inset-y-0 left-0 z-50',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          ],
          // Tablet and Desktop: Relative positioning
          !isMobile && 'relative',
          // Desktop: Normal behavior
          !isMobile && !isTablet && 'translate-x-0'
        )}
      >
        <AppSidebar
          isCollapsed={!isMobile && sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        'flex flex-1 flex-col overflow-hidden',
        // Adjust margin based on sidebar state and device type
        !isMobile && !sidebarCollapsed && 'ml-0',
        isMobile && 'ml-0'
      )}>
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 relative z-30">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileSidebarOpen(true)}
                data-menu-button
                className="h-9 w-9"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Tablet/Desktop Sidebar Toggle */}
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-9 w-9"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Desktop/Tablet Search Bar */}
            <div className="hidden md:flex relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('common.searchPlaceholder')}
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden flex items-center gap-2 px-3"
            >
              <Search className="h-4 w-4" />
              <span>{t('common.search')}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
            </Button>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>{t('common.workspaceSettings') || 'Workspace Settings'}</DropdownMenuItem>
                <DropdownMenuItem>{t('common.integrations') || 'Integrations'}</DropdownMenuItem>
                <DropdownMenuItem>{t('common.security') || 'Security'}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('common.helpSupport') || 'Help & Support'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt={userId || ''} />
                    <AvatarFallback>{userId?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userId || 'User'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{userId}@beqeek.com</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('common.profile') || 'Profile'}</DropdownMenuItem>
                <DropdownMenuItem>{t('common.settings') || 'Settings'}</DropdownMenuItem>
                <DropdownMenuItem>{t('common.billing') || 'Billing'}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => logout()}>
                  {t('common.logout') || 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Search Overlay */}
        {mobileSearchOpen && (
          <div className="fixed inset-0 bg-background z-50 lg:hidden">
            <div className="flex h-16 items-center gap-3 border-b px-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('common.searchPlaceholder')}
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('common.quickActions') || 'Quick Actions'}
                </div>
                <div className="space-y-1">
                  <div className="p-2 rounded-lg hover:bg-accent cursor-pointer">
                    {t('common.createTable') || 'Create new table'}
                  </div>
                  <div className="p-2 rounded-lg hover:bg-accent cursor-pointer">
                    {t('common.workflowSettings') || 'Workflow settings'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto hide-scrollbar-mobile">{children}</main>
      </div>
    </div>
  );
};
