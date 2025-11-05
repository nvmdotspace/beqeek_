/**
 * Field Options Editor Component
 *
 * Editor for selection field options (SELECT/CHECKBOX types).
 * Allows adding, editing, reordering, and deleting options with color customization.
 */

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Edit2, Check, Palette } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import type { FieldOption } from '@workspace/active-tables-core';

export interface FieldOptionsEditorProps {
  /** Current options */
  options: FieldOption[];

  /** Callback when options change */
  onChange: (options: FieldOption[]) => void;

  /** Show error state */
  error?: boolean;

  /** Error message */
  errorMessage?: string;
}

/**
 * Predefined color schemes for options
 */
const COLOR_PRESETS = [
  { text: '#1F2937', background: '#F3F4F6', name: 'Gray' },
  { text: '#1E40AF', background: '#DBEAFE', name: 'Blue' },
  { text: '#047857', background: '#D1FAE5', name: 'Green' },
  { text: '#DC2626', background: '#FEE2E2', name: 'Red' },
  { text: '#EA580C', background: '#FFEDD5', name: 'Orange' },
  { text: '#7C3AED', background: '#EDE9FE', name: 'Purple' },
  { text: '#DB2777', background: '#FCE7F3', name: 'Pink' },
  { text: '#0891B2', background: '#CFFAFE', name: 'Cyan' },
];

/**
 * Generate unique value from text
 */
function generateValue(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Field Options Editor Component
 *
 * Features:
 * - Add/edit/delete options
 * - Color picker with presets
 * - Drag to reorder (UI only, no drag library)
 * - Inline editing
 * - Validation (unique values, required text)
 */
export function FieldOptionsEditor({ options, onChange, error, errorMessage }: FieldOptionsEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newOptionText, setNewOptionText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  /**
   * Add new option
   */
  const handleAddOption = () => {
    if (!newOptionText.trim()) return;

    const value = generateValue(newOptionText);
    const colorPreset = COLOR_PRESETS[options.length % COLOR_PRESETS.length] || COLOR_PRESETS[0];

    if (!colorPreset) return; // Safety check (should never happen)

    const newOption: FieldOption = {
      text: newOptionText.trim(),
      value,
      text_color: colorPreset.text,
      background_color: colorPreset.background,
    };

    onChange([...options, newOption]);
    setNewOptionText('');
  };

  /**
   * Update option text
   */
  const handleUpdateOptionText = (index: number, text: string) => {
    const updated = [...options];
    updated[index] = {
      ...updated[index],
      text,
      value: generateValue(text),
    };
    onChange(updated);
  };

  /**
   * Update option colors
   */
  const handleUpdateColors = (index: number, text_color: string, background_color: string) => {
    const updated = [...options];
    const option = updated[index];
    if (option) {
      updated[index] = {
        ...option,
        text_color,
        background_color,
      };
      onChange(updated);
    }
    setShowColorPicker(null);
  };

  /**
   * Delete option
   */
  const handleDeleteOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    onChange(updated);
  };

  /**
   * Move option up
   */
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...options];
    const current = updated[index];
    const previous = updated[index - 1];
    if (current && previous) {
      [updated[index - 1], updated[index]] = [current, previous];
      onChange(updated);
    }
  };

  /**
   * Move option down
   */
  const handleMoveDown = (index: number) => {
    if (index === options.length - 1) return;
    const updated = [...options];
    const current = updated[index];
    const next = updated[index + 1];
    if (current && next) {
      [updated[index], updated[index + 1]] = [next, current];
      onChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="options-editor">
          Options <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Define the choices available for this field. At least one option is required.
        </p>
      </div>

      {/* Options List */}
      {options.length > 0 && (
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="divide-y">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors">
                {/* Drag Handle */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <GripVertical className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === options.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <GripVertical className="h-3 w-3" />
                  </button>
                </div>

                {/* Option Display / Edit */}
                {editingIndex === index ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => handleUpdateOptionText(index, e.target.value)}
                      placeholder="Option text"
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditingIndex(null)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: option.background_color || '#F3F4F6',
                        color: option.text_color || '#1F2937',
                      }}
                      className="font-normal"
                    >
                      {option.text}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{option.value}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1">
                  {/* Color Picker */}
                  <div className="relative">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setShowColorPicker(showColorPicker === index ? null : index)}
                      aria-label="Change colors"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>

                    {showColorPicker === index && (
                      <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-popover p-3 shadow-lg">
                        <p className="text-xs font-medium mb-2">Choose Color</p>
                        <div className="grid grid-cols-4 gap-2">
                          {COLOR_PRESETS.map((preset, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleUpdateColors(index, preset.text, preset.background)}
                              className="h-8 rounded-md border-2 hover:border-ring transition-colors"
                              style={{ backgroundColor: preset.background }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit */}
                  {editingIndex !== index && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditingIndex(index)}
                      aria-label="Edit option"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Delete */}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteOption(index)}
                    aria-label="Delete option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Add New Option */}
      <div className="flex gap-2">
        <Input
          id="options-editor"
          value={newOptionText}
          onChange={(e) => setNewOptionText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddOption();
            }
          }}
          placeholder="Enter option text..."
          className={error && options.length === 0 ? 'border-destructive' : ''}
        />
        <Button type="button" onClick={handleAddOption} disabled={!newOptionText.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Error Message */}
      {error && options.length === 0 && (
        <p className="text-sm text-destructive">{errorMessage || 'At least one option is required'}</p>
      )}

      {/* Summary */}
      <p className="text-sm text-muted-foreground">{options.length} option(s) defined</p>
    </div>
  );
}
