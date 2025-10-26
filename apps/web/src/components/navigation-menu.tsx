import { useEffect, useMemo } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@workspace/ui/lib/utils';
import { Badge } from '@workspace/ui/components/badge';
import {
  Activity,
  Archive,
  Bell,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  FileText,
  HelpCircle,
  Home,
  Plus,
  Search as SearchIcon,
  Settings,
  Shield,
  Star,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import {
  useSidebarStore,
  selectCurrentWorkspace,
  selectBadgeCounts,
  selectCanViewSection,
  selectActiveSection,
} from '@/stores/sidebar-store';

interface NavigationMenuProps {
  isCollapsed?: boolean;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: keyof ReturnType<typeof selectBadgeCounts>;
  requiresPermission?: string;
  children?: NavigationItem[];
  isSection?: boolean;
}

export const NavigationMenu = ({ isCollapsed = false, className }: NavigationMenuProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const badgeCounts = useSidebarStore(selectBadgeCounts);
  const canViewSection = useSidebarStore(selectCanViewSection);
  const activeSection = useSidebarStore(selectActiveSection);
  const { toggleSection, expandedSections } = useSidebarStore();
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);

  // Navigation structure based on UX analysis
  const navigationStructure: NavigationItem[] = useMemo(
    () => [
      // Global Navigation (always visible)
      {
        id: 'dashboard',
        label: t('navigation.dashboard') || 'Dashboard',
        href: '/workspaces',
        icon: Home,
      },
      {
        id: 'search',
        label: t('navigation.search') || 'Search',
        href: '/search',
        icon: SearchIcon,
      },
      {
        id: 'notifications',
        label: t('navigation.notifications') || 'Notifications',
        href: '/notifications',
        icon: Bell,
        badge: 'notifications',
      },

      // Quick Actions (require workspace selection)
      ...(currentWorkspace
        ? [
            {
              id: 'quick-actions',
              label: t('navigation.quickActions') || 'Quick Actions',
              icon: Zap,
              isSection: true,
              children: [
                {
                  id: 'new-table',
                  label: t('navigation.newTable') || 'New Table',
                  href: '/workspaces/tables/new',
                  icon: Database,
                  requiresPermission: 'tables',
                },
                {
                  id: 'new-workflow',
                  label: t('navigation.newWorkflow') || 'New Workflow',
                  href: '/workspaces/workflows/new',
                  icon: Workflow,
                  requiresPermission: 'workflow',
                },
                {
                  id: 'new-form',
                  label: t('navigation.newForm') || 'New Form',
                  href: '/workspaces/forms/new',
                  icon: FileText,
                  requiresPermission: 'forms',
                },
              ],
            },
          ]
        : []),

      // Workspace Features (require workspace selection)
      ...(currentWorkspace
        ? [
            {
              id: 'workspace-features',
              label: t('navigation.workspaceFeatures') || 'Workspace Features',
              icon: ChevronDown,
              isSection: true,
              children: [
                {
                  id: 'tables',
                  label: t('navigation.tables') || 'Active Tables',
                  href: '/workspaces/tables',
                  icon: Database,
                  badge: 'tables' as keyof ReturnType<typeof selectBadgeCounts>,
                  requiresPermission: 'tables',
                },
                {
                  id: 'workflow',
                  label: t('navigation.workflow') || 'Workflow',
                  href: '/workspaces/workflows',
                  icon: Workflow,
                  badge: 'workflows' as keyof ReturnType<typeof selectBadgeCounts>,
                  requiresPermission: 'workflow',
                },
                {
                  id: 'team',
                  label: t('navigation.team') || 'Team',
                  href: '/workspaces/team',
                  icon: Users,
                  badge: 'teamMembers' as keyof ReturnType<typeof selectBadgeCounts>,
                  requiresPermission: 'team',
                },
                {
                  id: 'roles',
                  label: t('navigation.roles') || 'Roles & Permissions',
                  href: '/workspaces/roles',
                  icon: Shield,
                  requiresPermission: 'roles',
                },
                {
                  id: 'analytics',
                  label: t('navigation.analytics') || 'Analytics',
                  href: '/workspaces/analytics',
                  icon: Activity,
                  requiresPermission: 'analytics',
                },
              ],
            },
          ]
        : []),

      // Organization (require workspace selection)
      ...(currentWorkspace
        ? [
            {
              id: 'organization',
              label: t('navigation.organization') || 'Organization',
              icon: ChevronDown,
              isSection: true,
              children: [
                {
                  id: 'starred',
                  label: t('navigation.starred') || 'Starred',
                  href: '/workspaces/starred',
                  icon: Star,
                },
                {
                  id: 'recent-activity',
                  label: t('navigation.recentActivity') || 'Recent Activity',
                  href: '/workspaces/recent-activity',
                  icon: Clock,
                },
                {
                  id: 'archived',
                  label: t('navigation.archived') || 'Archived',
                  href: '/workspaces/archived',
                  icon: Archive,
                },
              ],
            },
          ]
        : []),

      // System Navigation (always visible)
      {
        id: 'system',
        label: t('navigation.system') || 'System',
        icon: ChevronDown,
        isSection: true,
        children: [
          {
            id: 'settings',
            label: t('navigation.settings') || 'Settings',
            href: '/settings/encryption',
            icon: Settings,
          },
          {
            id: 'help',
            label: t('navigation.help') || 'Help & Support',
            href: '/help',
            icon: HelpCircle,
          },
        ],
      },
    ],
    [badgeCounts, currentWorkspace, t],
  );

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleSectionToggle = (sectionId: string) => {
    toggleSection(sectionId);
  };

  const findActiveSectionId = (items: NavigationItem[], path: string): string | null => {
    for (const item of items) {
      if (item.href && (path === item.href || path.startsWith(item.href + '/'))) {
        return item.id;
      }

      if (item.children) {
        const match = findActiveSectionId(item.children, path);
        if (match) {
          return match;
        }
      }
    }

    return null;
  };

  useEffect(() => {
    const matchedSection = findActiveSectionId(navigationStructure, location.pathname);
    if (matchedSection && matchedSection !== activeSection) {
      setActiveSection(matchedSection);
    } else if (!matchedSection && activeSection !== 'dashboard') {
      setActiveSection('dashboard');
    }
  }, [location.pathname, navigationStructure, setActiveSection, activeSection]);

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    // Check permissions
    if (item.requiresPermission && !canViewSection(item.requiresPermission)) {
      return null;
    }

    const isExpanded = expandedSections.includes(item.id);

    if (item.isSection) {
      // Section header
      return (
        <div key={item.id} className="space-y-1 mt-4 first:mt-0">
          {!isCollapsed && (
            <button
              onClick={() => handleSectionToggle(item.id)}
              className="flex items-center gap-2 w-full p-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {item.label}
            </button>
          )}

          {isExpanded && item.children?.map((child) => renderNavigationItem(child, level + 1))}
        </div>
      );
    }

    // Regular navigation item
    const badgeValue = item.badge ? badgeCounts[item.badge] : undefined;
    const active = isActive(item.href);

    return (
      <Link
        key={item.id}
        to={item.href || '#'}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          active && 'bg-accent text-accent-foreground',
          isCollapsed && 'justify-center px-2',
        )}
        aria-current={active ? 'page' : undefined}
        onClick={() => setActiveSection(item.id)}
      >
        <item.icon className="h-4 w-4 shrink-0" />

        {!isCollapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {badgeValue !== undefined && badgeValue > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {badgeValue > 99 ? '99+' : badgeValue}
              </Badge>
            )}
          </>
        )}

        {isCollapsed && badgeValue !== undefined && badgeValue > 0 && (
          <div className="absolute left-full ml-2 rounded bg-accent px-1.5 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {badgeValue > 99 ? '99+' : badgeValue}
          </div>
        )}
      </Link>
    );
  };

  return (
    <nav className={cn('space-y-2', className)}>{navigationStructure.map((item) => renderNavigationItem(item))}</nav>
  );
};
