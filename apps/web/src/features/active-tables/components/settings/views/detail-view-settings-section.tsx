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
  type RecordDetailConfig as BeqeekRecordDetailConfig,
  type RecordDetailHeadConfig,
  type RecordDetailTwoColumnConfig,
  isHeadDetailLayout,
  isTwoColumnLayout,
} from '@workspace/beqeek-shared';

import { SettingsSection } from '../settings-layout';
import { MultiSelectField } from '../multi-select-field';

// Bottom position constant (not in beqeek-shared yet)
const _COMMENTS_POSITION_BOTTOM = 'bottom' as const;
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

// Type alias for the settings UI - uses beqeek-shared types
export type RecordDetailConfig = BeqeekRecordDetailConfig;

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
  const [commentsPosition, setCommentsPosition] = useState<'right-panel' | 'bottom' | 'hidden'>(
    config.commentsPosition || COMMENTS_POSITION_RIGHT_PANEL,
  );
  const [headTitleField, setHeadTitleField] = useState(config.headTitleField || '');
  const [headSubLineFields, setHeadSubLineFields] = useState<string[]>(config.headSubLineFields || []);

  // Layout-specific fields
  const [rowTailFields, setRowTailFields] = useState<string[]>(isHeadDetailLayout(config) ? config.rowTailFields : []);
  const [column1Fields, setColumn1Fields] = useState<string[]>(isTwoColumnLayout(config) ? config.column1Fields : []);
  const [column2Fields, setColumn2Fields] = useState<string[]>(isTwoColumnLayout(config) ? config.column2Fields : []);

  // Update local state when config prop changes
  useEffect(() => {
    setLayout(config.layout || RECORD_DETAIL_LAYOUT_HEAD_DETAIL);
    setCommentsPosition(config.commentsPosition || COMMENTS_POSITION_RIGHT_PANEL);
    setHeadTitleField(config.headTitleField || '');
    setHeadSubLineFields(config.headSubLineFields || []);

    if (isHeadDetailLayout(config)) {
      setRowTailFields(config.rowTailFields || []);
    } else if (isTwoColumnLayout(config)) {
      setColumn1Fields(config.column1Fields || []);
      setColumn2Fields(config.column2Fields || []);
    }
  }, [config]);

  const handleLayoutChange = (newLayout: RecordDetailConfig['layout']) => {
    setLayout(newLayout);

    if (newLayout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL) {
      const newConfig: RecordDetailHeadConfig = {
        layout: newLayout,
        commentsPosition: commentsPosition,
        headTitleField: headTitleField || fields[0]?.name || '',
        headSubLineFields: headSubLineFields || [],
        rowTailFields: rowTailFields || [],
      };
      onChange(newConfig);
    } else {
      const newConfig: RecordDetailTwoColumnConfig = {
        layout: newLayout,
        commentsPosition: commentsPosition,
        headTitleField: headTitleField || fields[0]?.name || '',
        headSubLineFields: headSubLineFields || [],
        column1Fields: column1Fields || [],
        column2Fields: column2Fields || [],
      };
      onChange(newConfig);
    }
  };

  // Helper to create type-safe config updates
  const createUpdatedConfig = (updates: {
    commentsPosition?: 'right-panel' | 'bottom' | 'hidden';
    headTitleField?: string;
    headSubLineFields?: string[];
    rowTailFields?: string[];
    column1Fields?: string[];
    column2Fields?: string[];
  }): RecordDetailConfig => {
    if (layout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL) {
      return {
        layout: RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
        commentsPosition: updates.commentsPosition ?? commentsPosition,
        headTitleField: updates.headTitleField ?? headTitleField,
        headSubLineFields: updates.headSubLineFields ?? headSubLineFields,
        rowTailFields: updates.rowTailFields ?? rowTailFields,
      };
    } else {
      return {
        layout: RECORD_DETAIL_LAYOUT_TWO_COLUMN,
        commentsPosition: updates.commentsPosition ?? commentsPosition,
        headTitleField: updates.headTitleField ?? headTitleField,
        headSubLineFields: updates.headSubLineFields ?? headSubLineFields,
        column1Fields: updates.column1Fields ?? column1Fields,
        column2Fields: updates.column2Fields ?? column2Fields,
      };
    }
  };

  const fieldOptions = fields.map((f) => ({ value: f.name, label: f.label }));

  return (
    <SettingsSection title={m.settings_detailView_title()} description={m.settings_detailView_description()}>
      <div className="space-y-6">
        {/* Layout Selector */}
        <div className="space-y-2">
          <Label htmlFor="detail-layout">{m.settings_detailView_layoutType()}</Label>
          <Select value={layout} onValueChange={(value) => handleLayoutChange(value as RecordDetailConfig['layout'])}>
            <SelectTrigger id="detail-layout">
              <SelectValue>
                {layout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL
                  ? m.settings_detailView_layoutHeadDetail()
                  : m.settings_detailView_layoutTwoColumn()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RECORD_DETAIL_LAYOUT_HEAD_DETAIL}>
                {m.settings_detailView_layoutHeadDetail()}
              </SelectItem>
              <SelectItem value={RECORD_DETAIL_LAYOUT_TWO_COLUMN}>{m.settings_detailView_layoutTwoColumn()}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {layout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL
              ? m.settings_detailView_layoutHeadDetailHelp()
              : m.settings_detailView_layoutTwoColumnHelp()}
          </p>
        </div>

        {/* Comments Position */}
        <div className="space-y-2">
          <Label htmlFor="comments-position">{m.settings_detailView_commentsPosition()}</Label>
          <Select
            value={commentsPosition}
            onValueChange={(value) => {
              const newValue = value as 'right-panel' | 'bottom' | 'hidden';
              setCommentsPosition(newValue);
              onChange(createUpdatedConfig({ commentsPosition: newValue }));
            }}
          >
            <SelectTrigger id="comments-position">
              <SelectValue>
                {commentsPosition === COMMENTS_POSITION_RIGHT_PANEL
                  ? m.settings_detailView_commentsRightPanel()
                  : m.settings_detailView_commentsHidden()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={COMMENTS_POSITION_RIGHT_PANEL}>
                {m.settings_detailView_commentsRightPanel()}
              </SelectItem>
              <SelectItem value={COMMENTS_POSITION_HIDDEN}>{m.settings_detailView_commentsHidden()}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {commentsPosition === COMMENTS_POSITION_RIGHT_PANEL
              ? m.settings_detailView_commentsRightPanelHelp()
              : m.settings_detailView_commentsHiddenHelp()}
          </p>
        </div>

        {/* Common Fields (for both layouts) */}
        <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge>{m.settings_detailView_headerSection()}</Badge>
            <span className="text-sm text-muted-foreground">{m.settings_detailView_headerSectionDescription()}</span>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="head-title-field">
              {m.settings_detailView_titleField()} <span className="text-destructive">{m.common_required()}</span>
            </Label>
            <Select
              value={headTitleField}
              onValueChange={(value) => {
                setHeadTitleField(value);
                onChange(createUpdatedConfig({ headTitleField: value }));
              }}
            >
              <SelectTrigger id="head-title-field">
                <SelectValue placeholder={m.settings_detailView_titleFieldPlaceholder()} />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{m.settings_detailView_titleFieldHelp()}</p>
          </div>

          {/* Sub Line Fields */}
          <div className="space-y-2">
            <Label htmlFor="head-subline-fields">{m.settings_detailView_subLineFields()}</Label>
            <MultiSelectField
              id="head-subline-fields"
              options={fieldOptions}
              value={headSubLineFields}
              onChange={(values) => {
                setHeadSubLineFields(values);
                onChange(createUpdatedConfig({ headSubLineFields: values }));
              }}
              placeholder={m.settings_detailView_subLineFieldsPlaceholder()}
            />
            <p className="text-xs text-muted-foreground">{m.settings_detailView_subLineFieldsHelp()}</p>
          </div>
        </div>

        {/* Head Detail Layout */}
        {layout === RECORD_DETAIL_LAYOUT_HEAD_DETAIL && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>{m.settings_detailView_singleColumnBody()}</Badge>
              <span className="text-sm text-muted-foreground">
                {m.settings_detailView_singleColumnBodyDescription()}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="row-tail-fields">{m.settings_detailView_rowTailFields()}</Label>
              <MultiSelectField
                id="row-tail-fields"
                options={fieldOptions}
                value={rowTailFields}
                onChange={(values) => {
                  setRowTailFields(values);
                  onChange(createUpdatedConfig({ rowTailFields: values }));
                }}
                placeholder={m.settings_detailView_rowTailFieldsPlaceholder()}
              />
              <p className="text-xs text-muted-foreground">{m.settings_detailView_rowTailFieldsHelp()}</p>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        {layout === RECORD_DETAIL_LAYOUT_TWO_COLUMN && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge>{m.settings_detailView_twoColumnBody()}</Badge>
              <span className="text-sm text-muted-foreground">{m.settings_detailView_twoColumnBodyDescription()}</span>
            </div>

            {/* Column 1 Fields */}
            <div className="space-y-2">
              <Label htmlFor="column1-fields">{m.settings_detailView_leftColumnFields()}</Label>
              <MultiSelectField
                id="column1-fields"
                options={fieldOptions}
                value={column1Fields}
                onChange={(values) => {
                  setColumn1Fields(values);
                  onChange(createUpdatedConfig({ column1Fields: values }));
                }}
                placeholder={m.settings_detailView_leftColumnFieldsPlaceholder()}
              />
              <p className="text-xs text-muted-foreground">{m.settings_detailView_leftColumnFieldsHelp()}</p>
            </div>

            {/* Column 2 Fields */}
            <div className="space-y-2">
              <Label htmlFor="column2-fields">{m.settings_detailView_rightColumnFields()}</Label>
              <MultiSelectField
                id="column2-fields"
                options={fieldOptions}
                value={column2Fields}
                onChange={(values) => {
                  setColumn2Fields(values);
                  onChange(createUpdatedConfig({ column2Fields: values }));
                }}
                placeholder={m.settings_detailView_rightColumnFieldsPlaceholder()}
              />
              <p className="text-xs text-muted-foreground">{m.settings_detailView_rightColumnFieldsHelp()}</p>
            </div>
          </div>
        )}

        {/* Preview Info */}
        <div className="rounded-lg border bg-info-subtle p-4">
          <p className="text-sm font-medium text-info">{m.settings_detailView_previewTitle()}</p>
          <p className="mt-1 text-xs text-info-subtle-foreground">{m.settings_detailView_previewDescription()}</p>
        </div>
      </div>
    </SettingsSection>
  );
}
