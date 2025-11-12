/**
 * Field Options Editor Component
 *
 * Editor for selection field options (SELECT/CHECKBOX types).
 * Allows adding, editing, reordering, and deleting options with color customization.
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Palette, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';
import type { FieldOption } from '@workspace/active-tables-core';
import { m } from '@/paraglide/generated/messages.js';

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

function makeUniqueValue(baseValue: string, options: FieldOption[], ignoreIndex?: number): string {
  const sanitizedBase = baseValue || 'option';
  const used = new Set<string>();
  options.forEach((opt, idx) => {
    if (ignoreIndex !== undefined && idx === ignoreIndex) return;
    if (opt.value) {
      used.add(opt.value);
    }
  });

  let candidate = sanitizedBase;
  let attempt = 1;
  while (used.has(candidate)) {
    candidate = `${sanitizedBase}_${attempt}`;
    attempt += 1;
  }

  return candidate;
}

function isGeneratedFromText(option: FieldOption): boolean {
  const base = generateValue(option.text ?? '');
  const current = option.value ?? '';
  if (current === '') return true;
  if (current === base) return true;
  if (base && current.startsWith(`${base}_`)) {
    const suffix = current.slice(base.length + 1);
    return /^\d+$/.test(suffix);
  }
  return false;
}

/**
 * Field Options Editor Component
 *
 * Features:
 * - Add/edit/delete options
 * - Color picker with presets
 * - Drag to reorder options (native HTML5 drag-and-drop)
 * - Inline editing with auto-sync or custom values
 * - Visual feedback during drag operations
 * - Validation (unique values, required text)
 *
 * Implementation Notes:
 * - Entire card is draggable (same as fields-settings-section.tsx pattern)
 * - Input fields have stopPropagation on drag events to ensure keyboard input works reliably
 * - Uses stable React keys via useRef to prevent focus loss during typing
 * - Keys are only regenerated when options.length changes (add/delete/reorder)
 */
export function FieldOptionsEditor({ options, onChange, error, errorMessage }: FieldOptionsEditorProps) {
  const [newOptionText, setNewOptionText] = useState('');
  const [expandedOptionIndex, setExpandedOptionIndex] = useState<number | null>(null);
  const [activeColorPickerIndex, setActiveColorPickerIndex] = useState<number | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Generate stable IDs for options using a counter
  const nextIdRef = useRef(0);
  const optionIdsRef = useRef<Map<number, string>>(new Map());

  // Only regenerate IDs when options length changes (add/delete/reorder)
  useEffect(() => {
    // Clear old IDs and assign new ones based on current length
    if (optionIdsRef.current.size !== options.length) {
      optionIdsRef.current.clear();
      options.forEach((_, idx) => {
        optionIdsRef.current.set(idx, `option-${nextIdRef.current++}`);
      });
    }
  }, [options]);

  const getOptionKey = (index: number): string => {
    if (!optionIdsRef.current.has(index)) {
      const id = `option-${nextIdRef.current++}`;
      optionIdsRef.current.set(index, id);
      return id;
    }
    return optionIdsRef.current.get(index)!;
  };

  const duplicateValues = useMemo(() => {
    const counts = new Map<string, number>();
    options.forEach((option) => {
      const key = (option.value ?? '').trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([value]) => value),
    );
  }, [options]);

  const hasDuplicateValues = duplicateValues.size > 0;
  const duplicateValueSummary = useMemo(
    () =>
      Array.from(duplicateValues)
        .map((value) => (value === '' ? '(empty)' : value))
        .join(', '),
    [duplicateValues],
  );

  const closeColorPicker = () => setActiveColorPickerIndex(null);

  const toggleExpanded = (index: number) => {
    setExpandedOptionIndex(expandedOptionIndex === index ? null : index);
  };

  /**
   * Add new option
   */
  const handleAddOption = () => {
    const trimmed = newOptionText.trim();
    if (!trimmed) return;

    const baseValue = generateValue(trimmed) || `option_${options.length + 1}`;
    const colorPreset = COLOR_PRESETS[options.length % COLOR_PRESETS.length] || COLOR_PRESETS[0];

    if (!colorPreset) return; // Safety check (should never happen)

    const newOption: FieldOption = {
      text: trimmed,
      value: makeUniqueValue(baseValue, options),
      text_color: colorPreset.text,
      background_color: colorPreset.background,
    };

    onChange([...options, newOption]);
    setNewOptionText('');
    closeColorPicker();
  };

  /**
   * Update option text
   */
  const handleUpdateOptionText = (index: number, text: string) => {
    const updated = [...options];
    const previous = updated[index];
    if (!previous) return;

    const nextText = text;
    const shouldSyncValue = isGeneratedFromText(previous);
    const nextOption: FieldOption = {
      ...previous,
      text: nextText,
    };

    if (shouldSyncValue) {
      const baseValue = generateValue(nextText) || `option_${index + 1}`;
      nextOption.value = makeUniqueValue(baseValue, options, index);
    }

    updated[index] = nextOption;
    onChange(updated);
  };

  /**
   * Update option colors
   */
  const handleUpdateColors = (index: number, textColor: string, backgroundColor: string) => {
    const updated = [...options];
    const option = updated[index];
    if (!option) return;

    updated[index] = {
      ...option,
      text_color: textColor,
      background_color: backgroundColor,
    };
    onChange(updated);
    closeColorPicker();
  };

  const handleColorInputChange = (index: number, key: 'text_color' | 'background_color', value: string) => {
    const updated = [...options];
    const option = updated[index];
    if (!option) return;

    updated[index] = {
      ...option,
      [key]: value,
    } as FieldOption;
    onChange(updated);
  };

  const handleOptionValueChange = (index: number, value: string) => {
    const updated = [...options];
    const option = updated[index];
    if (!option) return;

    const sanitized = generateValue(value);
    updated[index] = {
      ...option,
      value: sanitized,
    };
    onChange(updated);
  };

  const handleResetValue = (index: number) => {
    const updated = [...options];
    const option = updated[index];
    if (!option) return;

    const base = generateValue(option.text ?? '') || `option_${index + 1}`;
    updated[index] = {
      ...option,
      value: makeUniqueValue(base, options, index),
    };
    onChange(updated);
  };

  /**
   * Delete option
   */
  const handleDeleteOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    onChange(updated);
    closeColorPicker();
  };

  /**
   * Drag and drop handlers
   */
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
    const newOptions = [...options];
    const [draggedOption] = newOptions.splice(draggedIndex, 1);

    if (!draggedOption) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const insertAt = Math.max(0, Math.min(dropIndex, newOptions.length));

    // Insert at new position
    newOptions.splice(insertAt, 0, draggedOption);

    const nextPosition = newOptions.findIndex((opt) => opt.value === draggedOption.value);
    const finalPosition = nextPosition >= 0 ? nextPosition : insertAt;

    // Log for debugging
    console.log('Option reorder:', {
      from: draggedIndex,
      to: dropIndex,
      actualInsert: insertAt,
      nextPosition: finalPosition,
      optionValue: draggedOption.value,
      newOrder: newOptions.map((opt) => opt.value),
    });

    // Pass the new array to onChange
    onChange(newOptions);

    // Clear drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-option-input" className="text-sm font-medium">
          {m.settings_fieldOptions_title()} <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">{m.settings_fieldOptions_description()}</p>
      </div>

      {hasDuplicateValues && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Option values must be unique. Duplicate values found: {duplicateValueSummary}.
        </div>
      )}

      {/* Add New Option - Prominent Position */}
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="new-option-input"
            value={newOptionText}
            onChange={(e) => setNewOptionText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddOption();
              }
            }}
            placeholder={m.settings_fieldOptions_addPlaceholder()}
            className={cn('flex-1', error && options.length === 0 && 'border-destructive')}
          />
          <Button type="button" onClick={handleAddOption} disabled={!newOptionText.trim()} className="sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {m.settings_fieldOptions_addButton()}
          </Button>
        </div>
        {error && options.length === 0 && (
          <p className="mt-2 text-sm text-destructive">{errorMessage || 'At least one option is required'}</p>
        )}
      </div>

      {/* Options List - Compact Cards */}
      {options.length > 0 && (
        <ScrollArea className="max-h-[500px] rounded-md border">
          <div className="space-y-2 p-3">
            {options.map((option, index) => {
              const trimmedValue = (option.value ?? '').trim();
              const valueDuplicate = trimmedValue !== '' && duplicateValues.has(trimmedValue);
              const valueError = trimmedValue === '' || valueDuplicate;
              const isAutoValue = isGeneratedFromText(option);
              const isExpanded = expandedOptionIndex === index;

              return (
                <div
                  key={getOptionKey(index)}
                  className={cn(
                    'rounded-lg border bg-card transition-all relative border-l-4',
                    valueError ? 'border-destructive/60' : 'border-border',
                    isExpanded ? 'shadow-md' : 'shadow-sm',
                    dragOverIndex === index ? 'bg-primary/5 border-l-primary' : 'border-l-transparent',
                    draggedIndex === index ? 'opacity-50' : '',
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Compact Header - Always Visible */}
                  <div className="flex items-center gap-2 p-3">
                    <button
                      type="button"
                      className="h-7 w-7 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      aria-label={`Drag to reorder ${option.text || 'option'}`}
                      tabIndex={0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>

                    <div
                      className="flex min-w-0 flex-1 cursor-pointer items-center"
                      onClick={() => toggleExpanded(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpanded(index);
                        }
                      }}
                    >
                      <Badge
                        style={{
                          backgroundColor: option.background_color || '#F3F4F6',
                          color: option.text_color || '#1F2937',
                        }}
                        className="max-w-full truncate px-3 py-1.5 text-sm"
                      >
                        {option.text || 'Untitled'}
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                      onClick={() => toggleExpanded(index)}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteOption(index)}
                      aria-label="Delete option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex h-8 items-center">
                            <Label htmlFor={`option-text-${index}`} className="text-sm font-medium">
                              {m.settings_fieldOptions_displayLabel()}
                            </Label>
                          </div>
                          <Input
                            id={`option-text-${index}`}
                            value={option.text ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 100) {
                                handleUpdateOptionText(index, value);
                              }
                            }}
                            onDragStart={(e) => e.stopPropagation()}
                            onDrop={(e) => e.stopPropagation()}
                            placeholder="Option text"
                            maxLength={100}
                          />
                          <p className="text-xs text-muted-foreground">
                            {m.settings_fieldOptions_characterCount({
                              current: (option.text ?? '').length.toString(),
                              max: '100',
                            })}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex h-8 items-center justify-between">
                            <Label htmlFor={`option-value-${index}`} className="text-sm font-medium">
                              {m.settings_fieldOptions_value()}
                            </Label>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {isAutoValue
                                  ? m.settings_fieldOptions_valueBadgeAuto()
                                  : m.settings_fieldOptions_valueBadgeCustom()}
                              </Badge>
                              {!isAutoValue && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleResetValue(index)}
                                  aria-label="Reset value to generated"
                                  className="h-7 w-7"
                                >
                                  <RefreshCcw className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <Input
                            id={`option-value-${index}`}
                            value={option.value ?? ''}
                            onChange={(e) => handleOptionValueChange(index, e.target.value)}
                            onDragStart={(e) => e.stopPropagation()}
                            onDrop={(e) => e.stopPropagation()}
                            placeholder="system_value"
                            className={cn(valueError && 'border-destructive focus-visible:ring-destructive')}
                          />
                          {valueError && (
                            <p className="text-xs text-destructive">
                              {trimmedValue === ''
                                ? 'Value is required.'
                                : 'This value is already used by another option.'}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <Label className="text-sm font-medium">{m.settings_fieldOptions_colorCustomization()}</Label>
                          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                {m.settings_fieldOptions_colorPresets()}
                              </Label>
                              <div className="relative">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="w-full justify-start gap-2"
                                  onClick={() =>
                                    setActiveColorPickerIndex(activeColorPickerIndex === index ? null : index)
                                  }
                                >
                                  <Palette className="h-4 w-4" />
                                  {m.settings_fieldOptions_colorPresetsButton()}
                                </Button>
                                {activeColorPickerIndex === index && (
                                  <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border bg-popover p-3 shadow-lg">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      {m.settings_fieldOptions_colorPresets()}
                                    </p>
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                      {COLOR_PRESETS.map((preset) => (
                                        <button
                                          key={preset.name}
                                          type="button"
                                          onClick={() => handleUpdateColors(index, preset.text, preset.background)}
                                          className="h-9 rounded-md border border-border transition-colors hover:border-ring"
                                          style={{ backgroundColor: preset.background }}
                                          title={preset.name}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`option-text-color-${index}`} className="text-xs text-muted-foreground">
                                {m.settings_fieldOptions_colorText()}
                              </Label>
                              <Input
                                id={`option-text-color-${index}`}
                                type="color"
                                value={option.text_color || '#1F2937'}
                                onChange={(e) => handleColorInputChange(index, 'text_color', e.target.value)}
                                onDragStart={(e) => e.stopPropagation()}
                                onDrop={(e) => e.stopPropagation()}
                                className="h-9 w-20 cursor-pointer"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`option-background-color-${index}`}
                                className="text-xs text-muted-foreground"
                              >
                                {m.settings_fieldOptions_colorBackground()}
                              </Label>
                              <Input
                                id={`option-background-color-${index}`}
                                type="color"
                                value={option.background_color || '#F3F4F6'}
                                onChange={(e) => handleColorInputChange(index, 'background_color', e.target.value)}
                                onDragStart={(e) => e.stopPropagation()}
                                onDrop={(e) => e.stopPropagation()}
                                className="h-9 w-20 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Summary */}
      {options.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {m.settings_fieldOptions_summary({ count: options.length.toString() })}
        </p>
      )}
    </div>
  );
}
