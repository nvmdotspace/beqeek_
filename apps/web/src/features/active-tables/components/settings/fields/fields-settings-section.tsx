/**
 * Fields Settings Section
 *
 * Manages table field configuration with support for 26+ field types.
 * Includes drag and drop functionality for reordering fields.
 */

import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { toast } from '@workspace/ui/components/sonner';
import type { FieldConfig } from '@workspace/active-tables-core';
import {
  isTextFieldType,
  isTimeFieldType,
  isNumberFieldType,
  isSelectionFieldType,
  isReferenceFieldType,
  type FieldType,
} from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { FieldFormModal } from './field-form-modal';

export interface FieldsSettingsSectionProps {
  /** Current fields */
  fields: FieldConfig[];

  /** Callback when fields change */
  onChange: (fields: FieldConfig[]) => void;

  /** Whether E2EE is enabled */
  e2eeEnabled?: boolean;
}

/**
 * Fields Settings Section
 *
 * Allows users to:
 * - View all table fields
 * - Add new fields
 * - Edit existing fields
 * - Delete fields
 * - Reorder fields (drag & drop)
 */
export function FieldsSettingsSection({ fields, onChange }: FieldsSettingsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const availableTables: Array<{ id: string; name: string }> = []; // TODO: Load from API when reference fields are implemented

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [renderKey, setRenderKey] = useState(0); // Force re-render when needed

  const handleAddField = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditField = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteField = (index: number) => {
    const fieldToDelete = fields[index];
    if (!fieldToDelete) return;

    if (confirm(`Are you sure you want to delete the field "${fieldToDelete.label}"? This action cannot be undone.`)) {
      const newFields = fields.filter((_, i) => i !== index);
      onChange(newFields);

      toast.success('Field deleted', {
        description: `"${fieldToDelete.label}" has been removed`,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleSubmitField = (field: FieldConfig) => {
    if (editingIndex !== null) {
      // Update existing field
      const newFields = [...fields];
      newFields[editingIndex] = field;
      onChange(newFields);

      toast.success('Field updated', {
        description: `"${field.label}" has been updated`,
      });
    } else {
      // Add new field
      onChange([...fields, field]);

      toast.success('Field added', {
        description: `"${field.label}" has been added to the table`,
      });
    }
    handleCloseModal();
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';

    // Simplified visual feedback for better performance
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Reset styles
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '';
      e.currentTarget.style.cursor = '';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Only clear on actual leave
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Create completely new array
    const newFields = [...fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);

    if (!draggedField) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Calculate insert position
    const insertAt = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;

    // Insert at new position
    newFields.splice(insertAt, 0, draggedField);

    // Log for debugging
    console.log('Drag reorder:', {
      from: draggedIndex,
      to: dropIndex,
      actualInsert: insertAt,
      fieldName: draggedField.name,
      newOrder: newFields.map((f) => f.name),
    });

    // Force re-render by updating key
    setRenderKey((prev) => prev + 1);

    // Pass the new array to onChange
    onChange(newFields);

    // Show feedback
    toast.success('Field reordered', {
      description: `"${draggedField.label}" moved to position ${insertAt + 1}`,
    });

    // Clear drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  /**
   * Load fields for a reference table
   * TODO: Implement API call to fetch table fields
   */
  const handleLoadReferenceFields = async (
    tableId: string,
  ): Promise<Array<{ name: string; label: string; type: string }>> => {
    // Placeholder - in real implementation, fetch from API
    console.log('Loading fields for table:', tableId);
    return [];
  };

  const existingFieldNames = fields.map((f) => f.name);
  const editingField = editingIndex !== null && fields[editingIndex] ? fields[editingIndex] : null;

  const getFieldTypeColor = (type: string): string => {
    const fieldType = type as FieldType;
    if (isTextFieldType(fieldType)) return 'text-blue-600';
    if (isTimeFieldType(fieldType)) return 'text-purple-600';
    if (isNumberFieldType(fieldType)) return 'text-green-600';
    if (isSelectionFieldType(fieldType)) return 'text-orange-600';
    if (isReferenceFieldType(fieldType)) return 'text-pink-600';
    return 'text-gray-600';
  };

  return (
    <SettingsSection
      title="Fields Configuration"
      description="Define the structure of your table with custom fields"
      actions={
        <Button onClick={handleAddField} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      }
    >
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No fields configured yet. Click "Add Field" to create your first field.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] rounded-md border">
            <div className="divide-y">
              {fields.map((field, index) => (
                <div
                  key={`${renderKey}-${field.name}-${index}`}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/30 relative border-l-4 ${
                    dragOverIndex === index ? 'bg-primary/5 border-primary' : 'border-transparent'
                  } ${draggedIndex === index ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Drag Handle */}
                  <button
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    aria-label={`Drag to reorder ${field.label}`}
                    tabIndex={0}
                    type="button"
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>

                  {/* Field Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      {field.required && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          Required
                        </Badge>
                      )}
                      {/* Note: encrypted field will be available when E2EE is implemented */}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono text-xs">{field.name}</span>
                      <span>•</span>
                      <Badge variant="outline" className={`h-5 text-xs ${getFieldTypeColor(field.type)}`}>
                        {field.type}
                      </Badge>
                      {field.placeholder && (
                        <>
                          <span>•</span>
                          <span>Placeholder: {field.placeholder}</span>
                        </>
                      )}
                    </div>
                    {/* Note: defaultValue display will be added when field schema is updated */}
                    {field.options && field.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.options.slice(0, 5).map((option: any, i: number) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: option.background_color || '#f3f4f6',
                              color: option.text_color || '#1f2937',
                            }}
                          >
                            {option.text}
                          </span>
                        ))}
                        {field.options.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{field.options.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditField(index)}
                      aria-label={`Edit field ${field.label}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(index)}
                      className="text-destructive hover:text-destructive"
                      aria-label={`Delete field ${field.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Field Statistics */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total Fields: {fields.length}</span>
          <span>Required: {fields.filter((f) => f.required).length}</span>
          {/* E2EE stats will be added when field encryption is implemented */}
        </div>
      </div>

      {/* Field Form Modal */}
      <FieldFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitField}
        editingField={editingField}
        existingFieldNames={existingFieldNames}
        availableTables={availableTables}
        onLoadReferenceFields={handleLoadReferenceFields}
      />
    </SettingsSection>
  );
}
