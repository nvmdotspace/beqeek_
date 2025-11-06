/**
 * Gantt Settings Section
 *
 * Manages Gantt chart configuration for project planning and timeline visualization
 */

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  GANTT_DATE_VALID_FIELD_TYPES,
  GANTT_PROGRESS_VALID_FIELD_TYPES,
  GANTT_DEPENDENCY_VALID_FIELD_TYPES,
} from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { GanttFormModal } from './gantt-form-modal';
// @ts-ignore - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface GanttConfig {
  ganttScreenId: string;
  screenName: string;
  screenDescription?: string;
  taskNameField: string;
  startDateField: string;
  endDateField: string;
  progressField?: string | null;
  dependencyField?: string | null;
}

export interface GanttSettingsSectionProps {
  /** Current Gantt configurations */
  ganttConfigs: GanttConfig[];

  /** Available fields */
  fields: Array<{ name: string; label: string; type: string }>;

  /** Callback when configs change */
  onChange: (configs: GanttConfig[]) => void;
}

/**
 * Gantt Settings Section
 */
export function GanttSettingsSection({ ganttConfigs, fields, onChange }: GanttSettingsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Filter eligible fields
  const eligibleDateFields = fields.filter((f) => GANTT_DATE_VALID_FIELD_TYPES.includes(f.type as any));
  const eligibleProgressFields = fields.filter((f) => GANTT_PROGRESS_VALID_FIELD_TYPES.includes(f.type as any));
  const eligibleDependencyFields = fields.filter((f) => GANTT_DEPENDENCY_VALID_FIELD_TYPES.includes(f.type as any));

  const canCreateGantt = eligibleDateFields.length >= 2; // Need at least start and end date

  const handleAddConfig = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditConfig = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteConfig = (index: number) => {
    if (confirm(m.settings_gantt_deleteConfirm())) {
      onChange(ganttConfigs.filter((_, i) => i !== index));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleSubmitConfig = (config: GanttConfig) => {
    if (editingIndex !== null) {
      // Update existing config
      const newConfigs = [...ganttConfigs];
      newConfigs[editingIndex] = config;
      onChange(newConfigs);
    } else {
      // Add new config
      onChange([...ganttConfigs, config]);
    }
    handleCloseModal();
  };

  const editingConfig = editingIndex !== null ? (ganttConfigs[editingIndex] ?? null) : null;

  return (
    <SettingsSection
      title={m.settings_gantt_title()}
      description={m.settings_gantt_description()}
      actions={
        <Button onClick={handleAddConfig} size="sm" disabled={!canCreateGantt}>
          <Plus className="mr-2 h-4 w-4" />
          {m.settings_gantt_addButton()}
        </Button>
      }
    >
      <div className="space-y-4">
        {!canCreateGantt && (
          <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/30 p-4">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              {m.settings_gantt_missingFieldsTitle()}
            </p>
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
              {m.settings_gantt_missingFieldsDescription()}
            </p>
          </div>
        )}

        {ganttConfigs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {m.settings_gantt_empty()}{' '}
              {canCreateGantt ? m.settings_gantt_emptyWithFields() : m.settings_gantt_emptyNoFields()}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px] rounded-md border">
            <div className="divide-y">
              {ganttConfigs.map((config, index) => {
                const taskNameField = fields.find((f) => f.name === config.taskNameField);
                const startDateField = fields.find((f) => f.name === config.startDateField);
                const endDateField = fields.find((f) => f.name === config.endDateField);
                const progressField = config.progressField ? fields.find((f) => f.name === config.progressField) : null;
                const dependencyField = config.dependencyField
                  ? fields.find((f) => f.name === config.dependencyField)
                  : null;

                return (
                  <div
                    key={config.ganttScreenId || index}
                    className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.screenName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {m.settings_gantt_chartBadge({ chartNumber: index + 1 })}
                        </Badge>
                      </div>

                      {config.screenDescription && (
                        <p className="text-sm text-muted-foreground">{config.screenDescription}</p>
                      )}

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{m.settings_gantt_taskName()}:</span>{' '}
                          <span className="font-medium">{taskNameField?.label || config.taskNameField}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{m.settings_gantt_startDate()}:</span>{' '}
                          <span className="font-medium">{startDateField?.label || config.startDateField}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{m.settings_gantt_endDate()}:</span>{' '}
                          <span className="font-medium">{endDateField?.label || config.endDateField}</span>
                        </div>
                        {progressField && (
                          <div>
                            <span className="text-muted-foreground">{m.settings_gantt_progress()}:</span>{' '}
                            <span className="font-medium">{progressField.label}</span>
                          </div>
                        )}
                        {dependencyField && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">{m.settings_gantt_dependencies()}:</span>{' '}
                            <span className="font-medium">{dependencyField.label}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditConfig(index)}
                        aria-label={m.settings_gantt_editChart({ screenName: config.screenName })}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteConfig(index)}
                        className="text-destructive hover:text-destructive"
                        aria-label={m.settings_gantt_deleteChart({ screenName: config.screenName })}
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
          <span>{m.settings_gantt_statsTotal({ count: ganttConfigs.length })}</span>
          <span>{m.settings_gantt_statsDateFields({ count: eligibleDateFields.length })}</span>
          <span>{m.settings_gantt_statsProgressFields({ count: eligibleProgressFields.length })}</span>
          <span>{m.settings_gantt_statsDependencyFields({ count: eligibleDependencyFields.length })}</span>
        </div>

        {/* Info */}
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{m.settings_gantt_featuresTitle()}</p>
          <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <li>• {m.settings_gantt_feature1()}</li>
            <li>• {m.settings_gantt_feature2()}</li>
            <li>• {m.settings_gantt_feature3()}</li>
            <li>• {m.settings_gantt_feature4()}</li>
          </ul>
        </div>
      </div>

      {/* Gantt Form Modal */}
      <GanttFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitConfig}
        editingConfig={editingConfig}
        fields={fields}
        eligibleDateFields={eligibleDateFields}
        eligibleProgressFields={eligibleProgressFields}
        eligibleDependencyFields={eligibleDependencyFields}
      />
    </SettingsSection>
  );
}
