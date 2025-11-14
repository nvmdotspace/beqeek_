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

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldOptionsEditor } from './field-options-editor';
import { validateField, generateFieldName, requiresOptions } from '../utils/field-validation';

import type { Field, FieldType, Option } from '../types';

interface FieldConfigDialogProps {
  open: boolean;
  onClose: () => void;
  editIndex?: number;
}

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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Chỉnh sửa Field' : 'Thêm Field'}</DialogTitle>
            <DialogDescription>Cấu hình thông tin cho field của form.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Field Type */}
            <div className="space-y-2">
              <Label htmlFor="fieldType">
                Loại Field <span className="text-destructive">*</span>
              </Label>
              <Select value={fieldType} onValueChange={(v) => setFieldType(v as FieldType)}>
                <SelectTrigger className="border border-input rounded-md bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text (Văn bản ngắn)</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number (Số)</SelectItem>
                  <SelectItem value="textarea">Textarea (Văn bản dài)</SelectItem>
                  <SelectItem value="select">Select (Danh sách tùy chọn)</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="date">Date (Ngày)</SelectItem>
                  <SelectItem value="datetime-local">Datetime (Ngày giờ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
            </div>

            {/* Name (Variable) */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên biến (Name)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={label ? `Tự động: ${generateFieldName(label)}` : 'Tự động tạo từ nhãn'}
                className="border border-input rounded-md bg-background text-foreground"
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
            </div>

            {/* Options Editor (for select type) */}
            {requiresOptions(fieldType) && <FieldOptionsEditor options={options} onChange={setOptions} />}

            {/* Required Toggle */}
            <div className="flex items-center space-x-2">
              <Switch id="required" checked={required} onCheckedChange={setRequired} />
              <Label htmlFor="required" className="cursor-pointer">
                Bắt buộc nhập
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
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
