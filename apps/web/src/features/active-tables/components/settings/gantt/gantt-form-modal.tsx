/**
 * Gantt Form Modal
 *
 * Modal form for adding/editing Gantt chart configurations
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { generateUUIDv7 } from '@workspace/beqeek-shared';
import type { GanttConfig } from './gantt-settings-section';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface GanttFormModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Close callback */
  onClose: () => void;

  /** Submit callback */
  onSubmit: (config: GanttConfig) => void;

  /** Config being edited (null for new config) */
  editingConfig: GanttConfig | null;

  /** All available fields */
  fields: Array<{ name: string; label: string; type: string }>;

  /** Fields eligible for date fields */
  eligibleDateFields: Array<{ name: string; label: string; type: string }>;

  /** Fields eligible for progress field */
  eligibleProgressFields: Array<{ name: string; label: string; type: string }>;

  /** Fields eligible for dependency field */
  eligibleDependencyFields: Array<{ name: string; label: string; type: string }>;
}

/**
 * Gantt Form Modal Component
 */
export function GanttFormModal({
  open,
  onClose,
  editingConfig,
  onSubmit,
  fields,
  eligibleDateFields,
  eligibleProgressFields,
  eligibleDependencyFields,
}: GanttFormModalProps) {
  const [screenName, setScreenName] = useState('');
  const [screenDescription, setScreenDescription] = useState('');
  const [taskNameField, setTaskNameField] = useState('');
  const [startDateField, setStartDateField] = useState('');
  const [endDateField, setEndDateField] = useState('');
  const [progressField, setProgressField] = useState<string>('');
  const [dependencyField, setDependencyField] = useState<string>('');
  const [errors, setErrors] = useState<{
    screenName?: string;
    taskNameField?: string;
    startDateField?: string;
    endDateField?: string;
  }>({});

  // Reset form when modal opens/closes or editing config changes
  useEffect(() => {
    if (open && editingConfig) {
      setScreenName(editingConfig.screenName);
      setScreenDescription(editingConfig.screenDescription || '');
      setTaskNameField(editingConfig.taskNameField);
      setStartDateField(editingConfig.startDateField);
      setEndDateField(editingConfig.endDateField);
      setProgressField(editingConfig.progressField || '');
      setDependencyField(editingConfig.dependencyField || '');
      setErrors({});
    } else if (open && !editingConfig) {
      setScreenName('');
      setScreenDescription('');
      setTaskNameField(fields[0]?.name || '');
      setStartDateField(eligibleDateFields[0]?.name || '');
      setEndDateField(eligibleDateFields[1]?.name || eligibleDateFields[0]?.name || '');
      setProgressField('');
      setDependencyField('');
      setErrors({});
    }
  }, [open, editingConfig, fields, eligibleDateFields]);

  const validate = (): boolean => {
    const newErrors: {
      screenName?: string;
      taskNameField?: string;
      startDateField?: string;
      endDateField?: string;
    } = {};

    if (!screenName.trim()) {
      newErrors.screenName = m.settings_ganttModal_errorScreenNameRequired();
    }

    if (!taskNameField) {
      newErrors.taskNameField = m.settings_ganttModal_errorTaskNameRequired();
    }

    if (!startDateField) {
      newErrors.startDateField = m.settings_ganttModal_errorStartDateRequired();
    }

    if (!endDateField) {
      newErrors.endDateField = m.settings_ganttModal_errorEndDateRequired();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const config: GanttConfig = {
      ganttScreenId: editingConfig?.ganttScreenId || generateUUIDv7(),
      screenName: screenName.trim(),
      screenDescription: screenDescription.trim(),
      taskNameField,
      startDateField,
      endDateField,
      progressField: progressField || null,
      dependencyField: dependencyField || null,
    };

    onSubmit(config);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? m.settings_ganttModal_titleEdit() : m.settings_ganttModal_titleAdd()}
            </DialogTitle>
            <DialogDescription>{m.settings_ganttModal_description()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Screen Name */}
            <div className="space-y-2">
              <Label htmlFor="screen-name" className="text-sm font-medium">
                {m.settings_ganttModal_screenName()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Input
                id="screen-name"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder={m.settings_ganttModal_screenNamePlaceholder()}
                aria-invalid={!!errors.screenName}
                aria-describedby={errors.screenName ? 'screen-name-error' : undefined}
              />
              {errors.screenName && (
                <p id="screen-name-error" className="text-xs text-destructive">
                  {errors.screenName}
                </p>
              )}
            </div>

            {/* Screen Description */}
            <div className="space-y-2">
              <Label htmlFor="screen-description" className="text-sm font-medium">
                {m.settings_ganttModal_description_label()}
              </Label>
              <Textarea
                id="screen-description"
                value={screenDescription}
                onChange={(e) => setScreenDescription(e.target.value)}
                placeholder={m.settings_ganttModal_descriptionPlaceholder()}
                rows={2}
              />
            </div>

            {/* Task Name Field */}
            <div className="space-y-2">
              <Label htmlFor="task-name-field" className="text-sm font-medium">
                {m.settings_ganttModal_taskNameField()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Select value={taskNameField} onValueChange={setTaskNameField}>
                <SelectTrigger aria-invalid={!!errors.taskNameField}>
                  <SelectValue placeholder={m.settings_ganttModal_taskNameFieldPlaceholder()}>
                    {taskNameField
                      ? (() => {
                          const selectedField = fields.find((f) => f.name === taskNameField);
                          return selectedField ? selectedField.label : taskNameField;
                        })()
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.taskNameField && (
                <p id="task-name-field-error" className="text-xs text-destructive">
                  {errors.taskNameField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{m.settings_ganttModal_taskNameFieldHelp()}</p>
            </div>

            {/* Start Date Field */}
            <div className="space-y-2">
              <Label htmlFor="start-date-field" className="text-sm font-medium">
                {m.settings_ganttModal_startDateField()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Select value={startDateField} onValueChange={setStartDateField}>
                <SelectTrigger aria-invalid={!!errors.startDateField}>
                  <SelectValue placeholder={m.settings_ganttModal_startDateFieldPlaceholder()}>
                    {startDateField
                      ? (() => {
                          const selectedField = eligibleDateFields.find((f) => f.name === startDateField);
                          return selectedField ? `${selectedField.label} (${selectedField.type})` : startDateField;
                        })()
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {eligibleDateFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startDateField && (
                <p id="start-date-field-error" className="text-xs text-destructive">
                  {errors.startDateField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{m.settings_ganttModal_startDateFieldHelp()}</p>
            </div>

            {/* End Date Field */}
            <div className="space-y-2">
              <Label htmlFor="end-date-field" className="text-sm font-medium">
                {m.settings_ganttModal_endDateField()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Select value={endDateField} onValueChange={setEndDateField}>
                <SelectTrigger aria-invalid={!!errors.endDateField}>
                  <SelectValue placeholder={m.settings_ganttModal_endDateFieldPlaceholder()}>
                    {endDateField
                      ? (() => {
                          const selectedField = eligibleDateFields.find((f) => f.name === endDateField);
                          return selectedField ? `${selectedField.label} (${selectedField.type})` : endDateField;
                        })()
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {eligibleDateFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endDateField && (
                <p id="end-date-field-error" className="text-xs text-destructive">
                  {errors.endDateField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{m.settings_ganttModal_endDateFieldHelp()}</p>
            </div>

            {/* Progress Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="progress-field" className="text-sm font-medium">
                {m.settings_ganttModal_progressField()}
              </Label>
              <Select value={progressField} onValueChange={setProgressField}>
                <SelectTrigger>
                  <SelectValue placeholder={m.settings_ganttModal_progressFieldPlaceholder()}>
                    {progressField
                      ? (() => {
                          if (progressField === '') return m.common_none();
                          const selectedField = eligibleProgressFields.find((f) => f.name === progressField);
                          return selectedField ? `${selectedField.label} (${selectedField.type})` : progressField;
                        })()
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{m.common_none()}</SelectItem>
                  {eligibleProgressFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{m.settings_ganttModal_progressFieldHelp()}</p>
            </div>

            {/* Dependency Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="dependency-field" className="text-sm font-medium">
                {m.settings_ganttModal_dependencyField()}
              </Label>
              <Select value={dependencyField} onValueChange={setDependencyField}>
                <SelectTrigger>
                  <SelectValue placeholder={m.settings_ganttModal_dependencyFieldPlaceholder()}>
                    {dependencyField
                      ? (() => {
                          if (dependencyField === '') return m.common_none();
                          const selectedField = eligibleDependencyFields.find((f) => f.name === dependencyField);
                          return selectedField ? `${selectedField.label} (${selectedField.type})` : dependencyField;
                        })()
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{m.common_none()}</SelectItem>
                  {eligibleDependencyFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{m.settings_ganttModal_dependencyFieldHelp()}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {m.common_cancel()}
            </Button>
            <Button type="submit">
              {editingConfig ? m.settings_ganttModal_submitUpdate() : m.settings_ganttModal_submitAdd()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
