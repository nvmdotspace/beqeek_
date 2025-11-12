import { useEffect, useMemo, useState } from 'react';
import { Loader2, Shield, RotateCcw, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { Heading, Text } from '@workspace/ui/components/typography';
import { toast } from 'sonner';

import {
  COMMENT_ACTION_TYPES,
  COMMENT_CREATE_PERMISSIONS,
  COMMENT_ACCESS_PERMISSIONS,
  COMMENT_MODIFY_PERMISSIONS,
  type CommentActionType,
} from '@workspace/beqeek-shared';

import type { ActiveTable, PermissionsConfig } from '../types';
import { updateActiveTable } from '../api/active-tables-api';
import { activeTablesQueryKey } from '../hooks/use-active-tables';
import { useWorkspaceTeamsWithRoles } from '@/features/workspace/hooks/use-workspace-teams-with-roles';

interface SelectionState {
  comment_create: string;
  comment_access: string;
  comment_update: string;
  comment_delete: string;
}

interface PermissionsMatrixProps {
  workspaceId: string;
  table: ActiveTable;
}

const translateOption = (value: string) => {
  switch (value) {
    case 'not_allowed':
      return m.activeTables_permissions_option_not_allowed();
    case 'all':
      return m.activeTables_permissions_option_all();
    case 'comment_self_created':
      return m.activeTables_permissions_option_comment_self_created();
    case 'comment_self_created_or_tagged':
      return m.activeTables_permissions_option_comment_self_created_or_tagged();
    case 'comment_created_by_team':
      return m.activeTables_permissions_option_comment_created_by_team();
    case 'comment_created_or_tagged_team_member':
      return m.activeTables_permissions_option_comment_created_or_tagged_team_member();
    case 'comment_self_created_2h':
      return m.activeTables_permissions_option_comment_self_created_2h();
    case 'comment_self_created_12h':
      return m.activeTables_permissions_option_comment_self_created_12h();
    case 'comment_self_created_24h':
      return m.activeTables_permissions_option_comment_self_created_24h();
    case 'comment_created_by_team_2h':
      return m.activeTables_permissions_option_comment_created_by_team_2h();
    case 'comment_created_by_team_12h':
      return m.activeTables_permissions_option_comment_created_by_team_12h();
    case 'comment_created_by_team_24h':
      return m.activeTables_permissions_option_comment_created_by_team_24h();
    case 'related_team_member':
      return m.activeTables_permissions_option_related_team_member();
    case 'created_or_assigned_team_member':
      return m.activeTables_permissions_option_created_or_assigned_team_member();
    case 'created_or_related_team_member':
      return m.activeTables_permissions_option_created_or_related_team_member();
    default:
      return value;
  }
};

const defaultSelection: SelectionState = {
  comment_create: 'not_allowed',
  comment_access: 'not_allowed',
  comment_update: 'not_allowed',
  comment_delete: 'not_allowed',
};

const createSelectionKey = (teamId: string, roleId: string) => `${teamId}:${roleId}`;

export const PermissionsMatrix = ({ workspaceId, table }: PermissionsMatrixProps) => {
  const queryClient = useQueryClient();
  const { teams, isLoading, error } = useWorkspaceTeamsWithRoles(workspaceId);

  const totalRoles = useMemo(() => teams.reduce((sum, team) => sum + (team.teamRoles?.length ?? 0), 0), [teams]);

  const commentActions = useMemo(() => {
    return table.config.actions.filter(
      (action) =>
        action.type === 'comment_create' ||
        action.type === 'comment_access' ||
        action.type === 'comment_update' ||
        action.type === 'comment_delete',
    );
  }, [table.config.actions]);

  const actionIdByType = useMemo(() => {
    const map = new Map<CommentActionType, string>();
    commentActions.forEach((action) => {
      map.set(action.type as CommentActionType, action.actionId);
    });
    return map;
  }, [commentActions]);

  const selectionsFromConfig = useMemo(() => {
    const map = new Map<string, SelectionState>();
    table.config.permissionsConfig.forEach((entry) => {
      const key = createSelectionKey(entry.teamId, entry.roleId);
      const actionsMap = entry.actions.reduce<Record<string, string>>((acc, action) => {
        acc[action.actionId] = action.permission;
        return acc;
      }, {});
      map.set(key, {
        comment_create: actionsMap[actionIdByType.get('comment_create') ?? ''] ?? 'not_allowed',
        comment_access: actionsMap[actionIdByType.get('comment_access') ?? ''] ?? 'not_allowed',
        comment_update: actionsMap[actionIdByType.get('comment_update') ?? ''] ?? 'not_allowed',
        comment_delete: actionsMap[actionIdByType.get('comment_delete') ?? ''] ?? 'not_allowed',
      });
    });
    return map;
  }, [table.config.permissionsConfig, actionIdByType]);

  const [selections, setSelections] = useState<Map<string, SelectionState>>(selectionsFromConfig);

  useEffect(() => {
    setSelections(selectionsFromConfig);
  }, [selectionsFromConfig]);

  const hasChanges = useMemo(() => {
    if (selections.size !== selectionsFromConfig.size) return true;
    for (const [key, value] of selections.entries()) {
      const original = selectionsFromConfig.get(key);
      if (!original) return true;
      if (
        value.comment_create !== original.comment_create ||
        value.comment_access !== original.comment_access ||
        value.comment_update !== original.comment_update ||
        value.comment_delete !== original.comment_delete
      ) {
        return true;
      }
    }
    return false;
  }, [selections, selectionsFromConfig]);

  const mutation = useMutation({
    mutationFn: async () => {
      const updatedConfigs: PermissionsConfig[] = [];
      const visitedKeys = new Set<string>();

      selections.forEach((value, key) => {
        const [teamId, roleId] = key.split(':');
        if (!teamId || !roleId) return;
        const existing = table.config.permissionsConfig.find(
          (entry) => entry.teamId === teamId && entry.roleId === roleId,
        );
        const otherActions =
          existing?.actions.filter((action) => !Array.from(actionIdByType.values()).includes(action.actionId)) ?? [];
        const commentActionsToPersist = Array.from(actionIdByType.entries()).map(([type, actionId]) => ({
          actionId,
          permission: value[type],
        }));

        updatedConfigs.push({
          teamId,
          roleId,
          actions: [...otherActions, ...commentActionsToPersist],
        });
        visitedKeys.add(key);
      });

      table.config.permissionsConfig.forEach((entry) => {
        const key = createSelectionKey(entry.teamId, entry.roleId);
        if (!visitedKeys.has(key)) {
          updatedConfigs.push(entry);
        }
      });

      await updateActiveTable(workspaceId, table.id, {
        data: {
          config: {
            ...table.config,
            permissionsConfig: updatedConfigs,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activeTablesQueryKey(workspaceId) });
      toast.success(m.activeTables_permissions_saved());
    },
    onError: (error) => {
      console.error('Failed to update permissions', error);
      toast.error(m.activeTables_permissions_errorSave());
    },
  });

  const handleSelect = (teamId: string, roleId: string, action: CommentActionType, value: string) => {
    const key = createSelectionKey(teamId, roleId);
    setSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(key) ?? { ...defaultSelection };
      next.set(key, {
        ...current,
        [action]: value,
      } as SelectionState);
      return next;
    });
  };

  const handleReset = () => {
    setSelections(new Map(selectionsFromConfig));
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <Heading level={3}>{m.activeTables_permissions_title()}</Heading>
        </div>
        <Text size="small" color="muted">
          {m.activeTables_permissions_description()}
        </Text>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {m.activeTables_comments_loading()}
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        ) : totalRoles === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
            {m.activeTables_permissions_noTeams()}
          </div>
        ) : (
          <ScrollArea className="max-h-[420px] pr-2">
            <table className="w-full min-w-[720px] divide-y divide-border/60 text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 text-left">{m.activeTables_permissions_team()}</th>
                  <th className="px-3 py-3 text-left">{m.activeTables_permissions_role()}</th>
                  <th className="px-3 py-3 text-left">{m.activeTables_permissions_comments_create()}</th>
                  <th className="px-3 py-3 text-left">{m.activeTables_permissions_comments_access()}</th>
                  <th className="px-3 py-3 text-left">{m.activeTables_permissions_comments_update()}</th>
                  <th className="px-3 py-3 text-left">{m.activeTables_permissions_comments_delete()}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {teams.flatMap((team) =>
                  (team.teamRoles ?? []).map((role) => {
                    const key = createSelectionKey(team.id, role.id);
                    const value = selections.get(key) ?? defaultSelection;
                    return (
                      <tr key={key} className="hover:bg-muted/20">
                        <td className="px-3 py-3 text-sm font-medium text-foreground">{team.teamName}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{role.roleName}</td>
                        {COMMENT_ACTION_TYPES.map((action) => {
                          const options =
                            action === 'comment_create'
                              ? COMMENT_CREATE_PERMISSIONS
                              : action === 'comment_access'
                                ? COMMENT_ACCESS_PERMISSIONS
                                : COMMENT_MODIFY_PERMISSIONS;
                          return (
                            <td key={`${key}-${action}`} className="px-3 py-3">
                              <Select
                                value={value[action]}
                                onValueChange={(selected) => handleSelect(team.id, role.id, action, selected)}
                              >
                                <SelectTrigger className="h-9 w-full text-xs">
                                  <SelectValue placeholder={m.activeTables_permissions_option_not_allowed()} />
                                </SelectTrigger>
                                <SelectContent>
                                  {options.map((option) => (
                                    <SelectItem key={option} value={option} className="text-xs">
                                      {translateOption(option)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </ScrollArea>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !hasChanges || teams.length === 0}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {m.activeTables_permissions_save()}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {m.activeTables_permissions_save()}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges || mutation.isPending}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {m.activeTables_permissions_reset()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
