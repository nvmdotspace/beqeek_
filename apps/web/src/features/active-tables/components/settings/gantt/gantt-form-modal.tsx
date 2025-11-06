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
      newErrors.screenName = 'Screen name is required';
    }

    if (!taskNameField) {
      newErrors.taskNameField = 'Task name field is required';
    }

    if (!startDateField) {
      newErrors.startDateField = 'Start date field is required';
    }

    if (!endDateField) {
      newErrors.endDateField = 'End date field is required';
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
            <DialogTitle>{editingConfig ? 'Edit Gantt Chart' : 'Add Gantt Chart'}</DialogTitle>
            <DialogDescription>
              Configure a Gantt chart view for project planning and timeline visualization. Tasks will be displayed as
              horizontal bars on a timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Screen Name */}
            <div className="space-y-2">
              <Label htmlFor="screen-name">
                Screen Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="screen-name"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder="e.g., Project Timeline, Sprint Schedule"
                aria-invalid={!!errors.screenName}
                aria-describedby={errors.screenName ? 'screen-name-error' : undefined}
              />
              {errors.screenName && (
                <p id="screen-name-error" className="text-sm text-destructive">
                  {errors.screenName}
                </p>
              )}
            </div>

            {/* Screen Description */}
            <div className="space-y-2">
              <Label htmlFor="screen-description">Description</Label>
              <Textarea
                id="screen-description"
                value={screenDescription}
                onChange={(e) => setScreenDescription(e.target.value)}
                placeholder="Brief description of this Gantt chart..."
                rows={2}
              />
            </div>

            {/* Task Name Field */}
            <div className="space-y-2">
              <Label htmlFor="task-name-field">
                Task Name Field <span className="text-destructive">*</span>
              </Label>
              <Select value={taskNameField} onValueChange={setTaskNameField}>
                <SelectTrigger aria-invalid={!!errors.taskNameField}>
                  <SelectValue placeholder="Select task name field..." />
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
                <p id="task-name-field-error" className="text-sm text-destructive">
                  {errors.taskNameField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Field used as the task name/label in the Gantt chart</p>
            </div>

            {/* Start Date Field */}
            <div className="space-y-2">
              <Label htmlFor="start-date-field">
                Start Date Field <span className="text-destructive">*</span>
              </Label>
              <Select value={startDateField} onValueChange={setStartDateField}>
                <SelectTrigger aria-invalid={!!errors.startDateField}>
                  <SelectValue placeholder="Select start date field..." />
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
                <p id="start-date-field-error" className="text-sm text-destructive">
                  {errors.startDateField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">When the task starts (DATE or DATETIME field required)</p>
            </div>

            {/* End Date Field */}
            <div className="space-y-2">
              <Label htmlFor="end-date-field">
                End Date Field <span className="text-destructive">*</span>
              </Label>
              <Select value={endDateField} onValueChange={setEndDateField}>
                <SelectTrigger aria-invalid={!!errors.endDateField}>
                  <SelectValue placeholder="Select end date field..." />
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
                <p id="end-date-field-error" className="text-sm text-destructive">
                  {errors.endDateField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">When the task ends (DATE or DATETIME field required)</p>
            </div>

            {/* Progress Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="progress-field">Progress Field (Optional)</Label>
              <Select value={progressField} onValueChange={setProgressField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select progress field (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {eligibleProgressFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Numeric field (0-100) to show task completion percentage</p>
            </div>

            {/* Dependency Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="dependency-field">Dependency Field (Optional)</Label>
              <Select value={dependencyField} onValueChange={setDependencyField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dependency field (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {eligibleDependencyFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                SELECT_LIST_RECORD field linking to other tasks this task depends on
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">{editingConfig ? 'Update Chart' : 'Add Chart'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
