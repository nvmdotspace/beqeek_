/**
 * Edit Connector Dialog Component
 *
 * Dialog for editing connector name and description
 */

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
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

// Schema validation is created dynamically to support i18n
const editConnectorSchema = () =>
  z.object({
    name: z.string().min(1, m.connectors_create_nameRequired()).max(100, m.connectors_create_nameMaxLength()),
    description: z.string().max(500, m.connectors_create_descMaxLength()).optional(),
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
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{m.connectors_edit_title()}</DialogTitle>
            <DialogDescription>{m.connectors_edit_subtitle()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name field */}
            <form.Field
              name="name"
              validators={{
                onChange: editConnectorSchema().shape.name,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="connector-name-edit">
                    {m.connectors_create_nameLabel()} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="connector-name-edit"
                    placeholder={m.connectors_create_namePlaceholder()}
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
                  <Label htmlFor="connector-description-edit">{m.connectors_create_descLabel()}</Label>
                  <Textarea
                    id="connector-description-edit"
                    placeholder={m.connectors_create_descPlaceholder()}
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
              {m.connectors_edit_cancel()}
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isLoading}>
                  {isLoading ? m.connectors_edit_saving() : m.connectors_edit_submit()}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
