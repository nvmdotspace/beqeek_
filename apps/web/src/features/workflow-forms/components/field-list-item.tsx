/**
 * Field List Item Component
 *
 * Single draggable field item in the field list.
 * Supports drag-drop reordering, edit, and delete actions.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@workspace/ui/components/card';
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
}

export function FieldListItem({ field, index }: FieldListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: index,
  });
  const { removeField } = useFormBuilderStore();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      <Card ref={setNodeRef} style={style} className="p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            title="Kéo để sắp xếp"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Field Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{field.label}</span>
              {field.required && (
                <Badge variant="destructive" className="text-xs">
                  Bắt buộc
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {field.type}
              </Badge>
              {field.name && <span className="text-xs truncate">name: {field.name}</span>}
              {field.placeholder && <span className="text-xs truncate hidden sm:inline">· {field.placeholder}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleEdit} title="Chỉnh sửa field">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} title="Xóa field">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <FieldConfigDialog open={showEditDialog} onClose={() => setShowEditDialog(false)} editIndex={index} />
    </>
  );
}
