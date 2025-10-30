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
  LayoutGrid,
  Plus,
  Search as SearchIcon,
  Settings,
  Shield,
  Star,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import {
  useSidebarStore,
  selectCurrentWorkspace,
  selectBadgeCounts,
  selectCanViewSection,
  selectActiveSection,
} from '@/stores/sidebar-store';
import { useCurrentLocale } from '@/hooks/use-current-locale';

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
  const location = useLocation();
  const locale = useCurrentLocale();
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const badgeCounts = useSidebarStore(selectBadgeCounts);
  const canViewSection = useSidebarStore(selectCanViewSection);
  const activeSection = useSidebarStore(selectActiveSection);
  const { toggleSection, expandedSections } = useSidebarStore();
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);

  // Navigation structure based on UX analysis
  const navigationStructure: NavigationItem[] = useMemo(
    () => {
      const workspaceId = currentWorkspace?.id;

      return [
        // Global Navigation (always visible)
        {
          id: 'dashboard',
          label: m.navigation_dashboard(),
          href: `/${locale}/workspaces`,
          icon: Home,
        },
        {
          id: 'search',
          label: m.navigation_search(),
          href: `/${locale}/search`,
          icon: SearchIcon,
        },
        {
          id: 'notifications',
          label: m.navigation_notifications(),
          href: `/${locale}/notifications`,
          icon: Bell,
          badge: 'notifications',
        },

        // Quick Actions (require workspace selection)
        ...(currentWorkspace && workspaceId
          ? [
              {
                id: 'quick-actions',
                label: m.navigation_quickActions(),
                icon: Zap,
                isSection: true,
                children: [
                  {
                    id: 'new-table',
                    label: m.navigation_newTable(),
                    href: `/${locale}/workspaces/${workspaceId}/tables/new`,
                    icon: Database,
                    requiresPermission: 'tables',
                  },
                  {
                    id: 'new-workflow',
                    label: m.navigation_newWorkflow(),
                    href: `/${locale}/workspaces/${workspaceId}/workflows/new`,
                    icon: Workflow,
                    requiresPermission: 'workflow',
                  },
                  {
                    id: 'new-form',
                    label: m.navigation_newForm(),
                    href: `/${locale}/workspaces/${workspaceId}/forms/new`,
                    icon: FileText,
                    requiresPermission: 'forms',
                  },
                ],
              },
            ]
          : []),

        // Workspace Features (require workspace selection)
        ...(currentWorkspace && workspaceId
          ? [
              {
                id: 'workspace-features',
                label: m.navigation_workspaceFeatures(),
                icon: ChevronDown,
                isSection: true,
                children: [
                  {
                    id: 'tables',
                    label: m.navigation_tables(),
                    href: `/${locale}/workspaces/${workspaceId}/tables`,
                    icon: LayoutGrid,
                    badge: 'tables' as keyof ReturnType<typeof selectBadgeCounts>,
                    requiresPermission: 'tables',
                  },
                  {
                    id: 'workflow',
                    label: m.navigation_workflow(),
                    href: `/${locale}/workspaces/${workspaceId}/workflows`,
                    icon: Workflow,
                    badge: 'workflows' as keyof ReturnType<typeof selectBadgeCounts>,
                    requiresPermission: 'workflow',
                  },
                  {
                    id: 'team',
                    label: m.navigation_team(),
                    href: `/${locale}/workspaces/${workspaceId}/team`,
                    icon: Users,
                    badge: 'teamMembers' as keyof ReturnType<typeof selectBadgeCounts>,
                    requiresPermission: 'team',
                  },
                  {
                    id: 'roles',
                    label: m.navigation_roles(),
                    href: `/${locale}/workspaces/${workspaceId}/roles`,
                    icon: Shield,
                    requiresPermission: 'roles',
                  },
                  {
                    id: 'analytics',
                    label: m.navigation_analytics(),
                    href: `/${locale}/workspaces/${workspaceId}/analytics`,
                    icon: Activity,
                    requiresPermission: 'analytics',
                  },
                ],
              },
            ]
          : []),

        // Organization (require workspace selection)
        ...(currentWorkspace && workspaceId
          ? [
              {
                id: 'organization',
                label: m.navigation_organization(),
                icon: ChevronDown,
                isSection: true,
                children: [
                  {
                    id: 'starred',
                    label: m.navigation_starred(),
                    href: `/${locale}/workspaces/${workspaceId}/starred`,
                    icon: Star,
                  },
                  {
                    id: 'recent-activity',
                    label: m.navigation_recentActivity(),
                    href: `/${locale}/workspaces/${workspaceId}/recent-activity`,
                    icon: Clock,
                  },
                  {
                    id: 'archived',
                    label: m.navigation_archived(),
                    href: `/${locale}/workspaces/${workspaceId}/archived`,
                    icon: Archive,
                  },
                ],
              },
            ]
          : []),

        // System Navigation (always visible)
        {
          id: 'system',
          label: m.navigation_system(),
          icon: ChevronDown,
          isSection: true,
          children: [
            {
              id: 'settings',
              label: m.navigation_settings(),
              href: `/${locale}/workspaces`,
              icon: Settings,
            },
            {
              id: 'help',
              label: m.navigation_help(),
              href: `/${locale}/help`,
              icon: HelpCircle,
            },
          ],
        },
      ];
    },
    [badgeCounts, currentWorkspace, locale],
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
              <Badge
                variant="default"
                className="h-5 min-w-[20px] px-1.5 text-xs font-semibold flex items-center justify-center ml-auto"
              >
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
