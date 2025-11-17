/**
 * Gantt Settings Section
 *
 * Manages Gantt chart configuration for project planning and timeline visualization
 */

import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  GANTT_DATE_VALID_FIELD_TYPES,
  GANTT_PROGRESS_VALID_FIELD_TYPES,
  GANTT_DEPENDENCY_VALID_FIELD_TYPES,
  type FieldType,
} from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { GanttFormModal } from './gantt-form-modal';
import { Stack, Inline } from '@workspace/ui/components/primitives';
// @ts-expect-error - Paraglide generates JS without .d.ts files
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
  const dateFieldSet = useMemo(
    () => new Set<FieldType>(GANTT_DATE_VALID_FIELD_TYPES.map((type) => type as FieldType)),
    [],
  );
  const progressFieldSet = useMemo(
    () => new Set<FieldType>(GANTT_PROGRESS_VALID_FIELD_TYPES.map((type) => type as FieldType)),
    [],
  );
  const dependencyFieldSet = useMemo(
    () => new Set<FieldType>(GANTT_DEPENDENCY_VALID_FIELD_TYPES.map((type) => type as FieldType)),
    [],
  );

  const eligibleDateFields = fields.filter((field) => dateFieldSet.has(field.type as FieldType));
  const eligibleProgressFields = fields.filter((field) => progressFieldSet.has(field.type as FieldType));
  const eligibleDependencyFields = fields.filter((field) => dependencyFieldSet.has(field.type as FieldType));

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
          <Inline space="space-050" align="center">
            <Plus className="h-4 w-4" />
            {m.settings_gantt_addButton()}
          </Inline>
        </Button>
      }
    >
      <Stack space="space-100">
        {!canCreateGantt && (
          <div className="rounded-lg border border-warning/20 bg-warning-subtle p-4">
            <p className="text-sm font-medium text-warning">{m.settings_gantt_missingFieldsTitle()}</p>
            <p className="mt-1 text-xs text-warning">{m.settings_gantt_missingFieldsDescription()}</p>
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
                  <Inline
                    key={config.ganttScreenId || index}
                    align="start"
                    space="space-100"
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Stack space="space-050" className="flex-1">
                      <Inline align="center" space="space-050">
                        <span className="font-medium">{config.screenName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {m.settings_gantt_chartBadge({ chartNumber: index + 1 })}
                        </Badge>
                      </Inline>

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
                    </Stack>

                    <Inline space="space-025">
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
                    </Inline>
                  </Inline>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Statistics */}
        <Inline space="space-100" className="text-sm text-muted-foreground">
          <span>{m.settings_gantt_statsTotal({ count: ganttConfigs.length })}</span>
          <span>{m.settings_gantt_statsDateFields({ count: eligibleDateFields.length })}</span>
          <span>{m.settings_gantt_statsProgressFields({ count: eligibleProgressFields.length })}</span>
          <span>{m.settings_gantt_statsDependencyFields({ count: eligibleDependencyFields.length })}</span>
        </Inline>

        {/* Info */}
        <div className="rounded-lg border border-info/20 bg-info-subtle p-4">
          <p className="text-sm font-medium text-info">{m.settings_gantt_featuresTitle()}</p>
          <Stack space="space-025" className="mt-2 text-xs text-info">
            <li>• {m.settings_gantt_feature1()}</li>
            <li>• {m.settings_gantt_feature2()}</li>
            <li>• {m.settings_gantt_feature3()}</li>
            <li>• {m.settings_gantt_feature4()}</li>
          </Stack>
        </div>
      </Stack>

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
