/**
 * Field Config Dialog Component
 *
 * Modal dialog for adding/editing form fields.
 * Supports all field types with validation.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldOptionsEditor } from './field-options-editor';
import { validateField, generateFieldName, requiresOptions } from '../utils/field-validation';

import type { Field, FieldType, Option } from '../types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface FieldConfigDialogProps {
  open: boolean;
  onClose: () => void;
  editIndex?: number;
}

// Field type labels - must be accessed inside component for i18n
const getFieldTypeLabels = (): Record<FieldType, string> => ({
  text: m.workflowForms_fieldConfig_typeText(),
  email: m.workflowForms_fieldConfig_typeEmail(),
  number: m.workflowForms_fieldConfig_typeNumber(),
  textarea: m.workflowForms_fieldConfig_typeTextarea(),
  select: m.workflowForms_fieldConfig_typeSelect(),
  checkbox: m.workflowForms_fieldConfig_typeCheckbox(),
  date: m.workflowForms_fieldConfig_typeDate(),
  'datetime-local': m.workflowForms_fieldConfig_typeDatetime(),
});

export function FieldConfigDialog({ open, onClose, editIndex }: FieldConfigDialogProps) {
  const { fields, addField, updateField } = useFormBuilderStore();

  const isEditing = editIndex !== undefined;
  const existingField = isEditing ? fields[editIndex] : null;

  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<Option[]>([{ text: '', value: '' }]);
  const [error, setError] = useState('');

  // Initialize form with existing field data
  useEffect(() => {
    if (open) {
      if (existingField) {
        setFieldType(existingField.type);
        setLabel(existingField.label);
        setName(existingField.name);
        setPlaceholder(existingField.placeholder || '');
        setDefaultValue(existingField.defaultValue || '');
        setRequired(existingField.required);
        setOptions(existingField.options || [{ text: '', value: '' }]);
      } else {
        resetForm();
      }
      setError('');
    }
  }, [open, existingField]);

  const resetForm = () => {
    setFieldType('text');
    setLabel('');
    setName('');
    setPlaceholder('');
    setDefaultValue('');
    setRequired(false);
    setOptions([{ text: '', value: '' }]);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const field: Partial<Field> = {
      type: fieldType,
      label: label.trim(),
      name: name.trim() || generateFieldName(label),
      placeholder: placeholder.trim(),
      defaultValue: defaultValue.trim(),
      required,
      ...(requiresOptions(fieldType) && {
        options: options.filter((opt) => opt.text.trim() && opt.value.trim()),
      }),
      ...(fieldType === 'textarea' && { maxlength: 1500 }),
    };

    // Validate field
    const validationError = validateField(field);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Add or update field
    if (isEditing && editIndex !== undefined) {
      updateField(editIndex, field as Field);
    } else {
      addField(field as Field);
    }

    onClose();
    resetForm();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const FIELD_TYPE_LABELS = getFieldTypeLabels();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>
              {isEditing ? m.workflowForms_fieldConfig_editTitle() : m.workflowForms_fieldConfig_addTitle()}
            </DialogTitle>
            <DialogDescription>{m.workflowForms_fieldConfig_description()}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-6">
            <div className="space-y-6 pb-6">
              {/* Field Type Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">{m.workflowForms_fieldConfig_fieldTypeSection()}</h3>
                <div className="space-y-2">
                  <Label htmlFor="fieldType">
                    {m.workflowForms_fieldConfig_fieldTypeLabel()} <span className="text-destructive">*</span>
                  </Label>
                  <Select value={fieldType} onValueChange={(v) => setFieldType(v as FieldType)}>
                    <SelectTrigger className="border border-input rounded-md bg-background text-foreground">
                      <SelectValue placeholder={m.workflowForms_fieldConfig_selectFieldType()}>
                        {fieldType ? FIELD_TYPE_LABELS[fieldType] : m.workflowForms_fieldConfig_selectFieldType()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">{FIELD_TYPE_LABELS.text}</SelectItem>
                      <SelectItem value="email">{FIELD_TYPE_LABELS.email}</SelectItem>
                      <SelectItem value="number">{FIELD_TYPE_LABELS.number}</SelectItem>
                      <SelectItem value="textarea">{FIELD_TYPE_LABELS.textarea}</SelectItem>
                      <SelectItem value="select">{FIELD_TYPE_LABELS.select}</SelectItem>
                      <SelectItem value="checkbox">{FIELD_TYPE_LABELS.checkbox}</SelectItem>
                      <SelectItem value="date">{FIELD_TYPE_LABELS.date}</SelectItem>
                      <SelectItem value="datetime-local">{FIELD_TYPE_LABELS['datetime-local']}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Basic Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">{m.workflowForms_fieldConfig_basicConfigSection()}</h3>

                {/* Label */}
                <div className="space-y-2">
                  <Label htmlFor="label">
                    {m.workflowForms_fieldConfig_labelField()} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={m.workflowForms_fieldConfig_labelPlaceholder()}
                    required
                    className="border border-input rounded-md bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">{m.workflowForms_fieldConfig_labelHint()}</p>
                </div>

                {/* Name (Variable) */}
                <div className="space-y-2">
                  <Label htmlFor="name">{m.workflowForms_fieldConfig_nameField()}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      label
                        ? m.workflowForms_fieldConfig_nameAutoGenerated({ name: generateFieldName(label) })
                        : m.workflowForms_fieldConfig_nameAutoFromLabel()
                    }
                    className="border border-input rounded-md bg-background text-foreground font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{m.workflowForms_fieldConfig_nameHint()}</p>
                </div>

                {/* Placeholder */}
                {fieldType !== 'checkbox' && (
                  <div className="space-y-2">
                    <Label htmlFor="placeholder">{m.workflowForms_fieldConfig_placeholderField()}</Label>
                    <Input
                      id="placeholder"
                      value={placeholder}
                      onChange={(e) => setPlaceholder(e.target.value)}
                      placeholder={m.workflowForms_fieldConfig_placeholderPlaceholder()}
                      className="border border-input rounded-md bg-background text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">{m.workflowForms_fieldConfig_placeholderHint()}</p>
                  </div>
                )}

                {/* Default Value */}
                <div className="space-y-2">
                  <Label htmlFor="defaultValue">{m.workflowForms_fieldConfig_defaultValueField()}</Label>
                  {fieldType === 'textarea' ? (
                    <Textarea
                      id="defaultValue"
                      value={defaultValue}
                      onChange={(e) => setDefaultValue(e.target.value)}
                      placeholder={m.workflowForms_fieldConfig_defaultValuePlaceholder()}
                      rows={3}
                      className="border border-input rounded-md bg-background text-foreground"
                    />
                  ) : (
                    <Input
                      id="defaultValue"
                      type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                      value={defaultValue}
                      onChange={(e) => setDefaultValue(e.target.value)}
                      placeholder={m.workflowForms_fieldConfig_defaultValuePlaceholder()}
                      className="border border-input rounded-md bg-background text-foreground"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{m.workflowForms_fieldConfig_defaultValueHint()}</p>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="required" className="text-sm font-medium">
                      {m.workflowForms_fieldConfig_requiredField()}
                    </Label>
                    <p className="text-sm text-muted-foreground">{m.workflowForms_fieldConfig_requiredHint()}</p>
                  </div>
                  <Switch id="required" checked={required} onCheckedChange={setRequired} />
                </div>
              </div>

              {/* Options Editor (for select type) */}
              {requiresOptions(fieldType) && (
                <>
                  <Separator />
                  <FieldOptionsEditor options={options} onChange={setOptions} />
                </>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              {m.common_cancel()}
            </Button>
            <Button type="submit" disabled={!label.trim()}>
              {isEditing ? m.workflowForms_fieldConfig_update() : m.workflowForms_fieldConfig_addField()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
