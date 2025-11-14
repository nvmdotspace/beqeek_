/**
 * Preview Panel Component
 *
 * Right panel showing live preview of the form.
 * Updates in real-time as configuration changes.
 */

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FormPreview } from './form-preview';

import type { FormInstance } from '../types';

interface PreviewPanelProps {
  form: FormInstance;
}

export function PreviewPanel({ form }: PreviewPanelProps) {
  const { title, fields, submitButtonText } = useFormBuilderStore();

  return (
    <div className="bg-background p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Xem trước</h2>
          <p className="text-sm text-muted-foreground mt-1">Giao diện form sẽ hiển thị như bên dưới</p>
        </div>
        <FormPreview title={title || form.name} fields={fields} submitButtonText={submitButtonText} />
      </div>
    </div>
  );
}
