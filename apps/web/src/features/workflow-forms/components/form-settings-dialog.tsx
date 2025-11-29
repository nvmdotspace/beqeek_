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
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
      setError(m.workflowForms_settings_nameRequired());
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{m.workflowForms_settings_title()}</DialogTitle>
          <DialogDescription>{m.workflowForms_settings_description()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="form-title">
              {m.workflowForms_settings_nameLabel()} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="form-title"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder={m.workflowForms_settings_namePlaceholder()}
              required
              aria-invalid={!!error}
              className="border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring aria-invalid:border-destructive"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description">{m.workflowForms_settings_descLabel()}</Label>
            <Textarea
              id="form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={m.workflowForms_settings_descPlaceholder()}
              rows={3}
              className="border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">{m.workflowForms_settings_descHint()}</p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {m.common_cancel()}
          </Button>
          <Button type="button" onClick={handleSave} disabled={!localTitle.trim()}>
            {m.workflowForms_settings_save()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
