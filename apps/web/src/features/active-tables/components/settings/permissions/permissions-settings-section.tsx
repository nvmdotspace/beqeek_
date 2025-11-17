/**
 * Permissions Settings Section
 *
 * Manages team and role-based permissions with complex permission rules
 * This is the most complex settings section due to the matrix structure
 */

import { useState, useEffect, useMemo } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Badge } from '@workspace/ui/components/badge';
import { Stack, Inline } from '@workspace/ui/components/primitives';
import { Info, Loader2 } from 'lucide-react';
import {
  CREATE_PERMISSIONS,
  RECORD_ACTION_PERMISSIONS,
  COMMENT_CREATE_PERMISSIONS,
  COMMENT_ACCESS_PERMISSIONS,
  COMMENT_MODIFY_PERMISSIONS,
} from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { useGetTeams, useGetRoles, type WorkspaceTeam, type WorkspaceTeamRole } from '@/features/team';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface PermissionConfig {
  teamId: string;
  roleId: string;
  actions: Array<{
    actionId: string;
    permission: string;
  }>;
}

export interface Action {
  actionId: string;
  name: string;
  type: string;
}

export interface PermissionsSettingsSectionProps {
  /** Current permission configurations */
  permissionsConfig: PermissionConfig[];

  /** Available actions */
  actions: Action[];

  /** Workspace ID for fetching teams/roles */
  workspaceId: string;

  /** Callback when permissions change */
  onChange: (permissions: PermissionConfig[]) => void;
}

/**
 * Get available permission values for an action type
 */
function getPermissionsForActionType(actionType: string): Array<{ value: string; label: string }> {
  const formatLabel = (value: string) => {
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  let permissions: readonly string[];

  switch (actionType) {
    case 'create':
      permissions = CREATE_PERMISSIONS;
      break;
    case 'access':
    case 'update':
    case 'delete':
    case 'custom':
      permissions = RECORD_ACTION_PERMISSIONS;
      break;
    case 'comment_create':
      permissions = COMMENT_CREATE_PERMISSIONS;
      break;
    case 'comment_access':
      permissions = COMMENT_ACCESS_PERMISSIONS;
      break;
    case 'comment_update':
    case 'comment_delete':
      permissions = COMMENT_MODIFY_PERMISSIONS;
      break;
    default:
      permissions = ['not_allowed', 'allowed'];
  }

  return permissions.map((p) => ({
    value: p,
    label: formatLabel(p),
  }));
}

/**
 * Permissions Settings Section
 */
export function PermissionsSettingsSection({
  permissionsConfig,
  actions,
  workspaceId,
  onChange,
}: PermissionsSettingsSectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Fetch teams from API
  const {
    data: teams = [],
    isLoading: teamsLoading,
    error: teamsError,
  } = useGetTeams(workspaceId, {
    query: 'BASIC', // Only need id and name
  });

  // Fetch roles for selected team
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useGetRoles(workspaceId, selectedTeam, {
    query: 'BASIC', // Only need id, name, and teamId
    reactQueryOptions: {
      enabled: !!selectedTeam, // Only fetch when a team is selected
    },
  });

  // Set initial selected team when teams are loaded
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]!.id);
    }
  }, [teams, selectedTeam]);

  const loading = teamsLoading || rolesLoading;
  const hasError = teamsError || rolesError;

  // Handle permission change for a specific team-role-action
  const handlePermissionChange = (teamId: string, roleId: string, actionId: string, permission: string) => {
    const existingConfigIndex = permissionsConfig.findIndex((pc) => pc.teamId === teamId && pc.roleId === roleId);

    let newPermissionsConfig: PermissionConfig[];

    if (existingConfigIndex !== -1) {
      // Update existing config with deep copy to ensure state change detection
      newPermissionsConfig = permissionsConfig.map((config, index) => {
        if (index !== existingConfigIndex) {
          return config;
        }

        // Deep copy the config being modified
        const actionIndex = config.actions.findIndex((a) => a.actionId === actionId);

        if (actionIndex !== -1) {
          // Update existing action with new permission
          return {
            ...config,
            actions: config.actions.map((action, idx) => (idx === actionIndex ? { ...action, permission } : action)),
          };
        } else {
          // Add new action
          return {
            ...config,
            actions: [...config.actions, { actionId, permission }],
          };
        }
      });
    } else {
      // Create new config for this team-role
      newPermissionsConfig = [
        ...permissionsConfig,
        {
          teamId,
          roleId,
          actions: [{ actionId, permission }],
        },
      ];
    }

    onChange(newPermissionsConfig);
  };

  // Get permission value for a specific team-role-action
  const getPermissionValue = (teamId: string, roleId: string, actionId: string): string => {
    const config = permissionsConfig.find((pc) => pc.teamId === teamId && pc.roleId === roleId);
    if (!config) return 'not_allowed';

    const actionPerm = config.actions.find((a) => a.actionId === actionId);
    return actionPerm?.permission || 'not_allowed';
  };

  // Show loading state
  if (loading) {
    return (
      <SettingsSection title={m.settings_permissions_title()} description={m.settings_permissions_description()}>
        <div className="rounded-lg border p-12 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">{m.settings_permissions_loading()}</p>
        </div>
      </SettingsSection>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <SettingsSection title={m.settings_permissions_title()} description={m.settings_permissions_description()}>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">Failed to load teams or roles</p>
          <p className="mt-1 text-xs text-destructive/80">
            {teamsError?.message || rolesError?.message || 'An error occurred while fetching data'}
          </p>
        </div>
      </SettingsSection>
    );
  }

  // Show empty state if no teams
  if (teams.length === 0) {
    return (
      <SettingsSection title={m.settings_permissions_title()} description={m.settings_permissions_description()}>
        <div className="rounded-lg border border-warning/20 bg-warning-subtle p-4">
          <p className="text-sm font-medium text-warning">{m.settings_permissions_noTeamsTitle()}</p>
          <p className="mt-1 text-xs text-warning">{m.settings_permissions_noTeamsDescription()}</p>
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title={m.settings_permissions_title()} description={m.settings_permissions_description()}>
      <Stack space="space-300">
        {/* Team Selector */}
        <Stack space="space-050">
          <Label>{m.settings_permissions_selectTeam()}</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue>{teams.find((t) => t.id === selectedTeam)?.teamName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.teamName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Stack>

        {/* Permissions Matrix */}
        {rolesLoading && selectedTeam ? (
          <div className="rounded-lg border p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">{m.settings_permissions_noRoles()}</p>
          </div>
        ) : (
          <Stack space="space-100">
            <div className="rounded-lg border border-info/20 bg-info-subtle p-4">
              <Inline space="space-050" align="start">
                <Info className="h-4 w-4 mt-0.5 text-info" />
                <Stack space="space-025">
                  <p className="text-sm font-medium text-info">{m.settings_permissions_matrixTitle()}</p>
                  <p className="text-xs text-info">{m.settings_permissions_matrixDescription()}</p>
                </Stack>
              </Inline>
            </div>

            <ScrollArea className="h-[600px] rounded-md border">
              <div className="p-4">
                {roles.map((role) => (
                  <div key={role.id} className="mb-6 rounded-lg border bg-card p-4">
                    <Inline space="space-050" align="center" className="mb-4">
                      <Badge variant="default">{role.roleName}</Badge>
                      {role.isDefault && <Badge variant="outline">Default</Badge>}
                      <span className="text-sm text-muted-foreground">{m.settings_permissions_rolePermissions()}</span>
                    </Inline>

                    <Stack space="space-075">
                      {actions.map((action) => {
                        const permissionOptions = getPermissionsForActionType(action.type);
                        const currentValue = getPermissionValue(selectedTeam, role.id, action.actionId);

                        return (
                          <Inline key={action.actionId} space="space-100" align="center" justify="between">
                            <Stack space="space-025" className="flex-1">
                              <p className="text-sm font-medium">{action.name}</p>
                              <p className="text-xs text-muted-foreground">{action.type}</p>
                            </Stack>
                            <div className="w-[300px]">
                              <Select
                                value={currentValue}
                                onValueChange={(value) =>
                                  handlePermissionChange(selectedTeam, role.id, action.actionId, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue>
                                    {permissionOptions.find((opt) => opt.value === currentValue)?.label}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {permissionOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </Inline>
                        );
                      })}
                    </Stack>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Stack>
        )}

        {/* Statistics */}
        <Inline space="space-100" className="text-sm text-muted-foreground">
          <span>{m.settings_permissions_statsTeams({ count: teams.length })}</span>
          <span>{m.settings_permissions_statsRoles({ count: roles.length })}</span>
          <span>{m.settings_permissions_statsActions({ count: actions.length })}</span>
          <span>{m.settings_permissions_statsConfigurations({ count: permissionsConfig.length })}</span>
        </Inline>
      </Stack>
    </SettingsSection>
  );
}
