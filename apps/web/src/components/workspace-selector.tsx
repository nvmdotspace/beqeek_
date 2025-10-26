import { useState, useEffect, useRef } from 'react';
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
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@workspace/ui/components/dropdown-menu';
import { ChevronDown, Plus, Settings, Users, Zap, Search, LogOut, User, Crown, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import {
  useSidebarStore,
  selectCurrentWorkspace,
  selectAvailableWorkspaces,
  type Workspace,
} from '@/stores/sidebar-store';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/stores/auth-store';
import type { Workspace as ApiWorkspace } from '@/shared/api/types';

interface WorkspaceSelectorProps {
  isCollapsed?: boolean;
  className?: string;
  disablePadding?: boolean;
  showAvatar?: boolean;
}

export const WorkspaceSelector = ({
  isCollapsed = false,
  className,
  disablePadding = false,
  showAvatar = true,
}: WorkspaceSelectorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: workspacesData, isLoading } = useWorkspaces();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const availableWorkspaces = useSidebarStore(selectAvailableWorkspaces);
  const { setCurrentWorkspace, setAvailableWorkspaces } = useSidebarStore();

  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update available workspaces when data changes
  useEffect(() => {
    if (workspacesData?.data) {
      // Convert API workspaces to sidebar workspaces
      const convertedWorkspaces: Workspace[] = workspacesData.data.map((ws: ApiWorkspace) => ({
        id: ws.id,
        workspaceName: ws.workspaceName,
        namespace: ws.namespace,
        description: ws.description,
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

  // Filter workspaces based on search query
  const filteredWorkspaces = availableWorkspaces.filter(
    (workspace) =>
      workspace.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.namespace?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    // Navigate to tables page with workspace context
    navigate({
      to: '/workspaces/tables',
      search: { workspaceId: workspace.id },
    });
  };

  const handleCreateWorkspace = () => {
    // For now, navigate to main workspaces page
    navigate({ to: '/workspaces' });
  };

  const handleJoinWorkspace = () => {
    // For now, navigate to main workspaces page
    navigate({ to: '/workspaces' });
  };

  const handleWorkspaceSettings = () => {
    if (currentWorkspace) {
      // For now, navigate to encryption settings
      navigate({ to: '/settings/encryption' });
    }
  };

  const getWorkspaceInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    return null;
  }

  const containerClass = disablePadding ? '' : 'p-3';

  if (isCollapsed) {
    // Collapsed state - show only icon button
    return (
      <div className={cn(containerClass, className, 'flex items-center justify-center')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
              <span className="sr-only">{t('workspace.selector.ariaLabel') || 'Select workspace'}</span>
            </Button>
          </DropdownMenuTrigger>
          <WorkspaceDropdownContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredWorkspaces={filteredWorkspaces}
            isLoading={isLoading}
            currentWorkspace={currentWorkspace}
            handleWorkspaceSelect={handleWorkspaceSelect}
            handleCreateWorkspace={handleCreateWorkspace}
            handleJoinWorkspace={handleJoinWorkspace}
            handleWorkspaceSettings={handleWorkspaceSettings}
            t={t}
            searchInputRef={searchInputRef}
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
            variant="outline"
            className="w-full justify-between bg-background hover:bg-accent border-border h-10 rounded-lg"
            aria-label={t('workspace.selector.ariaLabel') || 'Select workspace'}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {showAvatar && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                  {currentWorkspace ? (
                    <Avatar className="h-7 w-7">
                      <AvatarImage
                        src={
                          currentWorkspace.namespace
                            ? `https://api.dicebear.com/7.x/initials/svg?seed=${currentWorkspace.namespace}`
                            : undefined
                        }
                      />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getWorkspaceInitials(currentWorkspace.workspaceName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </div>
              )}
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium truncate">
                  {currentWorkspace?.workspaceName || t('workspace.selector.noWorkspace')}
                </span>
                {currentWorkspace?.namespace && (
                  <span className="text-xs text-muted-foreground truncate">{currentWorkspace.namespace}</span>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <WorkspaceDropdownContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredWorkspaces={filteredWorkspaces}
          isLoading={isLoading}
          currentWorkspace={currentWorkspace}
          handleWorkspaceSelect={handleWorkspaceSelect}
          handleCreateWorkspace={handleCreateWorkspace}
          handleJoinWorkspace={handleJoinWorkspace}
          handleWorkspaceSettings={handleWorkspaceSettings}
          t={t}
          searchInputRef={searchInputRef}
        />
      </DropdownMenu>
    </div>
  );
};

interface WorkspaceDropdownContentProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredWorkspaces: Workspace[];
  isLoading: boolean;
  currentWorkspace: Workspace | null;
  handleWorkspaceSelect: (workspace: Workspace) => void;
  handleCreateWorkspace: () => void;
  handleJoinWorkspace: () => void;
  handleWorkspaceSettings: () => void;
  t: (key: string) => string;
  searchInputRef: React.Ref<HTMLInputElement>;
}

const WorkspaceDropdownContent = ({
  searchQuery,
  setSearchQuery,
  filteredWorkspaces,
  isLoading,
  currentWorkspace,
  handleWorkspaceSelect,
  handleCreateWorkspace,
  handleJoinWorkspace,
  handleWorkspaceSettings,
  t,
  searchInputRef,
}: WorkspaceDropdownContentProps) => {
  const getWorkspaceInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenuContent className="w-80" align="start" sideOffset={4}>
      {/* Current Workspace Info */}
      {currentWorkspace && (
        <>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    currentWorkspace.namespace
                      ? `https://api.dicebear.com/7.x/initials/svg?seed=${currentWorkspace.namespace}`
                      : undefined
                  }
                />
                <AvatarFallback className="text-xs">{getWorkspaceInitials(currentWorkspace.workspaceName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentWorkspace.workspaceName}</span>
                {currentWorkspace.namespace && (
                  <span className="text-xs text-muted-foreground">{currentWorkspace.namespace}</span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
        </>
      )}

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('workspace.selector.searchPlaceholder') || 'Search workspaces...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <DropdownMenuSeparator />

      {/* Workspace List */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {t('workspace.selector.yourWorkspaces')}
        </DropdownMenuLabel>
        {isLoading ? (
          <div className="p-2 text-center text-sm text-muted-foreground">{t('workspace.selector.loading')}</div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            {searchQuery ? t('workspace.selector.noResults') : t('workspace.selector.noWorkspaces')}
          </div>
        ) : (
          filteredWorkspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceSelect(workspace)}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    workspace.namespace
                      ? `https://api.dicebear.com/7.x/initials/svg?seed=${workspace.namespace}`
                      : undefined
                  }
                />
                <AvatarFallback className="text-xs">{getWorkspaceInitials(workspace.workspaceName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">{workspace.workspaceName}</span>
                {workspace.namespace && (
                  <span className="text-xs text-muted-foreground truncate">{workspace.namespace}</span>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Actions */}
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={handleCreateWorkspace} className="flex items-center gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>{t('workspace.selector.createWorkspace')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleJoinWorkspace} className="flex items-center gap-2 cursor-pointer">
          <Users className="h-4 w-4" />
          <span>{t('workspace.selector.joinWorkspace')}</span>
        </DropdownMenuItem>
        {currentWorkspace && (
          <DropdownMenuItem onClick={handleWorkspaceSettings} className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>{t('workspace.selector.workspaceSettings')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* User Actions */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {t('workspace.selector.userActions')}
        </DropdownMenuLabel>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          <span>{t('workspace.selector.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Crown className="h-4 w-4" />
          <span>{t('workspace.selector.billing')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Shield className="h-4 w-4" />
          <span>{t('workspace.selector.security')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive">
          <LogOut className="h-4 w-4" />
          <span>{t('workspace.selector.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
};
