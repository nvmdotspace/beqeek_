import React, { useState, useEffect } from 'react';

import { AppSidebar } from './app-sidebar';
import { MobileBottomNav, MobileFloatingAction } from './mobile-bottom-nav';
import { Button } from '@workspace/ui/components/button';
import { Menu, Bell, Settings, X, PanelLeftClose, PanelLeft } from 'lucide-react';
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

// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import {
  useAppKeyboardShortcuts,
  useAccessibilityEnhancements,
  useAriaManagement,
} from '@/hooks/use-keyboard-shortcuts';
import { useSidebarStore } from '@/stores/sidebar-store';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  pageTitle?: string;
  pageIcon?: React.ReactNode;
}

export const AppLayout = ({ children, showSidebar = true, pageTitle, pageIcon }: AppLayoutProps) => {
  const userId = useAuthStore((state) => state.userId);
  const logout = useLogout();

  // Get sidebar state and actions
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isMobile = useSidebarStore((state) => state.isMobile);
  const isTablet = useSidebarStore((state) => state.isTablet);
  const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);

  // Initialize keyboard shortcuts and accessibility
  useAppKeyboardShortcuts();
  useAccessibilityEnhancements();
  useAriaManagement();

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(true);
    } else {
      setCollapsed(!isCollapsed);
    }
  };

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
          <div className="flex items-center gap-2 flex-1">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSidebar}
                className="h-9 w-9"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Desktop Sidebar Toggle - Only show on desktop (lg+), hide on tablet */}
            {!isTablet && !isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSidebar}
                className="h-9 w-9"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>
            )}

            {/* Page Title */}
            {pageTitle && <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 text-[10px] font-semibold flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Workspace Settings</DropdownMenuItem>
                <DropdownMenuItem>Integrations</DropdownMenuItem>
                <DropdownMenuItem>Security</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt={userId || ''} />
                    <AvatarFallback>{userId?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{'User'}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open('/keyboard-shortcuts', '_blank')}>
                  Keyboard Shortcuts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => logout()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

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
