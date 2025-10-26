import React, { useState, useEffect } from 'react';

import { AppSidebar } from './app-sidebar';
import { MobileBottomNav, MobileFloatingAction } from './mobile-bottom-nav';
import { Button } from '@workspace/ui/components/button';
import { Menu, Search, Bell, Settings, X } from 'lucide-react';
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

import { useAuthStore } from '@/features/auth';
import { useLogout } from '@/features/auth/hooks/use-logout';

import { useTranslation } from '@/hooks/use-translation';
import {
  useAppKeyboardShortcuts,
  useAccessibilityEnhancements,
  useAriaManagement,
} from '@/hooks/use-keyboard-shortcuts';
import { useSidebarStore } from '@/stores/sidebar-store';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout = ({ children, showSidebar = true }: AppLayoutProps) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userId = useAuthStore((state) => state.userId);
  const logout = useLogout();
  const { t } = useTranslation();
  const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);

  // Initialize keyboard shortcuts and accessibility
  useAppKeyboardShortcuts();
  useAccessibilityEnhancements();
  useAriaManagement();

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileSearchOpen) {
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileSearchOpen]);

  if (!showSidebar) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-background relative">
      <AppSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 relative z-30">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Menu Toggle - handled by sidebar now */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Desktop Search Bar */}
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
                <DropdownMenuItem onClick={() => window.open('/keyboard-shortcuts', '_blank')}>
                  Keyboard Shortcuts
                </DropdownMenuItem>
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
        <main className="flex-1 overflow-auto hide-scrollbar-mobile pb-16 md:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Mobile Floating Action Button */}
      <MobileFloatingAction />
    </div>
  );
};
