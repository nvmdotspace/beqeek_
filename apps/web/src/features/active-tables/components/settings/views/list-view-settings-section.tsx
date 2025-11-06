/**
 * List View Settings Section
 *
 * Configures how records are displayed in list view with two layout options:
 * - Generic Table: Standard table with columns
 * - Head Column: Card-style compact view
 */

import { useState, useEffect } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import { RECORD_LIST_LAYOUT_GENERIC_TABLE, RECORD_LIST_LAYOUT_HEAD_COLUMN } from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { MultiSelectField } from '../multi-select-field';

export interface RecordListConfig {
  layout: 'generic-table' | 'head-column';
  // For generic-table layout
  displayFields?: string[];
  // For head-column layout
  titleField?: string;
  subLineFields?: string[];
  tailFields?: string[];
}

export interface ListViewSettingsSectionProps {
  /** Current list view config */
  config: RecordListConfig;

  /** Available fields to select from */
  fields: Array<{ name: string; label: string; type: string }>;

  /** Callback when config changes */
  onChange: (config: RecordListConfig) => void;
}

/**
 * List View Settings Section
 */
export function ListViewSettingsSection({ config, fields, onChange }: ListViewSettingsSectionProps) {
  const [layout, setLayout] = useState<RecordListConfig['layout']>(config.layout || RECORD_LIST_LAYOUT_GENERIC_TABLE);
  const [displayFields, setDisplayFields] = useState<string[]>(config.displayFields || []);
  const [titleField, setTitleField] = useState(config.titleField || '');
  const [subLineFields, setSubLineFields] = useState<string[]>(config.subLineFields || []);
  const [tailFields, setTailFields] = useState<string[]>(config.tailFields || []);

  // Update local state when config prop changes
  useEffect(() => {
    setLayout(config.layout || RECORD_LIST_LAYOUT_GENERIC_TABLE);
    setDisplayFields(config.displayFields || []);
    setTitleField(config.titleField || '');
    setSubLineFields(config.subLineFields || []);
    setTailFields(config.tailFields || []);
  }, [config]);

  // Notify parent of changes
  const handleChange = (updates: Partial<RecordListConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleLayoutChange = (newLayout: RecordListConfig['layout']) => {
    setLayout(newLayout);

    // Reset fields based on layout
    if (newLayout === RECORD_LIST_LAYOUT_GENERIC_TABLE) {
      handleChange({
        layout: newLayout,
        displayFields: displayFields.length > 0 ? displayFields : fields.slice(0, 5).map((f) => f.name),
        titleField: undefined,
        subLineFields: undefined,
        tailFields: undefined,
      });
    } else {
      handleChange({
        layout: newLayout,
        titleField: titleField || fields[0]?.name || '',
        subLineFields: subLineFields.length > 0 ? subLineFields : [],
        tailFields: tailFields.length > 0 ? tailFields : [],
        displayFields: undefined,
      });
    }
  };

  const fieldOptions = fields.map((f) => ({ value: f.name, label: f.label }));

  return (
    <SettingsSection title="List View Configuration" description="Configure how records are displayed in the list view">
      <div className="space-y-6">
        {/* Layout Selector */}
        <div className="space-y-2">
          <Label>Layout Type</Label>
          <Select value={layout} onValueChange={(value) => handleLayoutChange(value as RecordListConfig['layout'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RECORD_LIST_LAYOUT_GENERIC_TABLE}>Generic Table</SelectItem>
              <SelectItem value={RECORD_LIST_LAYOUT_HEAD_COLUMN}>Head Column (Card Style)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {layout === RECORD_LIST_LAYOUT_GENERIC_TABLE
              ? 'Standard table view with columns for each field'
              : 'Compact card-style view suitable for mobile or tight spaces'}
          </p>
        </div>

        {/* Generic Table Layout */}
        {layout === RECORD_LIST_LAYOUT_GENERIC_TABLE && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>Generic Table</Badge>
              <span className="text-sm text-muted-foreground">Each record is a row, each field is a column</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-fields">Display Fields</Label>
              <MultiSelectField
                id="display-fields"
                options={fieldOptions}
                value={displayFields}
                onChange={(values) => {
                  setDisplayFields(values);
                  handleChange({ displayFields: values });
                }}
                placeholder="Select fields to display..."
              />
              <p className="text-xs text-muted-foreground">
                Selected fields will appear as columns in the list view (order matters)
              </p>
            </div>
          </div>
        )}

        {/* Head Column Layout */}
        {layout === RECORD_LIST_LAYOUT_HEAD_COLUMN && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>Head Column</Badge>
              <span className="text-sm text-muted-foreground">Compact card-style view</span>
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title-field">
                Title Field <span className="text-destructive">*</span>
              </Label>
              <Select
                value={titleField}
                onValueChange={(value) => {
                  setTitleField(value);
                  handleChange({ titleField: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select title field..." />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Main field displayed prominently (bold, large text)</p>
            </div>

            {/* Sub Line Fields */}
            <div className="space-y-2">
              <Label htmlFor="subline-fields">Sub-line Fields</Label>
              <MultiSelectField
                id="subline-fields"
                options={fieldOptions}
                value={subLineFields}
                onChange={(values) => {
                  setSubLineFields(values);
                  handleChange({ subLineFields: values });
                }}
                placeholder="Select sub-line fields..."
              />
              <p className="text-xs text-muted-foreground">Fields displayed below the title in smaller text</p>
            </div>

            {/* Tail Fields */}
            <div className="space-y-2">
              <Label htmlFor="tail-fields">Tail Fields</Label>
              <MultiSelectField
                id="tail-fields"
                options={fieldOptions}
                value={tailFields}
                onChange={(values) => {
                  setTailFields(values);
                  handleChange({ tailFields: values });
                }}
                placeholder="Select tail fields..."
              />
              <p className="text-xs text-muted-foreground">
                Fields displayed at the end of each row (status, date, etc.)
              </p>
            </div>
          </div>
        )}

        {/* Preview Info */}
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Preview Information</p>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
            Changes will be applied immediately when you save the settings. The list view will reflect your
            configuration.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
