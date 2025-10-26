import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Home,
  BarChart3,
  Folder,
  Zap,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  Menu,
  X,
} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu';

import { cn } from '@workspace/ui/lib/utils';
import { useAuthStore } from '@/features/auth';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useLanguageStore } from '@/stores/language-store';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/workspaces',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    icon: Folder,
    children: [
      {
        id: 'active-tables',
        label: 'Active Tables',
        icon: Folder,
        href: '/workspaces/tables',
      },
      {
        id: 'workflows',
        label: 'Workflows',
        icon: Zap,
        href: '/workflows',
      },
      {
        id: 'connectors',
        label: 'Connectors',
        icon: Settings,
        href: '/connectors',
      },
    ],
  },
  {
    id: 'team',
    label: 'Team Management',
    icon: Users,
    children: [
      {
        id: 'members',
        label: 'Members',
        icon: Users,
        href: '/team/members',
      },
      {
        id: 'roles',
        label: 'Roles',
        icon: Settings,
        href: '/team/roles',
      },
      {
        id: 'permissions',
        label: 'Permissions',
        icon: Settings,
        href: '/team/permissions',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      {
        id: 'workspace-settings',
        label: 'Workspace Settings',
        icon: Settings,
        href: '/settings/workspace',
      },
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Settings,
        href: '/settings/integrations',
      },
      {
        id: 'security',
        label: 'Security',
        icon: Settings,
        href: '/settings/security',
      },
    ],
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    href: '/help',
  },
];

interface SidebarItemProps {
  item: NavItem;
  level?: number;
  isCollapsed?: boolean;
}

const SidebarItem = ({
  item,
  level = 0,
  isCollapsed = false,
  onItemClick,
}: SidebarItemProps & { onItemClick?: () => void }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const getLocalizedPath = useLanguageStore((state) => state.getLocalizedPath);

  const toPath = item.href ? getLocalizedPath(item.href) : undefined;
  const isActive = toPath ? location.pathname === toPath : false;
  const hasChildren = item.children && item.children.length > 0;

  const toggleExpanded = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  if (hasChildren) {
    return (
      <div className="w-full">
        <button
          onClick={toggleExpanded}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            level > 0 && 'pl-6',
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            {!isCollapsed && <span>{item.label}</span>}
          </div>
          {!isCollapsed && <ChevronRight className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')} />}
        </button>

        {isExpanded && !isCollapsed && item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <SidebarItem key={child.id} item={child} level={level + 1} isCollapsed={isCollapsed} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={toPath!}
      preload="intent"
      activeOptions={{ exact: true }}
      activeProps={{ className: 'bg-primary text-primary-foreground' }}
      onClick={onItemClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground',
        level > 0 && 'pl-6',
      )}
    >
      <item.icon className="h-4 w-4" />
      {!isCollapsed && <span>{item.label}</span>}
      {!isCollapsed && item.badge && (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
};

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar = ({ isCollapsed = false, onToggle, isMobile = false, onCloseMobile }: AppSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const userId = useAuthStore((state) => state.userId);

  const currentWorkspace = workspaces?.data?.[0];

  const filteredNavItems = navItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.children?.some((child) => child.label.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleItemClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background',
        isMobile ? 'w-64 fixed inset-y-0 left-0 z-50' : '',
        isCollapsed && !isMobile ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">B</span>
            </div>
            <span className="text-lg font-semibold">BEQEEK</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onCloseMobile} className="h-8 w-8 lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed && (
        <div className="border-b p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs">
                    {workspacesLoading ? (
                      <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                    ) : (
                      currentWorkspace?.workspaceName?.[0]?.toUpperCase() || 'W'
                    )}
                  </div>
                  <span className="truncate">
                    {workspacesLoading ? 'Loading...' : currentWorkspace?.workspaceName || 'Select Workspace'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                Create New Workspace
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {workspaces?.data?.map((workspace) => (
                <DropdownMenuItem key={workspace.id}>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs mr-2">
                    {workspace.workspaceName[0]?.toUpperCase()}
                  </div>
                  {workspace.workspaceName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {filteredNavItems.map((item) => (
          <SidebarItem key={item.id} item={item} isCollapsed={isCollapsed} onItemClick={handleItemClick} />
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-sm">{userId?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userId || 'User'}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-sm">{userId?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
