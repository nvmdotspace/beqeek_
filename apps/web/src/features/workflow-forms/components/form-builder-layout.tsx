/**
 * Form Builder Layout Component
 *
 * Main layout for form builder with header, config panel, and preview panel.
 * Two-panel split layout with actions (Save, Delete, Settings).
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { Heading } from '@workspace/ui/components/typography';
import { Box, Inline } from '@workspace/ui/components/primitives';
import { ArrowLeft, Settings } from 'lucide-react';

import { ConfigPanel } from './config-panel';
import { PreviewPanel } from './preview-panel';
import { FormSettingsDialog } from './form-settings-dialog';

import type { FormInstance } from '../types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
      <div className="border-b bg-background">
        <Box padding="space-200" className="px-6">
          <div className="flex items-center justify-between">
            <Inline space="space-100" align="center">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Heading level={1}>{form.name}</Heading>
            </Inline>

            <Inline space="space-050">
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? m.workflowForms_builder_saving() : m.workflowForms_builder_save()}
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? m.workflowForms_builder_deleting() : m.workflowForms_builder_delete()}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
              </Button>
            </Inline>
          </div>
        </Box>
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
