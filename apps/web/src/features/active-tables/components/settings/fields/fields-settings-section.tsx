/**
 * Fields Settings Section
 *
 * Manages table field configuration with support for 26+ field types.
 * Includes drag and drop functionality for reordering fields.
 */

import { useState, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { toast } from '@workspace/ui/components/sonner';
import type { FieldConfig, TableConfig } from '@workspace/active-tables-core';
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
import { FieldDeletionWarningDialog } from './field-deletion-warning-dialog';
import { findFieldReferences, cleanupFieldReferences } from '../../../utils/field-cleanup';
import { useActiveTables } from '../../../hooks/use-active-tables';
import { getActiveTable } from '../../../api/active-tables-api';

export interface FieldsSettingsSectionProps {
  /** Current fields */
  fields: FieldConfig[];

  /** Full table configuration (needed for cleanup) */
  config: TableConfig;

  /** Callback when fields change */
  onChange: (fields: FieldConfig[]) => void;

  /** Callback when config needs to be updated (for cleanup) */
  onConfigChange: (config: TableConfig) => void;

  /** Whether E2EE is enabled */
  e2eeEnabled?: boolean;

  /** Workspace ID for fetching available tables */
  workspaceId: string;

  /** Current table ID (to exclude from reference options) */
  currentTableId?: string;
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
export function FieldsSettingsSection({
  fields,
  config,
  onChange,
  onConfigChange,
  workspaceId,
  currentTableId,
}: FieldsSettingsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Field deletion warning state
  const [deletionWarning, setDeletionWarning] = useState<{
    open: boolean;
    fieldIndex: number;
    fieldName: string;
    fieldLabel: string;
    references: Array<{ location: string; details: string }>;
  } | null>(null);

  // Fetch available tables for reference fields
  // Performance: Uses React Query cache with 2min staleTime
  const { data: tablesResp, isLoading: tablesLoading } = useActiveTables(workspaceId);

  // Memoize available tables list to prevent unnecessary re-renders
  // Performance tip from docs: Memoize field lists for large schemas
  const availableTables = useMemo(() => {
    if (!tablesResp?.data) return [];

    return tablesResp.data
      .filter((table) => table.id !== currentTableId) // Exclude current table
      .map((table) => ({
        id: table.id,
        name: table.name,
      }));
  }, [tablesResp?.data, currentTableId]);

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

    // Find all references to this field in the configuration
    const references = findFieldReferences(fieldToDelete.name, config);

    // Show warning dialog
    setDeletionWarning({
      open: true,
      fieldIndex: index,
      fieldName: fieldToDelete.name,
      fieldLabel: fieldToDelete.label,
      references,
    });
  };

  const handleConfirmDeletion = () => {
    if (!deletionWarning) return;

    const fieldToDelete = fields[deletionWarning.fieldIndex];
    if (!fieldToDelete) return;

    // Remove the field
    const newFields = fields.filter((_, i) => i !== deletionWarning.fieldIndex);

    // Clean up all references to this field in the configuration
    const cleanedConfig = cleanupFieldReferences(fieldToDelete.name, config);

    // Update both fields and config
    onChange(newFields);
    onConfigChange(cleanedConfig);

    // Show success message
    const message =
      deletionWarning.references.length > 0
        ? `"${fieldToDelete.label}" has been removed and ${deletionWarning.references.length} configuration(s) updated`
        : `"${fieldToDelete.label}" has been removed`;

    toast.success('Field deleted', {
      description: message,
    });

    // Close dialog
    setDeletionWarning(null);
  };

  const handleCancelDeletion = () => {
    setDeletionWarning(null);
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

    const insertAt = Math.max(0, Math.min(dropIndex, newFields.length));

    // Insert at new position
    newFields.splice(insertAt, 0, draggedField);

    const nextPosition = newFields.findIndex((field) => field.name === draggedField.name);
    const finalPosition = nextPosition >= 0 ? nextPosition : insertAt;

    // Log for debugging
    console.log('Drag reorder:', {
      from: draggedIndex,
      to: dropIndex,
      actualInsert: insertAt,
      nextPosition: finalPosition,
      fieldName: draggedField.name,
      newOrder: newFields.map((f) => f.name),
    });

    // Force re-render by updating key
    setRenderKey((prev) => prev + 1);

    // Pass the new array to onChange
    onChange(newFields);

    // Show feedback
    toast.success('Field reordered', {
      description: `"${draggedField.label}" moved to position ${finalPosition + 1}`,
    });

    // Clear drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  /**
   * Load fields for a reference table
   * Performance: Lazy load only when table selected, uses React Query cache
   * Performance tip from docs: Debounce API calls - not needed here as triggered by user selection
   */
  const handleLoadReferenceFields = useCallback(
    async (tableId: string): Promise<Array<{ name: string; label: string; type: string }>> => {
      try {
        // Fetch table config to get field definitions
        const response = await getActiveTable(workspaceId, tableId);

        if (!response.data?.config?.fields) {
          return [];
        }

        // Extract field metadata for dropdown
        return response.data.config.fields.map((field) => ({
          name: field.name,
          label: field.label,
          type: field.type,
        }));
      } catch (error) {
        console.error('Failed to load reference fields:', error);
        toast.error('Failed to load fields', {
          description: 'Could not load fields from the selected table',
        });
        return [];
      }
    },
    [workspaceId],
  );

  // Memoize field names list - Performance tip from docs
  const existingFieldNames = useMemo(() => fields.map((f) => f.name), [fields]);

  const editingField = editingIndex !== null && fields[editingIndex] ? fields[editingIndex] : null;

  // Memoize field type color getter - Performance optimization
  const getFieldTypeColor = useCallback((type: string): string => {
    const fieldType = type as FieldType;
    if (isTextFieldType(fieldType)) return 'text-blue-600';
    if (isTimeFieldType(fieldType)) return 'text-purple-600';
    if (isNumberFieldType(fieldType)) return 'text-green-600';
    if (isSelectionFieldType(fieldType)) return 'text-orange-600';
    if (isReferenceFieldType(fieldType)) return 'text-pink-600';
    return 'text-gray-600';
  }, []);

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

      {/* Field Deletion Warning Dialog */}
      {deletionWarning && (
        <FieldDeletionWarningDialog
          open={deletionWarning.open}
          onOpenChange={(open) => {
            if (!open) setDeletionWarning(null);
          }}
          fieldName={deletionWarning.fieldName}
          fieldLabel={deletionWarning.fieldLabel}
          references={deletionWarning.references}
          onConfirm={handleConfirmDeletion}
          onCancel={handleCancelDeletion}
        />
      )}
    </SettingsSection>
  );
}
