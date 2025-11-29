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
import { FileText, Mail, ClipboardList } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Mail,
  ClipboardList,
};

import { ROUTES } from '@/shared/route-paths';

import { useCreateWorkflowForm } from '../hooks';
import { FORM_CONFIGS, FORM_TYPES } from '../constants';

import type { FormType } from '../types';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.LIST);

interface CreateFormDialogProps {
  open: boolean;
  onClose: () => void;
  templateType?: FormType | null;
  workspaceId: string;
}

export function CreateFormDialog({
  open,
  onClose,
  templateType: initialTemplateType,
  workspaceId,
}: CreateFormDialogProps) {
  const { locale } = route.useParams();
  const navigate = route.useNavigate();

  // State
  const [step, setStep] = useState<'select' | 'details'>(initialTemplateType ? 'details' : 'select');
  const [selectedTemplate, setSelectedTemplate] = useState<FormType | null>(initialTemplateType ?? null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateWorkflowForm(workspaceId);

  // Reset state when dialog opens/closes
  const handleClose = () => {
    if (!createMutation.isPending) {
      setName('');
      setDescription('');
      setError('');
      setStep('select');
      setSelectedTemplate(null);
      onClose();
    }
  };

  const handleTemplateSelect = (type: FormType) => {
    setSelectedTemplate(type);
    setStep('details');
    setError('');
  };

  const handleBack = () => {
    setStep('select');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Tên form không được để trống');
      return;
    }

    if (!selectedTemplate) {
      setError('Vui lòng chọn loại form');
      return;
    }

    const config = FORM_CONFIGS[selectedTemplate];
    if (!config) {
      setError('Không tìm thấy cấu hình form');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        formType: selectedTemplate,
        config,
      });

      handleClose();

      // Navigate to detail view
      navigate({
        to: ROUTES.WORKFLOW_FORMS.FORM_DETAIL,
        params: { locale, workspaceId, formId: result.data.id },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo form thất bại');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
        {step === 'select' ? (
          <div className="flex flex-col h-[600px]">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>Chọn Mẫu Form</DialogTitle>
              <DialogDescription>Chọn một mẫu để bắt đầu xây dựng form của bạn.</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FORM_TYPES.map((template) => {
                  const IconComponent = template.icon ? ICON_MAP[template.icon] : null;

                  return (
                    <div
                      key={template.type}
                      className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleTemplateSelect(template.type)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            {template.logo ? (
                              <img src={template.logo} alt={template.name} className="size-6 object-contain" />
                            ) : IconComponent ? (
                              <IconComponent className="size-6" />
                            ) : (
                              <div className="size-5 bg-primary/40 rounded" />
                            )}
                          </div>
                          <div className="font-semibold">{template.name}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>Thông tin Form</DialogTitle>
              <DialogDescription>
                Đang tạo form từ mẫu{' '}
                <span className="font-medium text-foreground">
                  {FORM_TYPES.find((t) => t.type === selectedTemplate)?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-4">
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
                  autoFocus
                  className="bg-background"
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
                  className="bg-background resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">{error}</p>
              )}
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-muted/30">
              <Button type="button" variant="ghost" onClick={handleBack} disabled={createMutation.isPending}>
                Quay lại
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
                  Hủy
                </Button>
                <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo Form'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
