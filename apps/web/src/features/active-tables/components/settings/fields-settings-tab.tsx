import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Stack, Inline } from '@workspace/ui/components/primitives';

import type { ActiveTable } from '../../types';

export interface FieldsSettingsTabProps {
  table: ActiveTable;
  workspaceId: string;
}

/**
 * Fields Settings Tab
 *
 * Displays field configuration and searchable fields:
 * - List of all table fields with types
 * - Searchable fields configuration
 * - Field metadata
 */
export const FieldsSettingsTab = ({ table }: FieldsSettingsTabProps) => {
  const fields = table.config.fields || [];
  const hashedKeywordFields = table.config.hashedKeywordFields || [];

  return (
    <Stack space="space-300">
      {/* Table Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Trường dữ liệu (Table Fields)</CardTitle>
          <CardDescription>All fields configured for this table ({fields.length} fields)</CardDescription>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No fields configured</p>
          ) : (
            <Stack space="space-075">
              {fields.map((field, index) => (
                <Inline
                  key={field.name || index}
                  space="space-100"
                  align="start"
                  justify="between"
                  className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <Stack space="space-025" className="flex-1">
                    <Inline space="space-050" align="center">
                      <Label className="text-sm font-semibold">{field.label}</Label>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </Inline>
                    <p className="text-sm text-muted-foreground">
                      Field name: <code className="text-xs bg-muted px-1 py-0.5 rounded">{field.name}</code>
                    </p>
                    {field.placeholder && (
                      <p className="text-xs text-muted-foreground">Placeholder: {field.placeholder}</p>
                    )}
                  </Stack>
                  <Badge variant="secondary" className="ml-4 shrink-0">
                    {field.type}
                  </Badge>
                </Inline>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Searchable Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Trường dữ liệu tìm kiếm (Searchable Fields)</CardTitle>
          <CardDescription>Fields that are indexed for search functionality</CardDescription>
        </CardHeader>
        <CardContent>
          {hashedKeywordFields.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No searchable fields configured</p>
          ) : (
            <Inline space="space-050" wrap>
              {hashedKeywordFields.map((fieldName) => {
                const field = fields.find((f) => f.name === fieldName);
                return (
                  <Badge key={fieldName} variant="outline" className="px-3 py-1.5 text-sm">
                    {field?.label || fieldName}
                    <span className="ml-2 text-xs text-muted-foreground">({field?.type || 'unknown'})</span>
                  </Badge>
                );
              })}
            </Inline>
          )}
        </CardContent>
      </Card>

      {/* Quick Filters */}
      {table.config.quickFilters && table.config.quickFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Filters</CardTitle>
            <CardDescription>Fields available for quick filtering</CardDescription>
          </CardHeader>
          <CardContent>
            <Inline space="space-050" wrap>
              {table.config.quickFilters.map((filter, index) => {
                const field = fields.find((f) => f.name === filter.fieldName);
                return (
                  <Badge key={`${filter.fieldName}-${index}`} variant="secondary" className="px-3 py-1.5">
                    {field?.label || filter.fieldName}
                  </Badge>
                );
              })}
            </Inline>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
