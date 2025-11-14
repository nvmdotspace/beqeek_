/**
 * Form Builder Layout Component
 *
 * Main layout for form builder with header, config panel, and preview panel.
 * Two-panel split layout with actions (Save, Delete, Settings).
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, Settings } from 'lucide-react';

import { ConfigPanel } from './config-panel';
import { PreviewPanel } from './preview-panel';
import { FormSettingsDialog } from './form-settings-dialog';

import type { FormInstance } from '../types';

interface FormBuilderLayoutProps {
  form: FormInstance;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function FormBuilderLayout({ form, onSave, onDelete, isSaving, isDeleting }: FormBuilderLayoutProps) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const handleBack = () => {
    navigate({ to: -1 as any });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{form.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
        <ConfigPanel form={form} />
        <PreviewPanel form={form} />
      </div>

      <FormSettingsDialog open={showSettings} onClose={() => setShowSettings(false)} form={form} />
    </div>
  );
}
