/**
 * Kanban Settings Section
 *
 * Manages Kanban board configuration with support for multiple screens
 */

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { KANBAN_STATUS_VALID_FIELD_TYPES } from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { KanbanFormModal } from './kanban-form-modal';
// @ts-ignore - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface KanbanConfig {
  kanbanScreenId: string;
  screenName: string;
  screenDescription?: string;
  statusField: string;
  kanbanHeadlineField: string;
  displayFields: string[];
}

export interface KanbanSettingsSectionProps {
  /** Current kanban configurations */
  kanbanConfigs: KanbanConfig[];

  /** Available fields */
  fields: Array<{ name: string; label: string; type: string }>;

  /** Callback when configs change */
  onChange: (configs: KanbanConfig[]) => void;
}

/**
 * Kanban Settings Section
 */
export function KanbanSettingsSection({ kanbanConfigs, fields, onChange }: KanbanSettingsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Filter eligible status fields (only single-choice fields)
  const eligibleStatusFields = fields.filter((f) => KANBAN_STATUS_VALID_FIELD_TYPES.includes(f.type as any));

  const handleAddConfig = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditConfig = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteConfig = (index: number) => {
    if (confirm(m.settings_kanban_deleteConfirm())) {
      onChange(kanbanConfigs.filter((_, i) => i !== index));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleSubmitConfig = (config: KanbanConfig) => {
    if (editingIndex !== null) {
      // Update existing config
      const newConfigs = [...kanbanConfigs];
      newConfigs[editingIndex] = config;
      onChange(newConfigs);
    } else {
      // Add new config
      onChange([...kanbanConfigs, config]);
    }
    handleCloseModal();
  };

  const editingConfig = editingIndex !== null ? (kanbanConfigs[editingIndex] ?? null) : null;

  return (
    <SettingsSection
      title={m.settings_kanban_title()}
      description={m.settings_kanban_description()}
      actions={
        <Button onClick={handleAddConfig} size="sm" disabled={eligibleStatusFields.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          {m.settings_kanban_addButton()}
        </Button>
      }
    >
      <div className="space-y-4">
        {eligibleStatusFields.length === 0 && (
          <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/30 p-4">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              {m.settings_kanban_missingFieldsTitle()}
            </p>
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
              {m.settings_kanban_missingFieldsDescription()}
            </p>
          </div>
        )}

        {kanbanConfigs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {m.settings_kanban_empty()}{' '}
              {eligibleStatusFields.length > 0
                ? m.settings_kanban_emptyWithFields()
                : m.settings_kanban_emptyNoFields()}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px] rounded-md border">
            <div className="divide-y">
              {kanbanConfigs.map((config, index) => {
                const statusField = fields.find((f) => f.name === config.statusField);
                const headlineField = fields.find((f) => f.name === config.kanbanHeadlineField);
                return (
                  <div
                    key={config.kanbanScreenId || index}
                    className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.screenName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {m.settings_kanban_screenBadge({ screenNumber: index + 1 })}
                        </Badge>
                      </div>

                      {config.screenDescription && (
                        <p className="text-sm text-muted-foreground">{config.screenDescription}</p>
                      )}

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{m.settings_kanban_statusField()}:</span>{' '}
                          <span className="font-medium">{statusField?.label || config.statusField}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{m.settings_kanban_headlineField()}:</span>{' '}
                          <span className="font-medium">{headlineField?.label || config.kanbanHeadlineField}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">{m.settings_kanban_displayFields()}:</span>{' '}
                          <span className="font-medium">
                            {m.settings_kanban_displayFieldsSelected({ count: config.displayFields.length })}
                          </span>
                        </div>
                      </div>

                      {config.displayFields.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {config.displayFields.slice(0, 5).map((fieldName) => {
                            const field = fields.find((f) => f.name === fieldName);
                            return (
                              <Badge key={fieldName} variant="outline" className="text-xs">
                                {field?.label || fieldName}
                              </Badge>
                            );
                          })}
                          {config.displayFields.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              {m.settings_kanban_displayFieldsMore({ count: config.displayFields.length - 5 })}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditConfig(index)}
                        aria-label={m.settings_kanban_editScreen({ screenName: config.screenName })}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteConfig(index)}
                        className="text-destructive hover:text-destructive"
                        aria-label={m.settings_kanban_deleteScreen({ screenName: config.screenName })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Statistics */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{m.settings_kanban_statsTotal({ count: kanbanConfigs.length })}</span>
          <span>{m.settings_kanban_statsEligible({ count: eligibleStatusFields.length })}</span>
        </div>

        {/* Info */}
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{m.settings_kanban_featuresTitle()}</p>
          <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <li>• {m.settings_kanban_feature1()}</li>
            <li>• {m.settings_kanban_feature2()}</li>
            <li>• {m.settings_kanban_feature3()}</li>
            <li>• {m.settings_kanban_feature4()}</li>
          </ul>
        </div>
      </div>

      {/* Kanban Form Modal */}
      <KanbanFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitConfig}
        editingConfig={editingConfig}
        fields={fields}
        eligibleStatusFields={eligibleStatusFields}
      />
    </SettingsSection>
  );
}
