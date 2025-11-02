import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { TABLE_TYPE_METADATA, type TableType } from '@workspace/beqeek-shared';
import { getTableConfig } from '@workspace/beqeek-shared/configs';
import { generateEncryptionKey } from '@workspace/encryption-core';

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

export const TableManagementDialog = ({
  open,
  onOpenChange,
  table,
  workGroups,
  onSave,
  isLoading = false,
}: TableManagementDialogProps) => {
  const [fields, setFields] = useState<ActiveFieldConfig[]>([]);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showFieldsConfig, setShowFieldsConfig] = useState(true);

  // Initialize form with proper default values
  const getDefaultValues = () => ({
    name: table?.name || '',
    description: table?.description || '',
    workGroupId: table?.workGroupId || '',
    tableType: table?.tableType || '',
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

  // Handle table type change - auto-fill name, description, and fields
  const handleTableTypeChange = (tableType: string) => {
    // Only auto-fill if creating new table (not editing)
    if (!table && tableType) {
      const metadata = TABLE_TYPE_METADATA[tableType as TableType];
      if (metadata) {
        // Get localized name and description
        const name = m[metadata.nameKey as keyof typeof m]?.();
        const description = m[metadata.descriptionKey as keyof typeof m]?.();

        // Update form fields
        form.setFieldValue('name', name || '');
        form.setFieldValue('description', description || '');
      }

      // Load fields from TABLE_CONFIGS
      const tableConfig = getTableConfig(tableType as TableType);
      if (tableConfig && tableConfig.fields) {
        // Convert TableFieldConfig to ActiveFieldConfig format
        const activeFields: ActiveFieldConfig[] = tableConfig.fields.map((field) => ({
          type: field.type,
          label: field.label,
          name: field.name,
          placeholder: field.placeholder || '',
          required: field.required,
          defaultValue: field.defaultValue,
          // Copy options if they exist
          ...('options' in field ? { options: field.options } : {}),
          // Copy reference fields if they exist
          ...('referenceTableId' in field
            ? {
                referenceTableId: field.referenceTableId,
                referenceField: field.referenceField,
                referenceLabelField: field.referenceLabelField,
                additionalCondition: field.additionalCondition,
              }
            : {}),
        }));
        setFields(activeFields);
      }
    }

    // Always update tableType
    form.setFieldValue('tableType', tableType);
  };

  // Handle E2EE encryption toggle - auto-generate key when enabled
  const handleE2EEToggle = (checked: boolean) => {
    form.setFieldValue('e2eeEncryption', checked);

    if (checked) {
      // Auto-generate encryption key when E2EE is enabled
      const newKey = generateEncryptionKey();
      form.setFieldValue('encryptionKey', newKey);
    } else {
      // Clear encryption key when E2EE is disabled
      form.setFieldValue('encryptionKey', '');
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{table ? m.modules_dialog_editTitle() : m.modules_dialog_createTitle()}</DialogTitle>
          <DialogDescription>
            {table ? m.modules_dialog_editDescription() : m.modules_dialog_createDescription()}
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
                  onChange: ({ value }) => (!value ? 'Table name is required' : undefined),
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
                      <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
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
                <form.Field name="workGroupId">
                  {(field) => {
                    const selectedGroup = workGroups.find((group) => group.id === field.state.value);
                    return (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Work Group</Label>
                        <Select value={field.state.value} onValueChange={field.handleChange}>
                          <SelectTrigger className="w-full">
                            <span className="truncate">{selectedGroup?.name || 'Select work group'}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {workGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }}
                </form.Field>

                <form.Field name="tableType">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Table Type</Label>
                      <Select value={field.state.value} onValueChange={handleTableTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select table type" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {Object.values(TABLE_TYPE_METADATA).map((typeMetadata) => (
                            <SelectItem key={typeMetadata.type} value={typeMetadata.type}>
                              {m[typeMetadata.nameKey as keyof typeof m]?.() || typeMetadata.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.state.value && (
                        <p className="text-xs text-muted-foreground">
                          {m[TABLE_TYPE_METADATA[field.state.value as TableType]?.descriptionKey as keyof typeof m]?.()}
                        </p>
                      )}
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
                      <p className="text-sm text-muted-foreground">Enable client-side encryption for sensitive data</p>
                    </div>
                    <Switch id={field.name} checked={field.state.value} onCheckedChange={handleE2EEToggle} />
                  </div>
                )}
              </form.Field>

              <form.Field name="encryptionKey">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Encryption Key</Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showEncryptionKey ? 'text' : 'password'}
                        value={field.state.value}
                        readOnly
                        className="pr-10"
                        placeholder="Auto-generated when E2EE is enabled"
                        disabled={!form.getFieldValue('e2eeEncryption')}
                      />
                      {form.getFieldValue('e2eeEncryption') && field.state.value && (
                        <button
                          type="button"
                          onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showEncryptionKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated when E2EE is enabled. Store this key safely - it cannot be recovered.
                    </p>
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>

          {/* Fields Configuration - View Only */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Fields Configuration
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowFieldsConfig(!showFieldsConfig)}>
                  {showFieldsConfig ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Fields
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Fields
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {showFieldsConfig && (
              <CardContent className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No fields configured. Select a table type to auto-load fields.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base">
                              {m[field.label as keyof typeof m]?.() || field.label}
                            </span>
                            {field.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              <span className="font-medium">Field Name:</span> {field.name}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>{' '}
                              {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                            </div>
                            {field.placeholder && (
                              <div>
                                <span className="font-medium">Placeholder:</span>{' '}
                                {m[field.placeholder as keyof typeof m]?.() || field.placeholder}
                              </div>
                            )}
                            {field.defaultValue !== undefined && (
                              <div>
                                <span className="font-medium">Default:</span> {String(field.defaultValue)}
                              </div>
                            )}
                            {'options' in field && field.options && field.options.length > 0 && (
                              <div>
                                <span className="font-medium">Options:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {field.options.map((option, optIdx) => (
                                    <Badge
                                      key={optIdx}
                                      style={{
                                        backgroundColor: option.background_color,
                                        color: option.text_color,
                                      }}
                                      className="text-xs"
                                    >
                                      {m[option.text as keyof typeof m]?.() || option.text}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {'referenceTableId' in field && field.referenceTableId && (
                              <div>
                                <span className="font-medium">References:</span> {field.referenceTableId}
                                {field.referenceLabelField && ` (${field.referenceLabelField})`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
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
