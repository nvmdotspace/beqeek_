/**
 * Field List Component
 *
 * Displays list of form fields with drag-drop reordering.
 * Supports add/edit/delete field operations.
 */

import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldListItem } from './field-list-item';
import { FieldConfigDialog } from './field-config-dialog';
import { EmptyFieldList } from './empty-field-list';

export function FieldList() {
  const { fields, reorderFields } = useFormBuilderStore();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    reorderFields(oldIndex, newIndex);
  };

  if (fields.length === 0) {
    return (
      <>
        <EmptyFieldList onAddField={() => setShowAddDialog(true)} />
        <FieldConfigDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Danh sách Field</h3>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Field
          </Button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((_, i) => i)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <FieldListItem key={index} field={field} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <FieldConfigDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </>
  );
}
