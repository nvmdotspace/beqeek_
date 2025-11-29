import { useEffect, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
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
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Heading, Text } from '@workspace/ui/components/typography';

import type { ActiveTable, ActiveTableRecord, ActiveFieldConfig } from '../types';

type FieldValue = string | number | boolean | string[] | null;

const getDefaultValueForField = (field: ActiveFieldConfig): FieldValue => {
  switch (field.type) {
    case 'CHECKBOX_YES_NO':
      return false;
    case 'INTEGER':
    case 'NUMERIC':
      return 0;
    case 'SELECT_LIST':
      return [];
    case 'DATE':
    case 'DATETIME':
      return '';
    default:
      return '';
  }
};

interface RecordManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: ActiveTable;
  record?: ActiveTableRecord | null;
  onSave: (recordData: Record<string, FieldValue>) => Promise<void>;
  isLoading?: boolean;
}

export const RecordManagementDialog = ({
  open,
  onOpenChange,
  table,
  record,
  onSave,
  isLoading = false,
}: RecordManagementDialogProps) => {
  const getInitialValues = useCallback(() => {
    const initialValues: Record<string, FieldValue> = {};

    table.config.fields.forEach((fieldConfig) => {
      const existingValue = (record?.record?.[fieldConfig.name] ?? null) as FieldValue | null;
      initialValues[fieldConfig.name] = existingValue ?? getDefaultValueForField(fieldConfig);
    });

    return initialValues;
  }, [record, table]);

  const form = useForm({
    defaultValues: getInitialValues(),
    onSubmit: async ({ value }) => {
      await onSave(value);
    },
  });

  useEffect(() => {
    form.reset();
    form.update({
      defaultValues: getInitialValues(),
    });
  }, [form, getInitialValues]);

  const renderFieldInput = (field: ActiveFieldConfig) => {
    const fieldName = field.name;

    switch (field.type) {
      case 'SHORT_TEXT':
      case 'EMAIL':
      case 'URL':
        return (
          <form.Field
            name={fieldName}
            validators={{
              onChange: ({ value }) => {
                if (field.required && !value) {
                  return `${field.label} is required`;
                }
                return undefined;
              },
            }}
          >
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={formField.name}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={formField.name}
                  name={formField.name}
                  type={field.type === 'EMAIL' ? 'email' : field.type === 'URL' ? 'url' : 'text'}
                  value={String(formField.state.value || '')}
                  onBlur={formField.handleBlur}
                  onChange={(e) => {
                    formField.handleChange(e.target.value);
                  }}
                  placeholder={field.placeholder}
                />
                {formField.state.meta.errors && (
                  <Text size="small" className="text-destructive">
                    {formField.state.meta.errors[0]}
                  </Text>
                )}
              </div>
            )}
          </form.Field>
        );

      case 'RICH_TEXT':
        return (
          <form.Field
            name={fieldName}
            validators={{
              onChange: ({ value }) => {
                if (field.required && !value) {
                  return `${field.label} is required`;
                }
                return undefined;
              },
            }}
          >
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={formField.name}>
                  {field.label} {field.required && '*'}
                </Label>
                <Textarea
                  id={formField.name}
                  name={formField.name}
                  value={String(formField.state.value || '')}
                  onBlur={formField.handleBlur}
                  onChange={(e) => {
                    formField.handleChange(e.target.value);
                  }}
                  placeholder={field.placeholder}
                  rows={4}
                />
                {formField.state.meta.errors && (
                  <Text size="small" className="text-destructive">
                    {formField.state.meta.errors[0]}
                  </Text>
                )}
              </div>
            )}
          </form.Field>
        );

      case 'INTEGER':
      case 'NUMERIC':
        return (
          <form.Field
            name={fieldName}
            validators={{
              onChange: ({ value }) => {
                if (field.required && (value === null || value === undefined || value === '')) {
                  return `${field.label} is required`;
                }
                return undefined;
              },
            }}
          >
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={formField.name}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={formField.name}
                  name={formField.name}
                  type="number"
                  step={field.type === 'NUMERIC' ? '0.01' : '1'}
                  value={
                    formField.state.value !== null && formField.state.value !== undefined
                      ? String(formField.state.value)
                      : ''
                  }
                  onBlur={formField.handleBlur}
                  onChange={(e) => {
                    const value =
                      field.type === 'INTEGER' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0;
                    formField.handleChange(value);
                  }}
                  placeholder={field.placeholder}
                />
                {formField.state.meta.errors && (
                  <Text size="small" className="text-destructive">
                    {formField.state.meta.errors[0]}
                  </Text>
                )}
              </div>
            )}
          </form.Field>
        );

      case 'DATE':
      case 'DATETIME':
        return (
          <form.Field
            name={fieldName}
            validators={{
              onChange: ({ value }) => {
                if (field.required && !value) {
                  return `${field.label} is required`;
                }
                return undefined;
              },
            }}
          >
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={formField.name}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={formField.name}
                  name={formField.name}
                  type={field.type === 'DATETIME' ? 'datetime-local' : 'date'}
                  value={String(formField.state.value || '')}
                  onBlur={formField.handleBlur}
                  onChange={(e) => {
                    formField.handleChange(e.target.value);
                  }}
                />
                {formField.state.meta.errors && (
                  <Text size="small" className="text-destructive">
                    {formField.state.meta.errors[0]}
                  </Text>
                )}
              </div>
            )}
          </form.Field>
        );

      case 'CHECKBOX_YES_NO':
        return (
          <form.Field name={fieldName}>
            {(formField) => {
              const checkedValue = typeof formField.state.value === 'boolean' ? formField.state.value : false;

              return (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={formField.name}
                    checked={checkedValue}
                    onCheckedChange={(checked: boolean) => {
                      formField.handleChange(checked);
                    }}
                  />
                  <Label htmlFor={formField.name}>
                    {field.label} {field.required && '*'}
                  </Label>
                </div>
              );
            }}
          </form.Field>
        );

      case 'SELECT_ONE':
        return (
          <form.Field
            name={fieldName}
            validators={{
              onChange: ({ value }) => {
                if (field.required && !value) {
                  return `${field.label} is required`;
                }
                return undefined;
              },
            }}
          >
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={formField.name}>
                  {field.label} {field.required && '*'}
                </Label>
                <Select
                  value={String(formField.state.value || '')}
                  onValueChange={(value: string) => {
                    formField.handleChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formField.state.meta.errors && (
                  <Text size="small" className="text-destructive">
                    {formField.state.meta.errors[0]}
                  </Text>
                )}
              </div>
            )}
          </form.Field>
        );

      default:
        return (
          <form.Field name={fieldName}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={formField.name}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={formField.name}
                  name={formField.name}
                  value={String(formField.state.value || '')}
                  onBlur={formField.handleBlur}
                  onChange={(e) => {
                    formField.handleChange(e.target.value);
                  }}
                  placeholder={field.placeholder}
                />
              </div>
            )}
          </form.Field>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? `Edit Record` : `Create New Record`}</DialogTitle>
          <DialogDescription>
            {record ? `Update the record in "${table.name}"` : `Add a new record to "${table.name}"`}
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
          <Card>
            <CardHeader>
              <Heading level={3}>Record Data</Heading>
            </CardHeader>
            <CardContent className="space-y-4">
              {table.config.fields.map((field) => (
                <div key={field.name}>{renderFieldInput(field)}</div>
              ))}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : record ? 'Update Record' : 'Create Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
