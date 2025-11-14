/**
 * Form Preview Component
 *
 * Renders a preview of the form based on current configuration.
 * All inputs are disabled (display only).
 */

import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';

import type { Field } from '../types';

interface FormPreviewProps {
  title: string;
  fields: Field[];
  submitButtonText: string;
}

export function FormPreview({ title, fields, submitButtonText }: FormPreviewProps) {
  const renderField = (field: Field, index: number) => {
    const fieldId = `preview-field-${index}`;

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            disabled
            className="border border-input rounded-md bg-muted text-foreground resize-none"
            rows={4}
          />
        );

      case 'select':
        return (
          <Select disabled value={field.defaultValue}>
            <SelectTrigger className="border border-input rounded-md bg-muted text-foreground">
              <SelectValue placeholder={field.placeholder || 'Chọn tùy chọn'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt, i) => (
                <SelectItem key={i} value={opt.value}>
                  {opt.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={fieldId} disabled defaultChecked={field.defaultValue === 'true'} />
            <Label htmlFor={fieldId} className="text-sm font-normal cursor-not-allowed opacity-50">
              {field.placeholder || field.label}
            </Label>
          </div>
        );

      default:
        return (
          <Input
            id={fieldId}
            type={field.type}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            disabled
            className="border border-input rounded-md bg-muted text-foreground"
          />
        );
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>

      {fields.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Chưa có field nào. Thêm field để xem trước form.</p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {fields.map((field, index) => (
            <div key={index} className="space-y-2">
              {field.type !== 'checkbox' && (
                <Label htmlFor={`preview-field-${index}`}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
              )}
              {renderField(field, index)}
            </div>
          ))}

          <Button type="submit" className="w-full mt-6" disabled>
            {submitButtonText}
          </Button>
        </form>
      )}
    </div>
  );
}
