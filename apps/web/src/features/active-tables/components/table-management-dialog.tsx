import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';

// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

import type { ActiveTable, ActiveFieldConfig, ActiveWorkGroup } from '../types';

interface TableManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: ActiveTable | null;
  workGroups: ActiveWorkGroup[];
  onSave: (tableData: TableFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface TableFormData {
  name: string;
  description: string;
  workGroupId: string;
  tableType: string;
  fields: ActiveFieldConfig[];
  e2eeEncryption: boolean;
  encryptionKey?: string;
}

const FIELD_TYPES = [
  { value: 'SHORT_TEXT', label: 'Short Text' },
  { value: 'RICH_TEXT', label: 'Rich Text' },
  { value: 'INTEGER', label: 'Number' },
  { value: 'NUMERIC', label: 'Decimal' },
  { value: 'DATE', label: 'Date' },
  { value: 'DATETIME', label: 'Date & Time' },
  { value: 'SELECT_ONE', label: 'Single Select' },
  { value: 'SELECT_LIST', label: 'Multi Select' },
  { value: 'BOOLEAN', label: 'Checkbox' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'URL', label: 'URL' },
];

const TABLE_TYPES = [
  { value: 'standard', label: 'Standard Table' },
  { value: 'project', label: 'Project Management' },
  { value: 'crm', label: 'CRM' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'custom', label: 'Custom' },
];

export const TableManagementDialog = ({
  open,
  onOpenChange,
  table,
  workGroups,
  onSave,
  isLoading = false,
}: TableManagementDialogProps) => {
  const [fields, setFields] = useState<ActiveFieldConfig[]>([]);
  const [editingField, setEditingField] = useState<number | null>(null);

  // Initialize form with proper default values
  const getDefaultValues = () => ({
    name: table?.name || '',
    description: table?.description || '',
    workGroupId: table?.workGroupId || '',
    tableType: table?.tableType || 'standard',
    e2eeEncryption: table?.config?.e2eeEncryption || false,
    encryptionKey: table?.config?.encryptionKey || '',
  });

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      await onSave({
        ...value,
        fields,
      });
    },
  });

  // Update form when table changes
  useEffect(() => {
    if (table) {
      setFields(table.config?.fields || []);
      // Reset form with new values
      form.reset();
      form.update({
        defaultValues: getDefaultValues(),
      });
    } else {
      setFields([]);
      form.reset();
    }
  }, [table]);

  const addField = () => {
    const newField: ActiveFieldConfig = {
      type: 'SHORT_TEXT',
      label: '',
      name: '',
      placeholder: '',
      required: false,
      options: [],
    };
    setFields([...fields, newField]);
    setEditingField(fields.length);
  };

  const updateField = (index: number, field: ActiveFieldConfig) => {
    const updatedFields = [...fields];
    if (updatedFields[index]) {
      updatedFields[index] = field;
      setFields(updatedFields);
    }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    setEditingField(null);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    if (movedField) {
      updatedFields.splice(toIndex, 0, movedField);
      setFields(updatedFields);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {table ? m.modules_dialog_editTitle() : m.modules_dialog_createTitle()}
          </DialogTitle>
          <DialogDescription>
            {table
              ? m.modules_dialog_editDescription()
              : m.modules_dialog_createDescription()
            }
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'Table name is required' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Table Name *</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter table name"
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Description</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter table description"
                      rows={3}
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="workGroupId"
                  validators={{
                    onChange: ({ value }) =>
                      !value ? 'Work group is required' : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Work Group *</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work group" />
                        </SelectTrigger>
                        <SelectContent>
                          {workGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="tableType">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Table Type</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select table type" />
                        </SelectTrigger>
                        <SelectContent>
                          {TABLE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.Field name="e2eeEncryption">
                {(field) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={field.name}>End-to-End Encryption</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable client-side encryption for sensitive data
                      </p>
                    </div>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="encryptionKey">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Encryption Key</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter encryption key (optional)"
                      disabled={!form.getFieldValue('e2eeEncryption')}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to auto-generate. Store this key safely - it cannot be recovered.
                    </p>
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>

          {/* Fields Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Fields Configuration
                <Button type="button" onClick={addField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fields configured. Click "Add Field" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <FieldEditor
                      key={index}
                      field={field}
                      index={index}
                      isEditing={editingField === index}
                      onEdit={() => setEditingField(index)}
                      onSave={(updatedField) => {
                        updateField(index, updatedField);
                        setEditingField(null);
                      }}
                      onCancel={() => setEditingField(null)}
                      onRemove={() => removeField(index)}
                      onMove={moveField}
                      canMoveUp={index > 0}
                      canMoveDown={index < fields.length - 1}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : table ? 'Update Table' : 'Create Table'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface FieldEditorProps {
  field: ActiveFieldConfig;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (field: ActiveFieldConfig) => void;
  onCancel: () => void;
  onRemove: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const FieldEditor = ({
  field,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}: FieldEditorProps) => {
  const [editField, setEditField] = useState<ActiveFieldConfig>(field);

  useEffect(() => {
    setEditField(field);
  }, [field]);

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{field.label || 'Untitled Field'}</div>
            <div className="text-sm text-muted-foreground">
              {field.name} • {FIELD_TYPES.find(t => t.value === field.type)?.label}
              {field.required && <Badge variant="secondary" className="ml-2">Required</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove(index, index - 1)}
            disabled={!canMoveUp}
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove(index, index + 1)}
            disabled={!canMoveDown}
          >
            ↓
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Field Label *</Label>
            <Input
              value={editField.label}
              onChange={(e) => setEditField({ ...editField, label: e.target.value })}
              placeholder="Enter field label"
            />
          </div>
          <div className="space-y-2">
            <Label>Field Name *</Label>
            <Input
              value={editField.name}
              onChange={(e) => setEditField({
                ...editField,
                name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
              })}
              placeholder="field_name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select
                        value={editField.type}
                        onValueChange={(value: string) => setEditField({ ...editField, type: value })}
                      >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input
              value={editField.placeholder || ''}
              onChange={(e) => setEditField({ ...editField, placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`required-${index}`}
            checked={editField.required || false}
            onCheckedChange={(checked: boolean) => setEditField({ ...editField, required: checked })}
          />
          <Label htmlFor={`required-${index}`}>Required field</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onSave(editField)}
            disabled={!editField.label || !editField.name}
          >
            Save Field
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
