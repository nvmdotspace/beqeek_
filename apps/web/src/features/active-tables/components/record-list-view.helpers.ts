import type { Table, FieldConfig } from '@workspace/active-tables-core';

export type ResolvedRecordListConfig =
  | {
      layout: 'head-column';
      titleField?: string;
      subLineFields: string[];
      detailFields: string[];
    }
  | {
      layout: 'generic-table';
      titleField?: string;
      subLineFields: string[];
      detailFields: string[];
    };

export const DEFAULT_LIST_LAYOUT: ResolvedRecordListConfig['layout'] = 'generic-table';

/**
 * Build a stable map of field name -> field config
 */
export function buildFieldMap(fields: FieldConfig[] = []): Map<string, FieldConfig> {
  return new Map(fields.map((field: FieldConfig) => [field.name, field]));
}

/**
 * Resolve the final list view configuration using table config + sensible fallbacks.
 */
export function resolveListDisplayConfig(table: Table): ResolvedRecordListConfig {
  const listConfig = table.config.recordListConfig;
  const layout = (listConfig?.layout as ResolvedRecordListConfig['layout']) || DEFAULT_LIST_LAYOUT;
  const fields = table.config.fields ?? [];
  const fallbackFields = fields.slice(0, 5).map((field) => field.name);
  const configuredDisplayFields: string[] =
    listConfig?.displayFields && listConfig.displayFields.length > 0 ? listConfig.displayFields : fallbackFields;

  const titleField =
    listConfig?.titleField ||
    (layout === 'generic-table' ? configuredDisplayFields[0] : undefined) ||
    fallbackFields[0];

  if (layout === 'head-column') {
    return {
      layout: 'head-column',
      titleField,
      subLineFields: listConfig?.subLineFields ?? [],
      detailFields: listConfig?.tailFields ?? [],
    };
  }

  const subLineFields = configuredDisplayFields
    .filter((name): name is string => typeof name === 'string' && name !== titleField)
    .slice(0, 2);
  const detailFields = configuredDisplayFields.filter(
    (name): name is string => typeof name === 'string' && name !== titleField && !subLineFields.includes(name),
  );

  return {
    layout: 'generic-table',
    titleField,
    subLineFields,
    detailFields,
  };
}
