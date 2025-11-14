/**
 * Create Form Dialog Component
 *
 * Modal dialog for creating a new workflow form from a template.
 * Validates input and calls create mutation, then navigates to form detail.
 */

import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
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

import { ROUTES } from '@/shared/route-paths';

import { useCreateWorkflowForm } from '../hooks';
import { FORM_CONFIGS } from '../constants';

import type { FormType } from '../types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-forms/select');

interface CreateFormDialogProps {
  open: boolean;
  onClose: () => void;
  templateType: FormType | null;
  workspaceId: string;
}

export function CreateFormDialog({ open, onClose, templateType, workspaceId }: CreateFormDialogProps) {
  const { locale } = route.useParams();
  const navigate = route.useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateWorkflowForm(workspaceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Tên form không được để trống');
      return;
    }

    if (!templateType) {
      setError('Vui lòng chọn loại form');
      return;
    }

    const config = FORM_CONFIGS[templateType];
    if (!config) {
      setError('Không tìm thấy cấu hình form');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        formType: templateType,
        config,
      });

      // Reset form
      setName('');
      setDescription('');
      setError('');
      onClose();

      // Navigate to detail view
      navigate({
        to: ROUTES.WORKFLOW_FORMS.FORM_DETAIL,
        params: { locale, workspaceId, formId: result.data.id },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo form thất bại');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo Form Mới</DialogTitle>
            <DialogDescription>Nhập thông tin để tạo form từ mẫu {templateType}.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên Form <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên form"
                required
                aria-invalid={!!error}
                className="border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring aria-invalid:border-destructive"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả form (tùy chọn)"
                rows={3}
                className="border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
