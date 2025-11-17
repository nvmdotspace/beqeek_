import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@workspace/ui/components/dropdown-menu';
import { ChevronDown, Plus, Zap } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import {
  useSidebarStore,
  selectCurrentWorkspace,
  selectAvailableWorkspaces,
  type Workspace,
} from '@/stores/sidebar-store';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/stores/auth-store';
import type { Workspace as ApiWorkspace } from '@/shared/api/types';
import { useCurrentLocale } from '@/hooks/use-current-locale';
import { getWorkspaceLogo, getWorkspaceInitials } from '@/shared/utils/workspace-logo';

interface WorkspaceSelectorProps {
  isCollapsed?: boolean;
  className?: string;
  disablePadding?: boolean;
  showAvatar?: boolean;
}

// Helper to get workspace avatar src with fallback
const getWorkspaceAvatarSrc = (workspace: Workspace | null): string | undefined => {
  if (!workspace) return undefined;
  return getWorkspaceLogo({
    workspaceName: workspace.workspaceName,
    thumbnailLogo: workspace.thumbnailLogo,
    logo: workspace.logo,
    namespace: workspace.namespace,
  });
};

export const WorkspaceSelector = ({
  isCollapsed = false,
  className,
  disablePadding = false,
  showAvatar = true,
}: WorkspaceSelectorProps) => {
  const navigate = useNavigate();
  const { data: workspacesData, isLoading } = useWorkspaces();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const availableWorkspaces = useSidebarStore(selectAvailableWorkspaces);
  const { setCurrentWorkspace, setAvailableWorkspaces } = useSidebarStore();

  // Update available workspaces when data changes
  useEffect(() => {
    if (workspacesData?.data) {
      // Convert API workspaces to sidebar workspaces
      const convertedWorkspaces: Workspace[] = workspacesData.data.map((ws: ApiWorkspace) => ({
        id: ws.id,
        workspaceName: ws.workspaceName,
        namespace: ws.namespace,
        description: ws.description,
        logo: ws.logo,
        thumbnailLogo: ws.thumbnailLogo,
        // API doesn't provide these counts yet, set to 0 for now
        memberCount: 0,
        tableCount: 0,
        workflowCount: 0,
      }));
      setAvailableWorkspaces(convertedWorkspaces);

      if (!currentWorkspace) {
        const firstWorkspace = convertedWorkspaces.at(0);
        if (firstWorkspace) {
          setCurrentWorkspace(firstWorkspace);
        }
      }
    }
  }, [workspacesData?.data, setAvailableWorkspaces, currentWorkspace, setCurrentWorkspace]);

  const locale = useCurrentLocale();

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    // Navigate to tables page with workspace context
    navigate({
      to: '/$locale/workspaces/$workspaceId/tables',
      params: {
        locale,
        workspaceId: workspace.id,
      },
    });
  };

  const handleCreateWorkspace = () => {
    // For now, navigate to main workspaces page
    navigate({
      to: '/$locale/workspaces',
      params: { locale },
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const containerClass = disablePadding ? '' : 'p-3';

  if (isCollapsed) {
    // Collapsed state - show only icon button with workspace avatar
    return (
      <div className={cn(containerClass, className, 'flex items-center justify-center')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {currentWorkspace ? (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg p-0">
                <Avatar className="h-8 w-8 flex-shrink-0 rounded-lg">
                  <AvatarImage src={getWorkspaceAvatarSrc(currentWorkspace)} />
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground rounded-lg">
                    {getWorkspaceInitials(currentWorkspace.workspaceName)}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">{m.workspace_selector_ariaLabel()}</span>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
                <span className="sr-only">{m.workspace_selector_ariaLabel()}</span>
              </Button>
            )}
          </DropdownMenuTrigger>
          <WorkspaceDropdownContent
            filteredWorkspaces={availableWorkspaces}
            isLoading={isLoading}
            currentWorkspace={currentWorkspace}
            handleWorkspaceSelect={handleWorkspaceSelect}
            handleCreateWorkspace={handleCreateWorkspace}
          />
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={cn(containerClass, className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between hover:bg-accent h-auto py-1.5 px-1.5 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label={m.workspace_selector_ariaLabel()}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {showAvatar && currentWorkspace && (
                <Avatar className="h-8 w-8 flex-shrink-0 rounded-lg">
                  <AvatarImage src={getWorkspaceAvatarSrc(currentWorkspace)} />
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground rounded-lg">
                    {getWorkspaceInitials(currentWorkspace.workspaceName)}
                  </AvatarFallback>
                </Avatar>
              )}
              {showAvatar && !currentWorkspace && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
              )}
              <span className="text-sm font-semibold truncate text-left">
                {currentWorkspace?.workspaceName || m.workspace_selector_noWorkspace()}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <WorkspaceDropdownContent
          filteredWorkspaces={availableWorkspaces}
          isLoading={isLoading}
          currentWorkspace={currentWorkspace}
          handleWorkspaceSelect={handleWorkspaceSelect}
          handleCreateWorkspace={handleCreateWorkspace}
        />
      </DropdownMenu>
    </div>
  );
};

interface WorkspaceDropdownContentProps {
  filteredWorkspaces: Workspace[];
  isLoading: boolean;
  currentWorkspace: Workspace | null;
  handleWorkspaceSelect: (workspace: Workspace) => void;
  handleCreateWorkspace: () => void;
}

const WorkspaceDropdownContent = ({
  filteredWorkspaces,
  isLoading,
  currentWorkspace,
  handleWorkspaceSelect,
  handleCreateWorkspace,
}: WorkspaceDropdownContentProps) => {
  return (
    <DropdownMenuContent className="w-56" align="start" sideOffset={4}>
      {/* Workspace List */}
      <DropdownMenuGroup>
        {isLoading ? (
          <div className="p-2 text-center text-sm text-muted-foreground">{m.workspace_selector_loading()}</div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">{m.workspace_selector_noWorkspaces()}</div>
        ) : (
          filteredWorkspaces.map((workspace) => {
            const isSelected = currentWorkspace?.id === workspace.id;
            return (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className="flex items-center gap-2.5 py-2 px-2.5 cursor-pointer"
              >
                <Avatar className="h-8 w-8 flex-shrink-0 rounded-lg">
                  <AvatarImage src={getWorkspaceAvatarSrc(workspace)} />
                  <AvatarFallback className="text-xs font-semibold rounded-lg">
                    {getWorkspaceInitials(workspace.workspaceName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate flex-1">{workspace.workspaceName}</span>
                {isSelected && (
                  <svg
                    className="h-4 w-4 text-foreground flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Add New Team Action */}
      <DropdownMenuItem
        onClick={handleCreateWorkspace}
        className="flex items-center gap-2.5 py-2 px-2.5 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">{m.workspace_selector_createWorkspace()}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};
