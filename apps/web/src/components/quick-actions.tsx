import { useMemo, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Search, FileText, Upload, Download, Database, Workflow, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import {
  useSidebarStore,
  selectCurrentWorkspace,
  selectActiveSection,
  selectCanCreateItem,
} from '@/stores/sidebar-store';

interface QuickActionsProps {
  isCollapsed?: boolean;
  className?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  requiresPermission?: string;
  requiresWorkspace?: boolean;
  context?: string[];
}

export const QuickActions = ({ isCollapsed = false, className }: QuickActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const activeSection = useSidebarStore(selectActiveSection);
  const canCreateItem = useSidebarStore(selectCanCreateItem);

  // Action handlers
  const handleSearch = useCallback(() => {
    // For now, navigate to workspaces page (placeholder for search)
    navigate({ to: '/workspaces' });
  }, [navigate]);

  const handleCreateTable = useCallback(() => {
    if (currentWorkspace) {
      // For now, navigate to tables page with workspace context
      navigate({
        to: '/workspaces/tables',
        search: { workspaceId: currentWorkspace.id },
      });
    }
  }, [currentWorkspace, navigate]);

  const handleCreateWorkflow = useCallback(() => {
    if (currentWorkspace) {
      // For now, navigate to tables page (placeholder for workflow)
      navigate({
        to: '/workspaces/tables',
        search: { workspaceId: currentWorkspace.id },
      });
    }
  }, [currentWorkspace, navigate]);

  const handleCreateForm = useCallback(() => {
    if (currentWorkspace) {
      // For now, navigate to tables page (placeholder for forms)
      navigate({
        to: '/workspaces/tables',
        search: { workspaceId: currentWorkspace.id },
      });
    }
  }, [currentWorkspace, navigate]);

  const handleImportData = useCallback(() => {
    if (currentWorkspace) {
      // For now, navigate to tables page (placeholder for import)
      navigate({
        to: '/workspaces/tables',
        search: { workspaceId: currentWorkspace.id },
      });
    }
  }, [currentWorkspace, navigate]);

  const handleExportData = useCallback(() => {
    if (currentWorkspace) {
      // For now, navigate to tables page (placeholder for export)
      navigate({
        to: '/workspaces/tables',
        search: { workspaceId: currentWorkspace.id },
      });
    }
  }, [currentWorkspace, navigate]);

  const handleInviteMember = useCallback(() => {
    if (currentWorkspace) {
      // For now, navigate to workspaces page (placeholder for team)
      navigate({ to: '/workspaces' });
    }
  }, [currentWorkspace, navigate]);

  // Context-aware quick actions based on current section
  const contextualActions = useMemo<QuickAction[]>(() => {
    const baseActions: QuickAction[] = [
      {
        id: 'search',
        label: t('quickActions.search') || 'Search',
        icon: Search,
        action: () => handleSearch(),
        shortcut: 'Ctrl+K',
      },
      {
        id: 'new-table',
        label: t('quickActions.newTable') || 'New Table',
        icon: Database,
        action: () => handleCreateTable(),
        shortcut: 'Ctrl+Shift+T',
        requiresPermission: 'table',
        requiresWorkspace: true,
        context: ['tables', 'dashboard'],
      },
      {
        id: 'new-workflow',
        label: t('quickActions.newWorkflow') || 'New Workflow',
        icon: Workflow,
        action: () => handleCreateWorkflow(),
        shortcut: 'Ctrl+Shift+W',
        requiresPermission: 'workflow',
        requiresWorkspace: true,
        context: ['workflow', 'dashboard'],
      },
      {
        id: 'new-form',
        label: t('quickActions.newForm') || 'New Form',
        icon: FileText,
        action: () => handleCreateForm(),
        requiresPermission: 'workflow',
        requiresWorkspace: true,
        context: ['workflow'],
      },
      {
        id: 'import-data',
        label: t('quickActions.importData') || 'Import Data',
        icon: Upload,
        action: () => handleImportData(),
        requiresPermission: 'table',
        requiresWorkspace: true,
        context: ['tables'],
      },
      {
        id: 'export-data',
        label: t('quickActions.exportData') || 'Export Data',
        icon: Download,
        action: () => handleExportData(),
        requiresPermission: 'table',
        requiresWorkspace: true,
        context: ['tables'],
      },
      {
        id: 'invite-member',
        label: t('quickActions.inviteMember') || 'Invite Member',
        icon: Users,
        action: () => handleInviteMember(),
        requiresPermission: 'team',
        requiresWorkspace: true,
        context: ['team'],
      },
    ];

    // Filter by active section while keeping base search action
    return baseActions.filter((action) => {
      if (!action.context || action.context.length === 0) return true;
      if (!activeSection) return true;
      return action.context.includes(activeSection) || action.context.includes('dashboard');
    });
  }, [
    activeSection,
    t,
    handleSearch,
    handleCreateTable,
    handleCreateWorkflow,
    handleCreateForm,
    handleImportData,
    handleExportData,
    handleInviteMember,
  ]);

  const isActionDisabled = (action: QuickAction) => {
    const lacksWorkspace = action.requiresWorkspace && !currentWorkspace;
    const lacksPermission = action.requiresPermission ? !canCreateItem(action.requiresPermission) : false;
    return lacksWorkspace || lacksPermission;
  };

  if (isCollapsed) {
    // Collapsed state - show only primary actions
    return (
      <div className={cn('px-2 py-1', className)}>
        <div className="flex flex-col gap-1">
          {contextualActions.slice(0, 3).map((action) => {
            const disabled = isActionDisabled(action);
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 justify-center"
                onClick={() => !disabled && action.action()}
                title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
                disabled={disabled}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('px-3 py-2', className)}>
      {/* Section Header */}
      <div className="mb-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t('quickActions.title') || 'Quick Actions'}
        </h3>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-2">
        {contextualActions.map((action) => {
          const disabled = isActionDisabled(action);
          return (
            <Button
              key={action.id}
              variant={action.id === 'search' ? 'outline' : 'secondary'}
              size="sm"
              className={cn(
                'justify-start gap-2 h-9 text-xs font-medium',
                action.id === 'search' ? 'col-span-2' : 'min-w-0',
                disabled && 'opacity-60 cursor-not-allowed',
              )}
              onClick={() => !disabled && action.action()}
              disabled={disabled}
              title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
            >
              <action.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
