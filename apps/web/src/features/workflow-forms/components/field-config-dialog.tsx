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

interface FieldConfigDialogProps {
  open: boolean;
  onClose: () => void;
  editIndex?: number;
}

// Field type labels mapping
const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text (Văn bản ngắn)',
  email: 'Email',
  number: 'Number (Số)',
  textarea: 'Textarea (Văn bản dài)',
  select: 'Select (Danh sách tùy chọn)',
  checkbox: 'Checkbox',
  date: 'Date (Ngày)',
  'datetime-local': 'Datetime (Ngày giờ)',
};

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>{isEditing ? 'Chỉnh sửa Field' : 'Thêm Field'}</DialogTitle>
            <DialogDescription>Cấu hình thông tin cho field của form.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-6">
            <div className="space-y-6 pb-6">
              {/* Field Type Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Loại Field</h3>
                <div className="space-y-2">
                  <Label htmlFor="fieldType">
                    Loại Field <span className="text-destructive">*</span>
                  </Label>
                  <Select value={fieldType} onValueChange={(v) => setFieldType(v as FieldType)}>
                    <SelectTrigger className="border border-input rounded-md bg-background text-foreground">
                      <SelectValue placeholder="Chọn loại field">
                        {fieldType ? FIELD_TYPE_LABELS[fieldType] : 'Chọn loại field'}
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
                <h3 className="text-base font-semibold">Cấu hình cơ bản</h3>

                {/* Label */}
                <div className="space-y-2">
                  <Label htmlFor="label">
                    Nhãn Field <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ví dụ: Họ và Tên, Email, Số điện thoại"
                    required
                    className="border border-input rounded-md bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Nhãn hiển thị cho người dùng</p>
                </div>

                {/* Name (Variable) */}
                <div className="space-y-2">
                  <Label htmlFor="name">Tên biến (Name)</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={label ? `Tự động: ${generateFieldName(label)}` : 'Tự động tạo từ nhãn'}
                    className="border border-input rounded-md bg-background text-foreground font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Để trống để tự động tạo từ nhãn field</p>
                </div>

                {/* Placeholder */}
                {fieldType !== 'checkbox' && (
                  <div className="space-y-2">
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                      id="placeholder"
                      value={placeholder}
                      onChange={(e) => setPlaceholder(e.target.value)}
                      placeholder="Văn bản gợi ý cho người dùng"
                      className="border border-input rounded-md bg-background text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">Văn bản hiển thị khi field trống</p>
                  </div>
                )}

                {/* Default Value */}
                <div className="space-y-2">
                  <Label htmlFor="defaultValue">Giá trị mặc định</Label>
                  {fieldType === 'textarea' ? (
                    <Textarea
                      id="defaultValue"
                      value={defaultValue}
                      onChange={(e) => setDefaultValue(e.target.value)}
                      placeholder="Giá trị mặc định (tùy chọn)"
                      rows={3}
                      className="border border-input rounded-md bg-background text-foreground"
                    />
                  ) : (
                    <Input
                      id="defaultValue"
                      type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                      value={defaultValue}
                      onChange={(e) => setDefaultValue(e.target.value)}
                      placeholder="Giá trị mặc định (tùy chọn)"
                      className="border border-input rounded-md bg-background text-foreground"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">Giá trị khởi tạo khi form được mở</p>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="required" className="text-sm font-medium">
                      Bắt buộc nhập
                    </Label>
                    <p className="text-sm text-muted-foreground">Người dùng phải điền trường này</p>
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
              Hủy
            </Button>
            <Button type="submit" disabled={!label.trim()}>
              {isEditing ? 'Cập nhật' : 'Thêm Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
