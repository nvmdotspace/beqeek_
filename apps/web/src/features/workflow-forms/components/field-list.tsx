/**
 * Field List Component
 *
 * Displays list of form fields with drag-drop reordering.
 * Supports add/edit/delete field operations.
 */

import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Plus } from 'lucide-react';

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldListItem } from './field-list-item';
import { FieldConfigDialog } from './field-config-dialog';
import { EmptyFieldList } from './empty-field-list';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export function FieldList() {
  const { fields, reorderFields } = useFormBuilderStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? Number(event.over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    reorderFields(oldIndex, newIndex);
    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
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
          <div>
            <p className="text-xs text-muted-foreground mt-1">
              {m.workflowForms_fieldList_total({ count: fields.length })} •{' '}
              {m.workflowForms_fieldList_required({ count: fields.filter((f) => f.required).length })}
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {m.workflowForms_fieldList_addField()}
          </Button>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={fields.map((_, i) => i)} strategy={verticalListSortingStrategy}>
            <ScrollArea className="h-[500px] rounded-md border">
              <div className="divide-y">
                {fields.map((field, index) => (
                  <FieldListItem
                    key={index}
                    field={field}
                    index={index}
                    isDraggedOver={overId === index}
                    isBeingDragged={activeId === index}
                  />
                ))}
              </div>
            </ScrollArea>
          </SortableContext>
        </DndContext>
      </div>

      <FieldConfigDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </>
  );
}
