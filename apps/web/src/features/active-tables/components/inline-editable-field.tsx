/**
 * Inline Editable Field Component
 *
 * Supports inline editing with double-click or click-to-edit
 * Features:
 * - Permission-based edit access
 * - Field-specific editors based on field type
 * - Auto-save on blur or Enter
 * - Cancel on Escape
 * - Loading states
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldConfig } from '@workspace/active-tables-core';
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
} from '@workspace/beqeek-shared';

export interface InlineEditableFieldProps {
  /** Field configuration */
  field: FieldConfig;
  /** Current field value */
  value: unknown;
  /** Can user edit this field */
  canEdit: boolean;
  /** Update handler */
  onUpdate: (fieldName: string, value: unknown) => Promise<void>;
  /** Is update in progress */
  isUpdating?: boolean;
  /** Edit mode trigger */
  editMode?: 'click' | 'double-click';
  /** CSS class name */
  className?: string;
}

/**
 * Inline editable field with permission checks
 */
export function InlineEditableField({
  field,
  value,
  canEdit,
  onUpdate,
  isUpdating = false,
  editMode = 'double-click',
  className = '',
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Update edit value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (isSaving || isUpdating) return;

    // Don't save if value unchanged
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(field.name, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('[InlineEditableField] Save failed:', error);
      // Keep editing mode open on error
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, field.name, onUpdate, isSaving, isUpdating]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  // Handle edit trigger
  const handleEditTrigger = useCallback(() => {
    if (!canEdit || isUpdating) return;
    setIsEditing(true);
  }, [canEdit, isUpdating]);

  // Handle key down
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Enter to save (except for multiline fields)
        if (field.type !== FIELD_TYPE_TEXT && field.type !== FIELD_TYPE_RICH_TEXT) {
          e.preventDefault();
          void handleSave();
        }
      } else if (e.key === 'Escape') {
        // Escape to cancel
        e.preventDefault();
        handleCancel();
      }
    },
    [field.type, handleSave, handleCancel],
  );

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Display value (read mode)
  const displayValue = value ? String(value) : <span className="text-muted-foreground italic">Empty</span>;

  // Render editor based on field type
  const renderEditor = () => {
    const commonProps = {
      ref: inputRef as any,
      onKeyDown: handleKeyDown,
      disabled: isSaving || isUpdating,
      autoFocus: true,
    };

    switch (field.type) {
      case FIELD_TYPE_SHORT_TEXT:
      case FIELD_TYPE_EMAIL:
      case FIELD_TYPE_URL:
        return (
          <Input
            {...commonProps}
            type={field.type === FIELD_TYPE_EMAIL ? 'email' : field.type === FIELD_TYPE_URL ? 'url' : 'text'}
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            className="h-8"
          />
        );

      case FIELD_TYPE_INTEGER:
      case FIELD_TYPE_NUMERIC:
        return (
          <Input
            {...commonProps}
            type="number"
            value={String(editValue || '')}
            onChange={(e) =>
              setEditValue(field.type === FIELD_TYPE_INTEGER ? parseInt(e.target.value) : parseFloat(e.target.value))
            }
            onBlur={handleSave}
            className="h-8"
          />
        );

      case FIELD_TYPE_TEXT:
        return (
          <Textarea
            {...commonProps}
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            rows={3}
            className="min-h-[80px]"
          />
        );

      case FIELD_TYPE_RICH_TEXT:
        return (
          <Textarea
            {...commonProps}
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            rows={5}
            className="min-h-[120px]"
          />
        );

      default:
        // Fallback to text input
        return (
          <Input
            {...commonProps}
            type="text"
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            className="h-8"
          />
        );
    }
  };

  // Render edit mode
  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        {renderEditor()}

        {/* Actions for rich text and multiline fields */}
        {(field.type === FIELD_TYPE_RICH_TEXT || field.type === FIELD_TYPE_TEXT) && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSaving || isUpdating}>
              <Check className="h-3.5 w-3.5 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving || isUpdating}>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render view mode
  return (
    <div
      className={cn(
        'group relative rounded px-2 py-1.5 transition-colors',
        canEdit && 'hover:bg-muted/50 cursor-pointer',
        className,
      )}
      onClick={editMode === 'click' ? handleEditTrigger : undefined}
      onDoubleClick={editMode === 'double-click' ? handleEditTrigger : undefined}
      title={canEdit ? (editMode === 'double-click' ? 'Double-click to edit' : 'Click to edit') : undefined}
    >
      {/* Display value */}
      <div className={cn('min-h-[1.5rem]', field.type === FIELD_TYPE_RICH_TEXT && 'whitespace-pre-wrap')}>
        {displayValue}
      </div>

      {/* Edit icon (show on hover) */}
      {canEdit && !isUpdating && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* Loading indicator */}
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
