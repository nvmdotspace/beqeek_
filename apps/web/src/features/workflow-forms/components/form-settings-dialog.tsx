/**
 * Form Settings Dialog Component
 *
 * Modal dialog for editing form name and description.
 * Updates are saved to the store and will be persisted on form save.
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
import { Textarea } from '@workspace/ui/components/textarea';

import { useFormBuilderStore } from '../stores/form-builder-store';

import type { FormInstance } from '../types';

interface FormSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  form: FormInstance;
}

export function FormSettingsDialog({ open, onClose, form }: FormSettingsDialogProps) {
  const { title, setTitle } = useFormBuilderStore();
  const [localTitle, setLocalTitle] = useState(title || form.name);
  const [description, setDescription] = useState(form.description || '');
  const [error, setError] = useState('');

  // Update local state when form changes
  useEffect(() => {
    if (open) {
      setLocalTitle(title || form.name);
      setDescription(form.description || '');
      setError('');
    }
  }, [open, title, form.name, form.description]);

  const handleSave = () => {
    setError('');

    if (!localTitle.trim()) {
      setError('Tên form không được để trống');
      return;
    }

    setTitle(localTitle.trim());
    onClose();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cài đặt Form</DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin cơ bản của form.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="form-title">
              Tên Form <span className="text-destructive">*</span>
            </Label>
            <Input
              id="form-title"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Nhập tên form"
              required
              aria-invalid={!!error}
              className="border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring aria-invalid:border-destructive"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description">Mô tả</Label>
            <Textarea
              id="form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả form (tùy chọn)"
              rows={3}
              className="border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Mô tả chỉ cập nhật khi lưu form.</p>
          </div>

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
          <Button type="button" onClick={handleSave} disabled={!localTitle.trim()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
