import { useState, useEffect } from 'react';
import { Settings, Paintbrush2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { ColorPicker } from '@workspace/ui/components/color-picker';
import { Separator } from '@workspace/ui/components/separator';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';
import type { ActiveFieldConfig, ActiveTableOption, KanbanConfig } from '../../types';

/**
 * Kanban settings dialog component
 * Allows configuration of kanban view settings
 */

export interface KanbanSettingsProps {
  /** All table field configurations */
  fields: ActiveFieldConfig[];

  /** Current kanban configuration */
  config: KanbanConfig;

  /** Whether save operation is in progress */
  isSaving?: boolean;

  /** Callback when settings are saved */
  onSave: (config: KanbanConfig) => void | Promise<void>;

  /** Optional trigger button */
  trigger?: React.ReactNode;
}

/**
 * Column style settings for a single status option
 */
interface ColumnStyleEditorProps {
  option: ActiveTableOption;
  currentColor?: string;
  onColorChange: (color: string) => void;
  onReset: () => void;
}

function ColumnStyleEditor({ option, currentColor, onColorChange, onReset }: ColumnStyleEditorProps) {
  const displayColor = currentColor || option.background_color || '#e2e8f0';

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{option.text}</p>
        <p className="text-xs text-muted-foreground">Column header color</p>
      </div>
      <div className="flex items-center gap-2">
        <ColorPicker
          color={displayColor}
          onChange={onColorChange}
          description={option.text}
        />
        {currentColor && currentColor !== option.background_color && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Kanban settings dialog
 * Configure status field, headline field, display fields, and column colors
 */
export function KanbanSettings({
  fields,
  config,
  isSaving = false,
  onSave,
  trigger,
}: KanbanSettingsProps) {
  const [open, setOpen] = useState(false);
  const [statusField, setStatusField] = useState(config.statusField);
  const [headlineField, setHeadlineField] = useState(config.kanbanHeadlineField);
  const [displayFields, setDisplayFields] = useState<string[]>(config.displayFields || []);
  const [columnColors, setColumnColors] = useState<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    config.columnStyles?.forEach((style) => {
      colors[style.value] = style.color;
    });
    return colors;
  });

  // Reset state when config changes
  useEffect(() => {
    setStatusField(config.statusField);
    setHeadlineField(config.kanbanHeadlineField);
    setDisplayFields(config.displayFields || []);
    const colors: Record<string, string> = {};
    config.columnStyles?.forEach((style) => {
      colors[style.value] = style.color;
    });
    setColumnColors(colors);
  }, [config]);

  // Get available SELECT_ONE fields for status
  const selectOneFields = fields.filter((field) => field.type === 'SELECT_ONE');

  // Get current status field definition
  const statusFieldDef = fields.find((f) => f.name === statusField);
  const statusOptions = statusFieldDef?.options || [];

  // Get all fields except status field for display options
  const displayableFields = fields.filter((f) => f.name !== statusField);

  // Check if settings have changed
  const hasChanges =
    statusField !== config.statusField ||
    headlineField !== config.kanbanHeadlineField ||
    JSON.stringify(displayFields) !== JSON.stringify(config.displayFields || []) ||
    JSON.stringify(columnColors) !== JSON.stringify(
      config.columnStyles?.reduce((acc, style) => {
        acc[style.value] = style.color;
        return acc;
      }, {} as Record<string, string>) || {}
    );

  const handleSave = async () => {
    const updatedConfig: KanbanConfig = {
      ...config,
      statusField,
      kanbanHeadlineField: headlineField,
      displayFields,
      columnStyles: Object.entries(columnColors).map(([value, color]) => ({
        value,
        color,
      })),
    };

    await onSave(updatedConfig);
    setOpen(false);
  };

  const toggleDisplayField = (fieldName: string) => {
    setDisplayFields((prev) =>
      prev.includes(fieldName)
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Kanban Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kanban Settings</DialogTitle>
          <DialogDescription>
            Configure your kanban board view settings
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6 px-1 -mx-1">
            {/* Status Field Selection */}
            <div className="space-y-2">
              <Label>Status Field *</Label>
              <Select value={statusField} onValueChange={setStatusField}>
                <SelectTrigger>
                  <span className="block truncate">
                    {statusField
                      ? (selectOneFields.find(f => f.name === statusField)?.label || statusField)
                      : 'Select status field'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {selectOneFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label || field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                SELECT_ONE field used to group records into columns
              </p>
            </div>

            {/* Headline Field Selection */}
            <div className="space-y-2">
              <Label>Headline Field *</Label>
              <Select value={headlineField} onValueChange={setHeadlineField}>
                <SelectTrigger>
                  <span className="block truncate">
                    {headlineField
                      ? (fields.find(f => f.name === headlineField)?.label || headlineField)
                      : 'Select headline field'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label || field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Field displayed as the main title in each card
              </p>
            </div>

            <Separator />

            {/* Display Fields Selection */}
            <div className="space-y-2">
              <Label>Display Fields</Label>
              <p className="text-xs text-muted-foreground">
                Additional fields shown in each card
              </p>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
                {displayableFields.map((field) => (
                  <label
                    key={field.name}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      displayFields.includes(field.name)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={displayFields.includes(field.name)}
                      onChange={() => toggleDisplayField(field.name)}
                      className="h-4 w-4"
                    />
                    <span className="flex-1 truncate">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {statusOptions.length > 0 && (
              <>
                <Separator />

                {/* Column Colors */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Paintbrush2 className="h-4 w-4" />
                    <Label>Column Colors</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customize the header color for each status column
                  </p>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <ColumnStyleEditor
                        key={option.value}
                        option={option}
                        currentColor={columnColors[option.value]}
                        onColorChange={(color) =>
                          setColumnColors((prev) => ({
                            ...prev,
                            [option.value]: color,
                          }))
                        }
                        onReset={() =>
                          setColumnColors((prev) => {
                            const next = { ...prev };
                            delete next[option.value];
                            return next;
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <Separator />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
