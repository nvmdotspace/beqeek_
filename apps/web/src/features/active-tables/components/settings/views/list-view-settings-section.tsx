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
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
    <SettingsSection title={m.settings_listView_title()} description={m.settings_listView_description()}>
      <div className="space-y-6">
        {/* Layout Selector */}
        <div className="space-y-2">
          <Label>{m.settings_listView_layoutType()}</Label>
          <Select value={layout} onValueChange={(value) => handleLayoutChange(value as RecordListConfig['layout'])}>
            <SelectTrigger>
              <SelectValue>
                {layout === RECORD_LIST_LAYOUT_GENERIC_TABLE
                  ? m.settings_listView_layoutGenericTable()
                  : m.settings_listView_layoutHeadColumn()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RECORD_LIST_LAYOUT_GENERIC_TABLE}>
                {m.settings_listView_layoutGenericTable()}
              </SelectItem>
              <SelectItem value={RECORD_LIST_LAYOUT_HEAD_COLUMN}>{m.settings_listView_layoutHeadColumn()}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {layout === RECORD_LIST_LAYOUT_GENERIC_TABLE
              ? m.settings_listView_layoutGenericTableHelp()
              : m.settings_listView_layoutHeadColumnHelp()}
          </p>
        </div>

        {/* Generic Table Layout */}
        {layout === RECORD_LIST_LAYOUT_GENERIC_TABLE && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>{m.settings_listView_layoutGenericTable()}</Badge>
              <span className="text-sm text-muted-foreground">
                {m.settings_listView_genericTableBadgeDescription()}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-fields">{m.settings_listView_displayFields()}</Label>
              <MultiSelectField
                id="display-fields"
                options={fieldOptions}
                value={displayFields}
                onChange={(values) => {
                  setDisplayFields(values);
                  handleChange({ displayFields: values });
                }}
                placeholder={m.settings_listView_displayFieldsPlaceholder()}
              />
              <p className="text-xs text-muted-foreground">{m.settings_listView_displayFieldsHelp()}</p>
            </div>
          </div>
        )}

        {/* Head Column Layout */}
        {layout === RECORD_LIST_LAYOUT_HEAD_COLUMN && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>{m.settings_listView_layoutHeadColumn()}</Badge>
              <span className="text-sm text-muted-foreground">{m.settings_listView_headColumnBadgeDescription()}</span>
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title-field">
                {m.settings_listView_titleField()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Select
                value={titleField}
                onValueChange={(value) => {
                  setTitleField(value);
                  handleChange({ titleField: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={m.settings_listView_titleFieldPlaceholder()}>
                    {titleField ? fields.find((f) => f.name === titleField)?.label : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{m.settings_listView_titleFieldHelp()}</p>
            </div>

            {/* Sub Line Fields */}
            <div className="space-y-2">
              <Label htmlFor="subline-fields">{m.settings_listView_subLineFields()}</Label>
              <MultiSelectField
                id="subline-fields"
                options={fieldOptions}
                value={subLineFields}
                onChange={(values) => {
                  setSubLineFields(values);
                  handleChange({ subLineFields: values });
                }}
                placeholder={m.settings_listView_subLineFieldsPlaceholder()}
              />
              <p className="text-xs text-muted-foreground">{m.settings_listView_subLineFieldsHelp()}</p>
            </div>

            {/* Tail Fields */}
            <div className="space-y-2">
              <Label htmlFor="tail-fields">{m.settings_listView_tailFields()}</Label>
              <MultiSelectField
                id="tail-fields"
                options={fieldOptions}
                value={tailFields}
                onChange={(values) => {
                  setTailFields(values);
                  handleChange({ tailFields: values });
                }}
                placeholder={m.settings_listView_tailFieldsPlaceholder()}
              />
              <p className="text-xs text-muted-foreground">{m.settings_listView_tailFieldsHelp()}</p>
            </div>
          </div>
        )}

        {/* Preview Info */}
        <div className="rounded-lg border bg-info-subtle p-4">
          <p className="text-sm font-medium text-info">{m.settings_listView_previewTitle()}</p>
          <p className="mt-1 text-xs text-info-subtle-foreground">{m.settings_listView_previewDescription()}</p>
        </div>
      </div>
    </SettingsSection>
  );
}
