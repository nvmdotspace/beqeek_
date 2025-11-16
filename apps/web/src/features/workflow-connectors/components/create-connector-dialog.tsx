/**
 * Create Connector Dialog Component
 *
 * Dialog for creating a new connector with name and description
 */

import { useState } from 'react';
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
import type { ConnectorType } from '@workspace/beqeek-shared/workflow-connectors';

const createConnectorSchema = z.object({
  name: z.string().min(1, 'Tên connector là bắt buộc').max(100, 'Tên không được quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không được quá 500 ký tự').optional(),
});

interface CreateConnectorDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Connector type being created */
  connectorType: ConnectorType;
  /** Connector type name for display */
  connectorTypeName: string;
  /** Create handler */
  onCreate: (data: { name: string; description: string; connectorType: ConnectorType }) => void;
  /** Loading state */
  isLoading?: boolean;
}

export function CreateConnectorDialog({
  open,
  onClose,
  connectorType,
  connectorTypeName,
  onCreate,
  isLoading = false,
}: CreateConnectorDialogProps) {
  const [formState, setFormState] = useState({ name: '', description: '' });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      // Manual validation
      const validation = createConnectorSchema.safeParse(value);
      if (!validation.success) {
        return;
      }

      onCreate({
        name: value.name,
        description: value.description || '',
        connectorType,
      });
    },
  });

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setFormState({ name: '', description: '' });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Tạo {connectorTypeName} Connector</DialogTitle>
            <DialogDescription>Nhập tên định danh và mô tả cho connector mới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name field */}
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="connector-name">
                    Tên định danh <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="connector-name"
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
                  <Label htmlFor="connector-description">Mô tả</Label>
                  <Textarea
                    id="connector-description"
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Hủy
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isLoading}>
                  {isLoading ? 'Đang tạo...' : 'Tạo Connector'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
