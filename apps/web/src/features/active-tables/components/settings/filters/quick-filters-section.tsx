/**
 * Quick Filters Section
 *
 * Manages quick filter configuration for fast record filtering
 */

import { useState } from 'react';
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
import { QUICK_FILTER_VALID_FIELD_TYPES, generateUUIDv7 } from '@workspace/beqeek-shared';
import { SettingsSection } from '../settings-layout';

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
  const eligibleFields = fields.filter((f) => QUICK_FILTER_VALID_FIELD_TYPES.includes(f.type as any));

  // Fields already used in quick filters
  const usedFieldNames = quickFilters.map((qf) => qf.fieldName);

  // Fields available to add
  const availableFields = eligibleFields.filter((f) => !usedFieldNames.includes(f.name));

  const handleAddFilter = () => {
    setSelectedFieldName(availableFields[0]?.name || '');
    setIsModalOpen(true);
  };

  const handleDeleteFilter = (filterId: string) => {
    if (confirm('Are you sure you want to delete this quick filter?')) {
      onChange(quickFilters.filter((qf) => qf.filterId !== filterId));
    }
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
      CHECKBOX_YES_NO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      SELECT_ONE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      SELECT_LIST: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      SELECT_ONE_RECORD: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
      SELECT_LIST_RECORD: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
      SELECT_ONE_WORKSPACE_USER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      SELECT_LIST_WORKSPACE_USER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    };

    return (
      <Badge variant="outline" className={`text-xs ${colors[type] || ''}`}>
        {type}
      </Badge>
    );
  };

  return (
    <SettingsSection
      title="Quick Filters Configuration"
      description="Create quick filters for common queries displayed at the top of the list view"
      actions={
        <Button onClick={handleAddFilter} size="sm" disabled={availableFields.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Quick Filter
        </Button>
      }
    >
      <div className="space-y-4">
        {quickFilters.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No quick filters configured yet.{' '}
              {availableFields.length > 0
                ? 'Click "Add Quick Filter" to create your first filter.'
                : 'Add choice-based fields (SELECT, CHECKBOX, REFERENCE) to enable quick filters.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] rounded-md border">
            <div className="divide-y">
              {quickFilters.map((filter) => {
                const field = fields.find((f) => f.name === filter.fieldName);
                return (
                  <div
                    key={filter.filterId}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{filter.fieldLabel || filter.fieldName}</span>
                        {field && getFieldTypeBadge(field.type)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{filter.fieldName}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFilter(filter.filterId)}
                      className="text-destructive hover:text-destructive"
                      aria-label={`Delete filter ${filter.fieldLabel}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Statistics and Info */}
        <div className="space-y-2">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Active Filters: {quickFilters.length}</span>
            <span>Eligible Fields: {eligibleFields.length}</span>
            <span>Available: {availableFields.length}</span>
          </div>

          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Quick Filter Requirements</p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Only choice-based fields (SELECT, CHECKBOX, REFERENCE) can be used as quick filters. These filters will
              appear prominently at the top of the list view for easy access.
            </p>
          </div>
        </div>
      </div>

      {/* Add Filter Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Quick Filter</DialogTitle>
            <DialogDescription>Select a field to use as a quick filter in the list view</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-field">
                Field <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedFieldName} onValueChange={setSelectedFieldName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only eligible fields (SELECT, CHECKBOX, REFERENCE types) are shown
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmitFilter} disabled={!selectedFieldName}>
              Add Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
