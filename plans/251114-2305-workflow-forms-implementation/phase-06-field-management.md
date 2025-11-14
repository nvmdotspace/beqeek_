# Phase 6: Field Management - Add, Edit, Delete, Drag-Drop

**Date**: 2025-11-14
**Priority**: P0 (Critical)
**Status**: Pending
**Estimate**: 1 day

## Context

- [Phase 5: Form Builder](phase-05-form-builder.md)
- [Legacy Field Management](/Users/macos/Workspace/buildinpublic/beqeek/docs/html-module/workflow-forms.blade.php#L698-L878)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [react-beautiful-dnd Alternative](https://github.com/atlassian/react-beautiful-dnd)

## Overview

Implement field configuration UI: add/edit/delete fields, field config dialog, drag-drop reordering. Use shadcn/ui Dialog for field config, @dnd-kit for drag-drop (or react-beautiful-dnd fallback).

## Key Insights

- Field types: text, email, number, textarea, select, checkbox, date, datetime-local
- Field config: type, label, name (auto-generated from label if empty), placeholder, defaultValue, required, options (for select)
- Options management for select fields: add/remove option pairs (text, value)
- Drag-drop for field reordering
- Name auto-generation: lowercase label, replace spaces with underscores
- Validation: label required, at least 1 option for select fields

## Requirements

### Field List

1. Display all fields in order
2. Each item shows: label, type, required status
3. Drag handle for reordering
4. Edit/Delete buttons per field
5. "Add Field" button at bottom
6. Empty state when no fields

### Field Config Dialog

1. Modal/dialog for add/edit field
2. Fields:
   - Field Type (select: text, email, number, textarea, select, checkbox, date, datetime-local)
   - Label (required)
   - Name (auto-generated if empty)
   - Placeholder
   - Default Value
   - Required (toggle)
   - Options (visible only for select type)
3. Options editor for select type:
   - List of option pairs (text, value)
   - Add/remove options
   - Min 1 option required for select

### Validation

**Approach**: Manual validation (no Zod) - TypeScript strict typing + runtime checks matching legacy pattern.

**Validation Rules**:

1. Label required: `if (!label) return 'Tên trường không được để trống'`
2. Select options: `if (type === 'select' && !options?.length) return 'Vui lòng thêm ít nhất một tùy chọn'`
3. Name auto-generation: `name || label.toLowerCase().replace(/\s+/g, '_')`
4. Date format: `if (type === 'date' && defaultValue && !/^\d{4}-\d{2}-\d{2}$/.test(defaultValue)) return error`
5. Datetime format: `if (type === 'datetime-local' && defaultValue && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(defaultValue)) return error`

**Legacy Reference**: `workflow-forms.blade.php` lines 795-826

### Drag-Drop

1. Visual drag handle (grip icon)
2. Drag preview shows field being moved
3. Drop zones between fields
4. Smooth animation
5. Update Zustand store on drop

## Architecture

### Library Choice

Use **@dnd-kit** (recommended):

- Modern, maintained, TypeScript-first
- Better accessibility
- Works with React 19
- Smaller bundle size

Fallback: **react-beautiful-dnd** if compatibility issues.

### File Structure

```
apps/web/src/features/workflow-forms/
├── components/
│   ├── field-list.tsx                    # Drag-drop field list
│   ├── field-list-item.tsx               # Single draggable field
│   ├── field-config-dialog.tsx           # Add/edit field dialog
│   ├── field-options-editor.tsx          # Options editor for select
│   └── empty-field-list.tsx              # Empty state
├── utils/
│   └── field-validation.ts               # Manual validation utilities (no Zod)
```

### Field List (`components/field-list.tsx`)

```tsx
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldListItem } from './field-list-item';
import { FieldConfigDialog } from './field-config-dialog';
import { EmptyFieldList } from './empty-field-list';
import { useState } from 'react';

export function FieldList() {
  const { fields, reorderFields, setEditingFieldIndex } = useFormBuilderStore();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f, i) => i === Number(active.id));
    const newIndex = fields.findIndex((f, i) => i === Number(over.id));

    reorderFields(oldIndex, newIndex);
  };

  const handleAddField = () => {
    setEditingFieldIndex(null);
    setShowAddDialog(true);
  };

  if (fields.length === 0) {
    return (
      <>
        <EmptyFieldList onAddField={handleAddField} />
        <FieldConfigDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
      </>
    );
  }

  return (
    <div className="space-y-2">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <FieldListItem key={index} field={field} index={index} />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="outline" className="w-full" onClick={handleAddField}>
        <Plus className="w-4 h-4 mr-2" />
        Add Field
      </Button>

      <FieldConfigDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </div>
  );
}
```

### Field List Item (`components/field-list-item.tsx`)

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldConfigDialog } from './field-config-dialog';
import type { Field } from '../types';

interface FieldListItemProps {
  field: Field;
  index: number;
}

export function FieldListItem({ field, index }: FieldListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: index,
  });
  const { removeField, setEditingFieldIndex } = useFormBuilderStore();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setEditingFieldIndex(index);
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this field?')) {
      removeField(index);
    }
  };

  return (
    <>
      <Card ref={setNodeRef} style={style} className="p-3">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </div>
            <div className="text-sm text-muted-foreground">
              Type: {field.type}
              {field.placeholder && ` · Placeholder: ${field.placeholder}`}
            </div>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <FieldConfigDialog open={showEditDialog} onClose={() => setShowEditDialog(false)} editIndex={index} />
    </>
  );
}
```

### Field Config Dialog (`components/field-config-dialog.tsx`)

```tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldOptionsEditor } from './field-options-editor';
import type { Field, FieldType, Option } from '../types';

interface FieldConfigDialogProps {
  open: boolean;
  onClose: () => void;
  editIndex?: number;
}

export function FieldConfigDialog({ open, onClose, editIndex }: FieldConfigDialogProps) {
  const { fields, addField, updateField, editingFieldIndex } = useFormBuilderStore();

  const isEditing = editIndex !== undefined;
  const existingField = isEditing ? fields[editIndex] : null;

  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (existingField) {
      setFieldType(existingField.type);
      setLabel(existingField.label);
      setName(existingField.name);
      setPlaceholder(existingField.placeholder || '');
      setDefaultValue(existingField.defaultValue || '');
      setRequired(existingField.required);
      setOptions(existingField.options || []);
    } else {
      resetForm();
    }
  }, [existingField]);

  const resetForm = () => {
    setFieldType('text');
    setLabel('');
    setName('');
    setPlaceholder('');
    setDefaultValue('');
    setRequired(false);
    setOptions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label) {
      alert('Label is required');
      return;
    }

    if (fieldType === 'select' && options.length === 0) {
      alert('At least one option is required for select fields');
      return;
    }

    const field: Field = {
      type: fieldType,
      label,
      name: name || label.toLowerCase().replace(/\s+/g, '_'),
      placeholder,
      defaultValue,
      required,
      ...(fieldType === 'select' && { options }),
      ...(fieldType === 'textarea' && { maxlength: 1500 }),
    };

    if (isEditing) {
      updateField(editIndex, field);
    } else {
      addField(field);
    }

    onClose();
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Field' : 'Add Field'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="fieldType">Field Type *</Label>
              <Select value={fieldType} onValueChange={(v) => setFieldType(v as FieldType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="datetime-local">Datetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter field label"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Name (Variable)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Auto-generated from label if empty"
              />
            </div>

            <div>
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Enter placeholder text"
              />
            </div>

            <div>
              <Label htmlFor="defaultValue">Default Value</Label>
              <Input
                id="defaultValue"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder="Enter default value"
              />
            </div>

            {fieldType === 'select' && <FieldOptionsEditor options={options} onChange={setOptions} />}

            <div className="flex items-center gap-2">
              <Switch id="required" checked={required} onCheckedChange={setRequired} />
              <Label htmlFor="required">Required</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Update Field' : 'Add Field'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Validation Utilities (`utils/field-validation.ts`)

```typescript
import type { Field, FieldType } from '../types';

/**
 * Validate field configuration
 * Returns error message or null if valid
 * Legacy pattern from workflow-forms.blade.php lines 795-826
 */
export function validateField(field: Partial<Field>): string | null {
  // Label required
  if (!field.label?.trim()) {
    return 'Tên trường không được để trống';
  }

  // Select must have options
  if (field.type === 'select' && (!field.options || field.options.length === 0)) {
    return 'Vui lòng thêm ít nhất một tùy chọn cho trường select';
  }

  // Date format validation (YYYY-MM-DD)
  if (field.type === 'date' && field.defaultValue) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(field.defaultValue)) {
      return 'Giá trị mặc định phải đúng định dạng YYYY-MM-DD';
    }
  }

  // Datetime format validation (YYYY-MM-DDTHH:MM)
  if (field.type === 'datetime-local' && field.defaultValue) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(field.defaultValue)) {
      return 'Giá trị mặc định phải đúng định dạng YYYY-MM-DDTHH:MM';
    }
  }

  return null; // Valid
}

/**
 * Auto-generate field name from label
 * Converts to lowercase, replaces spaces with underscores
 */
export function generateFieldName(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Validate option pair
 */
export function validateOption(option: { text: string; value: string }): string | null {
  if (!option.text?.trim()) {
    return 'Tên tùy chọn không được để trống';
  }
  if (!option.value?.trim()) {
    return 'Giá trị tùy chọn không được để trống';
  }
  return null;
}
```

### Options Editor (`components/field-options-editor.tsx`)

```tsx
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Plus, Trash2 } from 'lucide-react';
import type { Option } from '../types';

interface FieldOptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function FieldOptionsEditor({ options, onChange }: FieldOptionsEditorProps) {
  const handleAddOption = () => {
    onChange([...options, { text: '', value: '' }]);
  };

  const handleUpdateOption = (index: number, field: 'text' | 'value', value: string) => {
    const updated = options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt));
    onChange(updated);
  };

  const handleRemoveOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label>Options *</Label>
      <div className="space-y-2 mt-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Option text"
              value={option.text}
              onChange={(e) => handleUpdateOption(index, 'text', e.target.value)}
            />
            <Input
              placeholder="Option value"
              value={option.value}
              onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
            />
            <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveOption(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAddOption}>
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </Button>
      </div>
    </div>
  );
}
```

## Implementation Steps

1. Install @dnd-kit dependencies: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. Implement FieldList with drag-drop context
3. Create FieldListItem with sortable hook
4. Implement FieldConfigDialog with all field types
5. Create FieldOptionsEditor for select fields
6. Add validation logic (label required, options for select)
7. Implement name auto-generation
8. Create EmptyFieldList component
9. Test drag-drop reordering
10. Test add/edit/delete flows

## Todo

- [ ] Install @dnd-kit packages
- [ ] Implement FieldList component
- [ ] Create FieldListItem with drag handle
- [ ] Implement FieldConfigDialog
- [ ] Create FieldOptionsEditor
- [ ] Add field validation
- [ ] Implement name auto-generation
- [ ] Create EmptyFieldList
- [ ] Test drag-drop
- [ ] Test CRUD operations

## Success Criteria

- ✅ Drag-drop reordering works smoothly
- ✅ Add field dialog validates correctly
- ✅ Edit field pre-fills existing values
- ✅ Delete field confirms and removes
- ✅ Select type shows options editor
- ✅ Name auto-generated from label
- ✅ All field types configurable
- ✅ Empty state shows when no fields

## Risk Assessment

**Medium Risk** - Drag-drop can be finicky, options editor complexity.

Risks:

- @dnd-kit React 19 compatibility → Test thoroughly, fallback to react-beautiful-dnd
- Touch device drag-drop → Ensure mobile support
- Options validation edge cases → Thorough testing

## Security Considerations

- No XSS in field preview (inputs disabled)
- No executable code in field configs

## Next Steps

After Phase 6 completion:

- Phase 7: Preview polish, i18n, testing
