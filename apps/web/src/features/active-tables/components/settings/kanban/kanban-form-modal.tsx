/**
 * Kanban Form Modal
 *
 * Modal form for adding/editing Kanban board configurations
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
import { MultiSelectField } from '../multi-select-field';
import type { KanbanConfig } from './kanban-settings-section';

export interface KanbanFormModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Close callback */
  onClose: () => void;

  /** Submit callback */
  onSubmit: (config: KanbanConfig) => void;

  /** Config being edited (null for new config) */
  editingConfig: KanbanConfig | null;

  /** All available fields */
  fields: Array<{ name: string; label: string; type: string }>;

  /** Fields eligible for status field */
  eligibleStatusFields: Array<{ name: string; label: string; type: string }>;
}

/**
 * Kanban Form Modal Component
 */
export function KanbanFormModal({
  open,
  onClose,
  editingConfig,
  onSubmit,
  fields,
  eligibleStatusFields,
}: KanbanFormModalProps) {
  const [screenName, setScreenName] = useState('');
  const [screenDescription, setScreenDescription] = useState('');
  const [statusField, setStatusField] = useState('');
  const [headlineField, setHeadlineField] = useState('');
  const [displayFields, setDisplayFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ screenName?: string; statusField?: string; headlineField?: string }>({});

  // Reset form when modal opens/closes or editing config changes
  useEffect(() => {
    if (open && editingConfig) {
      setScreenName(editingConfig.screenName);
      setScreenDescription(editingConfig.screenDescription || '');
      setStatusField(editingConfig.statusField);
      setHeadlineField(editingConfig.kanbanHeadlineField);
      setDisplayFields(editingConfig.displayFields);
      setErrors({});
    } else if (open && !editingConfig) {
      setScreenName('');
      setScreenDescription('');
      setStatusField(eligibleStatusFields[0]?.name || '');
      setHeadlineField(fields[0]?.name || '');
      setDisplayFields([]);
      setErrors({});
    }
  }, [open, editingConfig, eligibleStatusFields, fields]);

  const validate = (): boolean => {
    const newErrors: { screenName?: string; statusField?: string; headlineField?: string } = {};

    if (!screenName.trim()) {
      newErrors.screenName = 'Screen name is required';
    }

    if (!statusField) {
      newErrors.statusField = 'Status field is required';
    }

    if (!headlineField) {
      newErrors.headlineField = 'Headline field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const config: KanbanConfig = {
      kanbanScreenId: editingConfig?.kanbanScreenId || generateUUIDv7(),
      screenName: screenName.trim(),
      screenDescription: screenDescription.trim(),
      statusField,
      kanbanHeadlineField: headlineField,
      displayFields,
    };

    onSubmit(config);
  };

  const handleCancel = () => {
    onClose();
  };

  const fieldOptions = fields.map((f) => ({ value: f.name, label: f.label }));

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingConfig ? 'Edit Kanban Screen' : 'Add Kanban Screen'}</DialogTitle>
            <DialogDescription>
              Configure a Kanban board view for visualizing your workflow. Records will be organized into columns based
              on the status field.
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
                placeholder="e.g., Task Pipeline, Sales Workflow"
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
                placeholder="Brief description of this Kanban view..."
                rows={2}
              />
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <Label htmlFor="status-field">
                Status Field <span className="text-destructive">*</span>
              </Label>
              <Select value={statusField} onValueChange={setStatusField}>
                <SelectTrigger aria-invalid={!!errors.statusField}>
                  <SelectValue placeholder="Select status field..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleStatusFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.statusField && (
                <p id="status-field-error" className="text-sm text-destructive">
                  {errors.statusField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This field's values will become columns in the Kanban board. Only single-choice fields are allowed.
              </p>
            </div>

            {/* Headline Field */}
            <div className="space-y-2">
              <Label htmlFor="headline-field">
                Headline Field <span className="text-destructive">*</span>
              </Label>
              <Select value={headlineField} onValueChange={setHeadlineField}>
                <SelectTrigger aria-invalid={!!errors.headlineField}>
                  <SelectValue placeholder="Select headline field..." />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.headlineField && (
                <p id="headline-field-error" className="text-sm text-destructive">
                  {errors.headlineField}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This field will be prominently displayed as the card title in the Kanban board
              </p>
            </div>

            {/* Display Fields */}
            <div className="space-y-2">
              <Label htmlFor="display-fields">Display Fields</Label>
              <MultiSelectField
                id="display-fields"
                options={fieldOptions}
                value={displayFields}
                onChange={setDisplayFields}
                placeholder="Select fields to display on cards..."
              />
              <p className="text-xs text-muted-foreground">
                Additional fields to show on each Kanban card for quick reference
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">{editingConfig ? 'Update Screen' : 'Add Screen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
