/**
 * Detail View Settings Section
 *
 * Configures how record details are displayed with two layout options:
 * - Head Detail: Single column layout
 * - Two Column Detail: Wide screen optimized layout
 */

import { useState, useEffect } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import {
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  RECORD_DETAIL_LAYOUT_TWO_COLUMN,
  COMMENTS_POSITION_RIGHT_PANEL,
  COMMENTS_POSITION_HIDDEN,
} from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { MultiSelectField } from '../multi-select-field';

export interface RecordDetailConfig {
  layout: 'head-detail' | 'two-column-detail';
  commentsPosition: 'right-panel' | 'hidden';
  // Common fields
  headTitleField?: string;
  headSubLineFields?: string[];
  // For head-detail layout
  rowTailFields?: string[];
  // For two-column-detail layout
  column1Fields?: string[];
  column2Fields?: string[];
}

export interface DetailViewSettingsSectionProps {
  /** Current detail view config */
  config: RecordDetailConfig;

  /** Available fields to select from */
  fields: Array<{ name: string; label: string; type: string }>;

  /** Callback when config changes */
  onChange: (config: RecordDetailConfig) => void;
}

/**
 * Detail View Settings Section
 */
export function DetailViewSettingsSection({ config, fields, onChange }: DetailViewSettingsSectionProps) {
  const [layout, setLayout] = useState<RecordDetailConfig['layout']>(config.layout || RECORD_DETAIL_LAYOUT_HEAD_DETAIL);
  const [commentsPosition, setCommentsPosition] = useState<RecordDetailConfig['commentsPosition']>(
    config.commentsPosition || COMMENTS_POSITION_RIGHT_PANEL,
  );
  const [headTitleField, setHeadTitleField] = useState(config.headTitleField || '');
  const [headSubLineFields, setHeadSubLineFields] = useState<string[]>(config.headSubLineFields || []);
  const [rowTailFields, setRowTailFields] = useState<string[]>(config.rowTailFields || []);
  const [column1Fields, setColumn1Fields] = useState<string[]>(config.column1Fields || []);
  const [column2Fields, setColumn2Fields] = useState<string[]>(config.column2Fields || []);

  // Update local state when config prop changes
  useEffect(() => {
    setLayout(config.layout || RECORD_DETAIL_LAYOUT_HEAD_DETAIL);
    setCommentsPosition(config.commentsPosition || COMMENTS_POSITION_RIGHT_PANEL);
    setHeadTitleField(config.headTitleField || '');
    setHeadSubLineFields(config.headSubLineFields || []);
    setRowTailFields(config.rowTailFields || []);
    setColumn1Fields(config.column1Fields || []);
    setColumn2Fields(config.column2Fields || []);
  }, [config]);

  // Notify parent of changes
  const handleChange = (updates: Partial<RecordDetailConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleLayoutChange = (newLayout: RecordDetailConfig['layout']) => {
    setLayout(newLayout);

    if (newLayout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL) {
      handleChange({
        layout: newLayout,
        headTitleField: headTitleField || fields[0]?.name || '',
        headSubLineFields,
        rowTailFields: rowTailFields.length > 0 ? rowTailFields : [],
        column1Fields: undefined,
        column2Fields: undefined,
      });
    } else {
      handleChange({
        layout: newLayout,
        headTitleField: headTitleField || fields[0]?.name || '',
        headSubLineFields,
        column1Fields: column1Fields.length > 0 ? column1Fields : [],
        column2Fields: column2Fields.length > 0 ? column2Fields : [],
        rowTailFields: undefined,
      });
    }
  };

  const fieldOptions = fields.map((f) => ({ value: f.name, label: f.label }));

  return (
    <SettingsSection
      title="Detail View Configuration"
      description="Configure how individual record details are displayed"
    >
      <div className="space-y-6">
        {/* Layout Selector */}
        <div className="space-y-2">
          <Label htmlFor="detail-layout">Layout Type</Label>
          <Select value={layout} onValueChange={(value) => handleLayoutChange(value as RecordDetailConfig['layout'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RECORD_DETAIL_LAYOUT_HEAD_DETAIL}>Head Detail (Single Column)</SelectItem>
              <SelectItem value={RECORD_DETAIL_LAYOUT_TWO_COLUMN}>Two Column Detail</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {layout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL
              ? 'Vertical layout suitable for narrow screens'
              : 'Two-column layout optimized for wide screens'}
          </p>
        </div>

        {/* Comments Position */}
        <div className="space-y-2">
          <Label htmlFor="comments-position">Comments Position</Label>
          <Select
            value={commentsPosition}
            onValueChange={(value) => {
              setCommentsPosition(value as RecordDetailConfig['commentsPosition']);
              handleChange({ commentsPosition: value as RecordDetailConfig['commentsPosition'] });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={COMMENTS_POSITION_RIGHT_PANEL}>Right Panel</SelectItem>
              <SelectItem value={COMMENTS_POSITION_HIDDEN}>Hidden</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {commentsPosition === COMMENTS_POSITION_RIGHT_PANEL
              ? 'Display comments in a separate column on the right'
              : 'Hide comments section'}
          </p>
        </div>

        {/* Common Fields (for both layouts) */}
        <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge>Header Section</Badge>
            <span className="text-sm text-muted-foreground">Applies to both layouts</span>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="head-title-field">
              Title Field <span className="text-destructive">*</span>
            </Label>
            <Select
              value={headTitleField}
              onValueChange={(value) => {
                setHeadTitleField(value);
                handleChange({ headTitleField: value });
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
            <p className="text-xs text-muted-foreground">Main field displayed at the top (prominent, large text)</p>
          </div>

          {/* Sub Line Fields */}
          <div className="space-y-2">
            <Label htmlFor="head-subline-fields">Sub-line Fields</Label>
            <MultiSelectField
              id="head-subline-fields"
              options={fieldOptions}
              value={headSubLineFields}
              onChange={(values) => {
                setHeadSubLineFields(values);
                handleChange({ headSubLineFields: values });
              }}
              placeholder="Select sub-line fields..."
            />
            <p className="text-xs text-muted-foreground">Fields displayed below the title in the header</p>
          </div>
        </div>

        {/* Head Detail Layout */}
        {layout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>Single Column Body</Badge>
              <span className="text-sm text-muted-foreground">Fields stacked vertically</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="row-tail-fields">Row Tail Fields</Label>
              <MultiSelectField
                id="row-tail-fields"
                options={fieldOptions}
                value={rowTailFields}
                onChange={(values) => {
                  setRowTailFields(values);
                  handleChange({ rowTailFields: values });
                }}
                placeholder="Select row tail fields..."
              />
              <p className="text-xs text-muted-foreground">Fields displayed in the body section vertically</p>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        {layout === RECORD_DETAIL_LAYOUT_TWO_COLUMN && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>Two Column Body</Badge>
              <span className="text-sm text-muted-foreground">Fields split into left and right columns</span>
            </div>

            {/* Column 1 Fields */}
            <div className="space-y-2">
              <Label htmlFor="column1-fields">Left Column Fields</Label>
              <MultiSelectField
                id="column1-fields"
                options={fieldOptions}
                value={column1Fields}
                onChange={(values) => {
                  setColumn1Fields(values);
                  handleChange({ column1Fields: values });
                }}
                placeholder="Select left column fields..."
              />
              <p className="text-xs text-muted-foreground">Fields displayed in the left column</p>
            </div>

            {/* Column 2 Fields */}
            <div className="space-y-2">
              <Label htmlFor="column2-fields">Right Column Fields</Label>
              <MultiSelectField
                id="column2-fields"
                options={fieldOptions}
                value={column2Fields}
                onChange={(values) => {
                  setColumn2Fields(values);
                  handleChange({ column2Fields: values });
                }}
                placeholder="Select right column fields..."
              />
              <p className="text-xs text-muted-foreground">Fields displayed in the right column</p>
            </div>
          </div>
        )}

        {/* Preview Info */}
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Preview Information</p>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
            Changes will be applied immediately when you save the settings. The detail view will reflect your
            configuration.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
