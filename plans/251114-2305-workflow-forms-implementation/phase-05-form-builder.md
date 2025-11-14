# Phase 5: Form Builder Detail View

**Date**: 2025-11-14
**Completed**: 2025-11-15
**Priority**: P0 (Critical)
**Status**: ✅ Completed
**Estimate**: 1.5 days
**Actual**: < 45 minutes

## Context

- [Phase 4: List & Select](phase-04-list-select.md)
- [Legacy Form Builder](/Users/macos/Workspace/buildinpublic/beqeek/docs/html-module/workflow-forms.blade.php#L559-L1104)
- [Active Tables Settings Pattern](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/features/active-tables/components/settings)

## Overview

Implement Form Builder detail view - main interface for form configuration. Two-panel layout: Config (left) + Preview (right). Real-time preview updates, field list management, form settings, save/delete actions.

## Key Insights

- Split-panel layout: Config (fields list, settings) | Preview (live form render)
- State: Zustand store for field editing, drag-drop state
- Preview updates in real-time as config changes
- Form ID displayed read-only with copy button
- Submit button text configurable
- Save updates entire form config via PATCH
- Delete requires confirmation, navigates to list on success

## Requirements

### Layout Components

1. **Two-panel layout** - Resizable split or fixed 50/50
2. **Header** - Back button, form name, actions (Save, Delete, Settings)
3. **Config Panel** - Form ID (read-only), Submit button text, Field list, Add field button
4. **Preview Panel** - Live rendered form matching config

### Form Settings

1. Edit form name, description
2. Edit submit button text
3. Read-only form ID with copy functionality
4. Read-only form type

### Field List

1. Display all fields in order
2. Show: field label, type, required status
3. Actions per field: Edit, Delete
4. Drag handle for reordering (Phase 6)
5. Add field button at bottom

### Preview Rendering

1. Real-time preview of form based on config
2. Render all field types correctly:
   - text, email, number → Input
   - textarea → Textarea
   - select → Select
   - checkbox → Checkbox
   - date, datetime-local → DatePicker or Input[type]
3. Show required indicator (\*)
4. Show submit button with configured text
5. Preview is non-interactive (display only)

### Actions

1. **Save** - Update form config via API
2. **Delete** - Confirm dialog, delete form, navigate to list
3. **Settings** - Open dialog to edit name/description

## Architecture

### State Management

Use Zustand store for form builder state (field editing, UI state):

```typescript
// stores/form-builder-store.ts
import { create } from 'zustand';
import type { Field } from '../types';

interface FormBuilderState {
  fields: Field[];
  editingFieldIndex: number | null;

  setFields: (fields: Field[]) => void;
  addField: (field: Field) => void;
  updateField: (index: number, field: Field) => void;
  removeField: (index: number) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  setEditingFieldIndex: (index: number | null) => void;
  reset: () => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  fields: [],
  editingFieldIndex: null,

  setFields: (fields) => set({ fields }),
  addField: (field) => set((state) => ({ fields: [...state.fields, field] })),
  updateField: (index, field) =>
    set((state) => ({
      fields: state.fields.map((f, i) => (i === index ? field : f)),
    })),
  removeField: (index) =>
    set((state) => ({
      fields: state.fields.filter((_, i) => i !== index),
    })),
  reorderFields: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.fields);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { fields: result };
    }),
  setEditingFieldIndex: (index) => set({ editingFieldIndex: index }),
  reset: () => set({ fields: [], editingFieldIndex: null }),
}));
```

### File Structure

```
apps/web/src/features/workflow-forms/
├── pages/
│   └── workflow-form-detail.tsx          # Main detail page
├── components/
│   ├── form-builder-layout.tsx           # Two-panel layout
│   ├── config-panel.tsx                  # Left panel (config)
│   ├── preview-panel.tsx                 # Right panel (preview)
│   ├── field-list.tsx                    # Field list component
│   ├── field-list-item.tsx               # Single field item
│   ├── form-settings-dialog.tsx          # Edit name/description
│   └── form-preview.tsx                  # Rendered form preview
├── stores/
│   └── form-builder-store.ts             # Zustand store
```

### Detail Page (`pages/workflow-form-detail.tsx`)

```tsx
import { useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useWorkflowForm, useUpdateWorkflowForm, useDeleteWorkflowForm } from '../hooks';
import { useFormBuilderStore } from '../stores/form-builder-store';
import { FormBuilderLayout } from '../components/form-builder-layout';
import { Button } from '@workspace/ui/components/button';
import { Loader2 } from 'lucide-react';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.DETAIL);

export function WorkflowFormDetail() {
  const { workspaceId, formId, locale } = route.useParams();
  const navigate = route.useNavigate();

  const { data, isLoading, error } = useWorkflowForm(workspaceId, formId);
  const updateMutation = useUpdateWorkflowForm(workspaceId, formId);
  const deleteMutation = useDeleteWorkflowForm(workspaceId, formId);

  const { fields, setFields, reset } = useFormBuilderStore();

  const form = data?.data;

  // Initialize fields from API data
  useEffect(() => {
    if (form?.config?.fields) {
      setFields(form.config.fields);
    }
    return () => reset();
  }, [form?.config?.fields, setFields, reset]);

  const handleSave = async () => {
    if (!form) return;

    try {
      await updateMutation.mutateAsync({
        name: form.name,
        description: form.description,
        config: {
          ...form.config,
          fields,
        },
      });
    } catch (error) {
      console.error('Failed to save form:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await deleteMutation.mutateAsync();
      navigate({
        to: ROUTES.WORKFLOW_FORMS.LIST,
        params: { locale, workspaceId },
      });
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  if (error) throw error;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!form) return null;

  return (
    <FormBuilderLayout
      form={form}
      onSave={handleSave}
      onDelete={handleDelete}
      isSaving={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
}
```

### Builder Layout (`components/form-builder-layout.tsx`)

```tsx
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
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
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{form.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 grid grid-cols-2 overflow-hidden">
        <ConfigPanel form={form} />
        <PreviewPanel form={form} />
      </div>

      <FormSettingsDialog open={showSettings} onClose={() => setShowSettings(false)} form={form} />
    </div>
  );
}
```

### Config Panel (`components/config-panel.tsx`)

```tsx
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Copy } from 'lucide-react';
import { FieldList } from './field-list';
import type { FormInstance } from '../types';

interface ConfigPanelProps {
  form: FormInstance;
}

export function ConfigPanel({ form }: ConfigPanelProps) {
  const [submitButtonText, setSubmitButtonText] = useState(form.config?.submitButton?.text || 'Submit');

  const copyFormId = () => {
    navigator.clipboard.writeText(form.id);
    // Show toast notification
  };

  return (
    <div className="border-r bg-muted/50 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Form ID */}
        <div>
          <Label htmlFor="formId">Form ID</Label>
          <div className="flex gap-2">
            <Input id="formId" value={form.id} readOnly />
            <Button variant="outline" size="icon" onClick={copyFormId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Submit Button Text */}
        <div>
          <Label htmlFor="submitText">Submit Button Text</Label>
          <Input
            id="submitText"
            value={submitButtonText}
            onChange={(e) => setSubmitButtonText(e.target.value)}
            placeholder="Enter submit button text"
          />
        </div>

        {/* Field List */}
        <div>
          <Label>Form Fields</Label>
          <FieldList />
        </div>
      </div>
    </div>
  );
}
```

### Preview Panel (`components/preview-panel.tsx`)

```tsx
import { useFormBuilderStore } from '../stores/form-builder-store';
import { FormPreview } from './form-preview';
import type { FormInstance } from '../types';

interface PreviewPanelProps {
  form: FormInstance;
}

export function PreviewPanel({ form }: PreviewPanelProps) {
  const { fields } = useFormBuilderStore();

  return (
    <div className="bg-background p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Form Preview</h2>
        <FormPreview title={form.name} fields={fields} submitButtonText={form.config?.submitButton?.text || 'Submit'} />
      </div>
    </div>
  );
}
```

### Form Preview (`components/form-preview.tsx`)

```tsx
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import type { Field } from '../types';

interface FormPreviewProps {
  title: string;
  fields: Field[];
  submitButtonText: string;
}

export function FormPreview({ title, fields, submitButtonText }: FormPreviewProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field, index) => (
          <div key={index}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === 'textarea' ? (
              <Textarea placeholder={field.placeholder} defaultValue={field.defaultValue} disabled />
            ) : field.type === 'select' ? (
              <Select disabled>
                {field.options?.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.text}
                  </option>
                ))}
              </Select>
            ) : field.type === 'checkbox' ? (
              <Checkbox disabled defaultChecked={!!field.defaultValue} />
            ) : (
              <Input type={field.type} placeholder={field.placeholder} defaultValue={field.defaultValue} disabled />
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled>
          {submitButtonText}
        </Button>
      </form>
    </div>
  );
}
```

## Implementation Steps

1. Create Zustand store for form builder state
2. Implement detail page with API data loading
3. Create FormBuilderLayout component
4. Create ConfigPanel with form ID, submit button config
5. Create PreviewPanel with live rendering
6. Create FormPreview component rendering all field types
7. Implement save/delete actions
8. Create FormSettingsDialog
9. Test real-time preview updates
10. Test save/delete flows

## Todo

- [ ] Create `stores/form-builder-store.ts`
- [ ] Implement WorkflowFormDetail page
- [ ] Create FormBuilderLayout component
- [ ] Create ConfigPanel component
- [ ] Create PreviewPanel component
- [ ] Create FormPreview component
- [ ] Implement FieldList (placeholder for Phase 6)
- [ ] Create FormSettingsDialog
- [ ] Test save functionality
- [ ] Test delete functionality

## Success Criteria

- ✅ Detail page loads form data correctly
- ✅ Two-panel layout responsive and scrollable
- ✅ Preview updates in real-time
- ✅ All field types render correctly in preview
- ✅ Save updates form config via API
- ✅ Delete confirms and navigates to list
- ✅ Form ID copyable
- ✅ Settings dialog edits name/description

## Risk Assessment

**Medium Risk** - Complex state management, real-time preview synchronization.

Risks:

- Preview rendering performance with many fields → Use React.memo, virtualization if needed
- State sync between Zustand store and React Query cache → Clear boundaries, single source of truth

## Security Considerations

- No XSS in preview (all inputs disabled, no executable content)
- Form ID non-editable (server-generated)

## Next Steps

After Phase 5 completion:

- Phase 6: Field management (add, edit, delete, drag-drop)
