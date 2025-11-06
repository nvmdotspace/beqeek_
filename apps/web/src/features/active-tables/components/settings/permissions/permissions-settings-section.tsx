/**
 * Permissions Settings Section
 *
 * Manages team and role-based permissions with complex permission rules
 * This is the most complex settings section due to the matrix structure
 */

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Badge } from '@workspace/ui/components/badge';
import { Info } from 'lucide-react';
import {
  CREATE_PERMISSIONS,
  RECORD_ACTION_PERMISSIONS,
  COMMENT_CREATE_PERMISSIONS,
  COMMENT_ACCESS_PERMISSIONS,
  COMMENT_MODIFY_PERMISSIONS,
} from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';

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

// Placeholder types for teams/roles - in production, fetch from API
interface Team {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  teamId: string;
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Fetch teams and roles
  useEffect(() => {
    // TODO: Replace with actual API calls
    // For now, use placeholder data
    const loadTeamsAndRoles = async () => {
      setLoading(true);
      try {
        // Placeholder data - in production, fetch from:
        // POST /api/workspace/{workspaceId}/workspace/get/p/teams
        // POST /api/workspace/{workspaceId}/workspace/get/p/team_roles
        const mockTeams: Team[] = [
          { id: '1', name: 'Engineering' },
          { id: '2', name: 'Product' },
        ];
        const mockRoles: Role[] = [
          { id: 'r1', name: 'Admin', teamId: '1' },
          { id: 'r2', name: 'Developer', teamId: '1' },
          { id: 'r3', name: 'Manager', teamId: '2' },
          { id: 'r4', name: 'Analyst', teamId: '2' },
        ];

        setTeams(mockTeams);
        setRoles(mockRoles);
        if (mockTeams.length > 0) {
          setSelectedTeam(mockTeams[0]!.id);
        }
      } catch (error) {
        console.error('Failed to load teams/roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamsAndRoles();
  }, [workspaceId]);

  // Get roles for selected team
  const teamRoles = roles.filter((r) => r.teamId === selectedTeam);

  // Handle permission change for a specific team-role-action
  const handlePermissionChange = (teamId: string, roleId: string, actionId: string, permission: string) => {
    const existingConfigIndex = permissionsConfig.findIndex((pc) => pc.teamId === teamId && pc.roleId === roleId);

    let newPermissionsConfig: PermissionConfig[];

    if (existingConfigIndex !== -1) {
      // Update existing config
      newPermissionsConfig = [...permissionsConfig];
      const existingConfig = newPermissionsConfig[existingConfigIndex]!;
      const actionIndex = existingConfig.actions.findIndex((a) => a.actionId === actionId);

      if (actionIndex !== -1) {
        existingConfig.actions[actionIndex]!.permission = permission;
      } else {
        existingConfig.actions.push({ actionId, permission });
      }
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

  if (loading) {
    return (
      <SettingsSection
        title="Permissions Configuration"
        description="Manage team and role-based permissions for actions"
      >
        <div className="rounded-lg border p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading teams and roles...</p>
        </div>
      </SettingsSection>
    );
  }

  if (teams.length === 0) {
    return (
      <SettingsSection
        title="Permissions Configuration"
        description="Manage team and role-based permissions for actions"
      >
        <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/30 p-4">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">No Teams Found</p>
          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
            You need to create teams and roles in your workspace before configuring permissions.
          </p>
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Permissions Configuration"
      description="Manage team and role-based permissions for all actions"
    >
      <div className="space-y-6">
        {/* Team Selector */}
        <div className="space-y-2">
          <Label>Select Team</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Permissions Matrix */}
        {teamRoles.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No roles found for this team.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Permissions Matrix</p>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                    Configure permissions for each role and action. Different actions have different permission options
                    based on their type.
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px] rounded-md border">
              <div className="p-4">
                {teamRoles.map((role) => (
                  <div key={role.id} className="mb-6 rounded-lg border bg-card p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Badge variant="default">{role.name}</Badge>
                      <span className="text-sm text-muted-foreground">Role Permissions</span>
                    </div>

                    <div className="space-y-3">
                      {actions.map((action) => {
                        const permissionOptions = getPermissionsForActionType(action.type);
                        const currentValue = getPermissionValue(selectedTeam, role.id, action.actionId);

                        return (
                          <div key={action.actionId} className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{action.name}</p>
                              <p className="text-xs text-muted-foreground">{action.type}</p>
                            </div>
                            <div className="w-[300px]">
                              <Select
                                value={currentValue}
                                onValueChange={(value) =>
                                  handlePermissionChange(selectedTeam, role.id, action.actionId, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Statistics */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Teams: {teams.length}</span>
          <span>Roles: {roles.length}</span>
          <span>Actions: {actions.length}</span>
          <span>Configurations: {permissionsConfig.length}</span>
        </div>
      </div>
    </SettingsSection>
  );
}
