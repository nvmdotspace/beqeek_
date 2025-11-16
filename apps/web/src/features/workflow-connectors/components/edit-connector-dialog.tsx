/**
 * Edit Connector Dialog Component
 *
 * Dialog for editing connector name and description
 */

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
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

const editConnectorSchema = z.object({
  name: z.string().min(1, 'Tên connector là bắt buộc').max(100, 'Tên không được quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không được quá 500 ký tự').optional(),
});

interface EditConnectorDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Current name */
  currentName: string;
  /** Current description */
  currentDescription: string;
  /** Update handler */
  onUpdate: (data: { name: string; description: string }) => void;
  /** Loading state */
  isLoading?: boolean;
}

export function EditConnectorDialog({
  open,
  onClose,
  currentName,
  currentDescription,
  onUpdate,
  isLoading = false,
}: EditConnectorDialogProps) {
  const form = useForm({
    defaultValues: {
      name: currentName,
      description: currentDescription,
    },
    onSubmit: async ({ value }) => {
      onUpdate({
        name: value.name,
        description: value.description || '',
      });
    },
  });

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin Connector</DialogTitle>
          <DialogDescription>Cập nhật tên định danh và mô tả cho connector</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Name field */}
          <form.Field
            name="name"
            validators={{
              onChange: editConnectorSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="connector-name-edit">
                  Tên định danh <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="connector-name-edit"
                  placeholder="Ví dụ: Email Marketing"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                />
              </div>
            )}
          </form.Field>

          {/* Description field */}
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="connector-description-edit">Mô tả</Label>
                <Textarea
                  id="connector-description-edit"
                  placeholder="Mô tả mục đích sử dụng connector này..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Hủy
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isLoading}>
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
