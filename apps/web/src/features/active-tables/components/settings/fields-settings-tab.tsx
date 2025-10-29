import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';

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
    <div className="space-y-6">
      {/* Table Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Trường dữ liệu (Table Fields)</CardTitle>
          <CardDescription>
            All fields configured for this table ({fields.length} fields)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No fields configured
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.name || index}
                  className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-semibold">{field.label}</Label>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Field name: <code className="text-xs bg-muted px-1 py-0.5 rounded">{field.name}</code>
                    </p>
                    {field.placeholder && (
                      <p className="text-xs text-muted-foreground">
                        Placeholder: {field.placeholder}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-4 shrink-0">
                    {field.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Searchable Fields */}
      <Card>
        <CardHeader>
          <CardTitle>
            Trường dữ liệu tìm kiếm (Searchable Fields)
          </CardTitle>
          <CardDescription>
            Fields that are indexed for search functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hashedKeywordFields.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No searchable fields configured
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {hashedKeywordFields.map((fieldName) => {
                const field = fields.find((f) => f.name === fieldName);
                return (
                  <Badge
                    key={fieldName}
                    variant="outline"
                    className="px-3 py-1.5 text-sm"
                  >
                    {field?.label || fieldName}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({field?.type || 'unknown'})
                    </span>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Filters */}
      {table.config.quickFilters && table.config.quickFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Filters</CardTitle>
            <CardDescription>
              Fields available for quick filtering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {table.config.quickFilters.map((filter, index) => {
                const field = fields.find((f) => f.name === filter.fieldName);
                return (
                  <Badge
                    key={`${filter.fieldName}-${index}`}
                    variant="secondary"
                    className="px-3 py-1.5"
                  >
                    {field?.label || filter.fieldName}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
