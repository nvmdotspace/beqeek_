/**
 * Field List Item Component
 *
 * Single draggable field item in the field list.
 * Supports drag-drop reordering, edit, and delete actions.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldConfigDialog } from './field-config-dialog';

import type { Field } from '../types';

interface FieldListItemProps {
  field: Field;
  index: number;
  isDraggedOver?: boolean;
  isBeingDragged?: boolean;
}

export function FieldListItem({ field, index, isDraggedOver, isBeingDragged }: FieldListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: index,
  });
  const { removeField } = useFormBuilderStore();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isBeingDragged ? 0.5 : 1,
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    if (confirm(`Xóa field "${field.label}"? Không thể hoàn tác.`)) {
      removeField(index);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors relative border-l-4 ${
          isDraggedOver ? 'bg-primary/5 border-primary' : 'border-transparent'
        } ${isBeingDragged ? 'opacity-50' : ''}`}
      >
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          aria-label={`Kéo để sắp xếp ${field.label}`}
          tabIndex={0}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Field Info */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{field.label}</span>
            {field.required && (
              <Badge variant="destructive" className="h-5 text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs">{field.name}</span>
            <span>•</span>
            <Badge variant="outline" className="h-5 text-xs">
              {field.type}
            </Badge>
            {field.placeholder && (
              <>
                <span>•</span>
                <span className="text-xs">Placeholder: {field.placeholder}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleEdit} aria-label={`Chỉnh sửa field ${field.label}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
            aria-label={`Xóa field ${field.label}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <FieldConfigDialog open={showEditDialog} onClose={() => setShowEditDialog(false)} editIndex={index} />
    </>
  );
}
