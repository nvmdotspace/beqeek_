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
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
      newErrors.screenName = m.settings_kanbanModal_errorScreenNameRequired();
    }

    if (!statusField) {
      newErrors.statusField = m.settings_kanbanModal_errorStatusFieldRequired();
    }

    if (!headlineField) {
      newErrors.headlineField = m.settings_kanbanModal_errorHeadlineFieldRequired();
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
            <DialogTitle>
              {editingConfig ? m.settings_kanbanModal_titleEdit() : m.settings_kanbanModal_titleAdd()}
            </DialogTitle>
            <DialogDescription>{m.settings_kanbanModal_description()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Screen Name */}
            <div className="space-y-2">
              <Label htmlFor="screen-name">
                {m.settings_kanbanModal_screenName()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Input
                id="screen-name"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder={m.settings_kanbanModal_screenNamePlaceholder()}
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
              <Label htmlFor="screen-description">{m.settings_kanbanModal_description_label()}</Label>
              <Textarea
                id="screen-description"
                value={screenDescription}
                onChange={(e) => setScreenDescription(e.target.value)}
                placeholder={m.settings_kanbanModal_descriptionPlaceholder()}
                rows={2}
              />
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <Label htmlFor="status-field">
                {m.settings_kanbanModal_statusField()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Select value={statusField} onValueChange={setStatusField}>
                <SelectTrigger aria-invalid={!!errors.statusField}>
                  <SelectValue placeholder={m.settings_kanbanModal_statusFieldPlaceholder()} />
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
              <p className="text-xs text-muted-foreground">{m.settings_kanbanModal_statusFieldHelp()}</p>
            </div>

            {/* Headline Field */}
            <div className="space-y-2">
              <Label htmlFor="headline-field">
                {m.settings_kanbanModal_headlineField()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Select value={headlineField} onValueChange={setHeadlineField}>
                <SelectTrigger aria-invalid={!!errors.headlineField}>
                  <SelectValue placeholder={m.settings_kanbanModal_headlineFieldPlaceholder()} />
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
              <p className="text-xs text-muted-foreground">{m.settings_kanbanModal_headlineFieldHelp()}</p>
            </div>

            {/* Display Fields */}
            <div className="space-y-2">
              <Label htmlFor="display-fields">{m.settings_kanbanModal_displayFields()}</Label>
              <MultiSelectField
                id="display-fields"
                options={fieldOptions}
                value={displayFields}
                onChange={setDisplayFields}
                placeholder={m.settings_kanbanModal_displayFieldsPlaceholder()}
              />
              <p className="text-xs text-muted-foreground">{m.settings_kanbanModal_displayFieldsHelp()}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {m.common_cancel()}
            </Button>
            <Button type="submit">
              {editingConfig ? m.settings_kanbanModal_submitUpdate() : m.settings_kanbanModal_submitAdd()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
