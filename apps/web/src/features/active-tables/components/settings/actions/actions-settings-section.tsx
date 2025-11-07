/**
 * Actions Settings Section
 *
 * Manages table actions configuration with support for:
 * - 8 default system actions (auto-initialized)
 * - Custom user-defined actions
 */

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { initDefaultActions, type DefaultAction } from '@workspace/beqeek-shared';
import { toast } from '@workspace/ui/components/sonner';
import { SettingsSection } from '../settings-layout';
import { ActionFormModal } from './action-form-modal';
// @ts-ignore - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export type ActionType =
  | 'create'
  | 'access'
  | 'update'
  | 'delete'
  | 'comment_create'
  | 'comment_access'
  | 'comment_update'
  | 'comment_delete'
  | 'custom';

export interface Action {
  actionId: string;
  name: string;
  type: ActionType;
  icon: 'create' | 'access' | 'update' | 'delete';
}

export interface ActionsSettingsSectionProps {
  /** Current actions (includes both default and custom) */
  actions: Action[];

  /** Callback when actions change */
  onChange: (actions: Action[]) => void;
}

/**
 * Actions Settings Section
 *
 * Allows users to:
 * - View all actions (system + custom)
 * - Add custom actions
 * - Edit custom actions
 * - Delete custom actions
 * - Copy action IDs (for API integration)
 *
 * System actions (8 default) are read-only but always present.
 */
export function ActionsSettingsSection({ actions, onChange }: ActionsSettingsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize default actions if not present
  useEffect(() => {
    if (!initialized && actions.length === 0) {
      const defaultActions = initDefaultActions() as Action[];
      onChange(defaultActions);
      setInitialized(true);
    } else if (actions.length > 0) {
      setInitialized(true);
    }
  }, [actions, initialized, onChange]);

  // Separate system and custom actions
  const systemActions = actions.filter((a) => a.type !== 'custom');
  const customActions = actions.filter((a) => a.type === 'custom');

  const handleAddAction = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditAction = (index: number) => {
    const customIndex = customActions.findIndex((_, i) => i === index);
    if (customIndex !== -1) {
      setEditingIndex(index);
      setIsModalOpen(true);
    }
  };

  const handleDeleteAction = (index: number) => {
    if (confirm(m.settings_actions_deleteConfirm())) {
      const newCustomActions = customActions.filter((_, i) => i !== index);
      onChange([...systemActions, ...newCustomActions]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleSubmitAction = (action: Action) => {
    if (editingIndex !== null) {
      // Update existing custom action
      const newCustomActions = [...customActions];
      newCustomActions[editingIndex] = action;
      onChange([...systemActions, ...newCustomActions]);
    } else {
      // Add new custom action
      onChange([...systemActions, ...customActions, action]);
    }
    handleCloseModal();
  };

  const handleCopyActionId = (actionId: string) => {
    navigator.clipboard.writeText(actionId);
    toast.success(m.settings_actions_toastCopied(), {
      description: m.settings_actions_toastCopiedDescription({ actionId }),
    });
  };

  const editingAction = editingIndex !== null ? (customActions[editingIndex] ?? null) : null;

  const getActionTypeBadge = (type: string) => {
    if (type === 'custom') {
      return (
        <Badge variant="default" className="text-xs">
          {m.settings_actions_badgeCustom()}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        {m.settings_actions_badgeSystem()}
      </Badge>
    );
  };

  return (
    <SettingsSection
      title={m.settings_actions_title()}
      description={m.settings_actions_description()}
      actions={
        <Button onClick={handleAddAction} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {m.settings_actions_addButton()}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* System Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{m.settings_actions_systemTitle()}</h3>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="space-y-2">
              {systemActions.map((action) => (
                <div key={action.actionId} className="flex items-center gap-4 rounded-md bg-background p-3 text-sm">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.name}</span>
                      {getActionTypeBadge(action.type)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{action.type}</span>
                      <span>•</span>
                      <span>{m.settings_actions_iconLabel({ icon: action.icon })}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyActionId(action.actionId)}
                    aria-label={m.settings_actions_copyActionId({ name: action.name })}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{m.settings_actions_customTitle()}</h3>
          {customActions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">{m.settings_actions_customEmpty()}</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px] rounded-md border">
              <div className="divide-y">
                {customActions.map((action, index) => (
                  <div
                    key={action.actionId || index}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.name}</span>
                        {getActionTypeBadge(action.type)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{action.actionId}</span>
                        <span>•</span>
                        <span>{m.settings_actions_iconLabel({ icon: action.icon })}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyActionId(action.actionId)}
                        aria-label={m.settings_actions_copyActionId({ name: action.name })}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAction(index)}
                        aria-label={m.settings_actions_editAction({ name: action.name })}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAction(index)}
                        className="text-destructive hover:text-destructive"
                        aria-label={m.settings_actions_deleteAction({ name: action.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Statistics */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{m.settings_actions_statsSystem({ count: systemActions.length })}</span>
          <span>{m.settings_actions_statsCustom({ count: customActions.length })}</span>
          <span>{m.settings_actions_statsTotal({ count: actions.length })}</span>
        </div>
      </div>

      {/* Action Form Modal */}
      <ActionFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAction}
        editingAction={editingAction}
      />
    </SettingsSection>
  );
}
