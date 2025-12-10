/**
 * Quick Filters Section
 *
 * Manages quick filter configuration for fast record filtering
 */

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { QUICK_FILTER_VALID_FIELD_TYPES, generateUUIDv7, type FieldType } from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';
import { Stack, Inline } from '@workspace/ui/components/primitives';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface QuickFilter {
  filterId: string;
  fieldName: string;
  fieldLabel?: string;
  fieldType?: string;
}

export interface QuickFiltersSectionProps {
  /** Current quick filters */
  quickFilters: QuickFilter[];

  /** Available fields to filter by */
  fields: Array<{ name: string; label: string; type: string }>;

  /** Callback when filters change */
  onChange: (filters: QuickFilter[]) => void;
}

/**
 * Quick Filters Section
 */
export function QuickFiltersSection({ quickFilters, fields, onChange }: QuickFiltersSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFieldName, setSelectedFieldName] = useState('');

  // Filter eligible fields (only choice-based fields)
  const quickFilterFieldSet = useMemo(
    () => new Set<FieldType>(QUICK_FILTER_VALID_FIELD_TYPES.map((type) => type as FieldType)),
    [],
  );

  const eligibleFields = fields.filter((field) => quickFilterFieldSet.has(field.type as FieldType));

  // Fields already used in quick filters
  const usedFieldNames = quickFilters.map((qf) => qf.fieldName);

  // Fields available to add
  const availableFields = eligibleFields.filter((f) => !usedFieldNames.includes(f.name));

  const handleAddFilter = () => {
    setSelectedFieldName(availableFields[0]?.name || '');
    setIsModalOpen(true);
  };

  const handleDeleteFilter = (filterIdOrFieldName: string | undefined) => {
    // Handle both filterId (new data) and fieldName (legacy data without filterId)
    const newFilters = quickFilters.filter((qf) => {
      // If filterId exists in the data, use it for comparison
      if (qf.filterId) {
        return qf.filterId !== filterIdOrFieldName;
      }
      // Otherwise, fall back to fieldName comparison (legacy data)
      return qf.fieldName !== filterIdOrFieldName;
    });

    onChange(newFilters);
  };

  const handleSubmitFilter = () => {
    if (!selectedFieldName) return;

    const field = fields.find((f) => f.name === selectedFieldName);
    if (!field) return;

    const newFilter: QuickFilter = {
      filterId: generateUUIDv7(),
      fieldName: field.name,
      fieldLabel: field.label,
      fieldType: field.type,
    };

    onChange([...quickFilters, newFilter]);
    setIsModalOpen(false);
  };

  const getFieldTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      CHECKBOX_YES_NO: 'bg-success-subtle text-success',
      SELECT_ONE: 'bg-info-subtle text-info',
      SELECT_LIST: 'bg-accent-purple-subtle text-accent-purple',
      SELECT_ONE_RECORD: 'bg-accent-pink-subtle text-accent-pink',
      SELECT_LIST_RECORD: 'bg-accent-pink-subtle text-accent-pink',
      SELECT_ONE_WORKSPACE_USER: 'bg-accent-orange-subtle text-accent-orange',
      SELECT_LIST_WORKSPACE_USER: 'bg-accent-orange-subtle text-accent-orange',
    };

    return (
      <Badge variant="outline" className={`text-xs ${colors[type] || ''}`}>
        {type}
      </Badge>
    );
  };

  return (
    <SettingsSection
      title={m.settings_quickFilters_title()}
      description={m.settings_quickFilters_description()}
      actions={
        <Button onClick={handleAddFilter} size="sm" disabled={availableFields.length === 0}>
          <Inline space="space-050" align="center">
            <Plus className="h-4 w-4" />
            {m.settings_quickFilters_addButton()}
          </Inline>
        </Button>
      }
    >
      <Stack space="space-100">
        {quickFilters.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {m.settings_quickFilters_empty()}{' '}
              {availableFields.length > 0
                ? m.settings_quickFilters_emptyWithFields()
                : m.settings_quickFilters_emptyNoFields()}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] rounded-md border">
            <div className="divide-y">
              {quickFilters.map((filter, index) => {
                const field = fields.find((f) => f.name === filter.fieldName);
                return (
                  <Inline
                    key={filter.filterId || `${filter.fieldName}-${index}`}
                    align="center"
                    space="space-100"
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Stack space="space-025" className="flex-1">
                      <Inline align="center" space="space-050">
                        <span className="font-medium">{filter.fieldLabel || filter.fieldName}</span>
                        {field && getFieldTypeBadge(field.type)}
                      </Inline>
                      <Inline align="center" space="space-050" className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{filter.fieldName}</span>
                      </Inline>
                    </Stack>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFilter(filter.filterId || filter.fieldName)}
                      className="text-destructive hover:text-destructive"
                      aria-label={m.settings_quickFilters_deleteFilter({
                        fieldName: filter.fieldLabel || filter.fieldName,
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Inline>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Statistics and Info */}
        <Stack space="space-050">
          <Inline space="space-100" className="text-sm text-muted-foreground">
            <span>
              {m.settings_quickFilters_statsActive()}: {quickFilters.length}
            </span>
            <span>
              {m.settings_quickFilters_statsEligible()}: {eligibleFields.length}
            </span>
            <span>
              {m.settings_quickFilters_statsAvailable()}: {availableFields.length}
            </span>
          </Inline>

          <div className="rounded-lg border border-info/20 bg-info-subtle p-4">
            <p className="text-sm font-medium text-info">{m.settings_quickFilters_infoTitle()}</p>
            <p className="mt-1 text-xs text-info">{m.settings_quickFilters_infoDescription()}</p>
          </div>
        </Stack>
      </Stack>

      {/* Add Filter Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{m.settings_quickFilters_dialogTitle()}</DialogTitle>
            <DialogDescription>{m.settings_quickFilters_dialogDescription()}</DialogDescription>
          </DialogHeader>

          <Stack space="space-100" className="py-4">
            <Stack space="space-050">
              <Label htmlFor="filter-field">
                {m.settings_quickFilters_fieldLabel()} <span className="text-destructive">{m.common_required()}</span>
              </Label>
              <Select value={selectedFieldName} onValueChange={setSelectedFieldName}>
                <SelectTrigger id="filter-field">
                  <SelectValue placeholder={m.settings_quickFilters_fieldPlaceholder()} />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{m.settings_quickFilters_fieldHelp()}</p>
            </Stack>
          </Stack>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {m.common_cancel()}
            </Button>
            <Button type="button" onClick={handleSubmitFilter} disabled={!selectedFieldName}>
              {m.settings_quickFilters_dialogSubmit()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
