/**
 * Quick Filters Bar Component
 *
 * Displays a sticky filter bar with quick filter controls for choice-based fields.
 * Based on active-table-config-functional-spec.md section 2.6
 */

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@workspace/ui/components/command';
import type { Table, QuickFilterConfig, FieldConfig, FieldOption } from '@workspace/active-tables-core';
import { QUICK_FILTER_VALID_FIELD_TYPES } from '@workspace/beqeek-shared';
import { cn } from '@workspace/ui/lib/utils';

export interface QuickFilterValue {
  fieldName: string;
  value: string | string[];
}

export interface WorkspaceUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface QuickFiltersBarProps {
  table: Table;
  filters: QuickFilterValue[];
  onFilterChange: (filters: QuickFilterValue[]) => void;
  workspaceUsers?: WorkspaceUser[];
  className?: string;
}

/**
 * Check if a field is valid for quick filters
 */
function isValidQuickFilterField(field: FieldConfig): boolean {
  return QUICK_FILTER_VALID_FIELD_TYPES.includes(field.type as any);
}

/**
 * Check if field supports multi-select
 */
function isMultiSelectField(field: FieldConfig): boolean {
  return field.type === 'SELECT_LIST' || field.type === 'SELECT_LIST_WORKSPACE_USER';
}

/**
 * Get filter options for a field
 * Supports both regular options and workspace user fields
 */
function getFilterOptions(field: FieldConfig, workspaceUsers?: WorkspaceUser[]): FieldOption[] {
  // Regular fields with options
  if (field.options) {
    return field.options;
  }

  // Workspace user fields - convert users to options format
  if (
    (field.type === 'SELECT_ONE_WORKSPACE_USER' || field.type === 'SELECT_LIST_WORKSPACE_USER') &&
    workspaceUsers &&
    workspaceUsers.length > 0
  ) {
    return workspaceUsers.map((user) => ({
      value: user.id,
      text: user.name,
      background_color: undefined,
      text_color: undefined,
    }));
  }

  return [];
}

/**
 * QuickFiltersBar Component
 */
export function QuickFiltersBar({
  table,
  filters,
  onFilterChange,
  workspaceUsers,
  className = '',
}: QuickFiltersBarProps) {
  // Get configured quick filters from table config
  const quickFilterConfigs = table.config?.quickFilters || [];

  // Get field configs for quick filters
  const quickFilterFields = useMemo(() => {
    return quickFilterConfigs
      .map((qf: QuickFilterConfig) => {
        const field = table.config.fields.find((f) => f.name === qf.fieldName);
        if (!field || !isValidQuickFilterField(field)) {
          return null;
        }
        return field;
      })
      .filter((f): f is FieldConfig => f !== null);
  }, [quickFilterConfigs, table.config.fields]);

  if (quickFilterFields.length === 0) {
    return null;
  }

  const handleFilterChange = (fieldName: string, value: string | string[] | null) => {
    const newFilters = filters.filter((f) => f.fieldName !== fieldName);

    if (value && value !== 'all') {
      // For multi-select, check if array has values
      if (Array.isArray(value) && value.length === 0) {
        // Empty array means clear filter
      } else {
        newFilters.push({
          fieldName,
          value,
        });
      }
    }

    onFilterChange(newFilters);
  };

  const getFilterValue = (fieldName: string): string | string[] => {
    const filter = filters.find((f) => f.fieldName === fieldName);
    if (!filter) return 'all';

    if (Array.isArray(filter.value)) {
      return filter.value.length > 0 ? filter.value : 'all';
    }

    return filter.value || 'all';
  };

  const toggleMultiSelectOption = (fieldName: string, optionValue: string) => {
    const currentFilter = filters.find((f) => f.fieldName === fieldName);
    const currentValues = Array.isArray(currentFilter?.value) ? currentFilter.value : [];

    let newValues: string[];
    if (currentValues.includes(optionValue)) {
      // Remove value
      newValues = currentValues.filter((v) => v !== optionValue);
    } else {
      // Add value
      newValues = [...currentValues, optionValue];
    }

    handleFilterChange(fieldName, newValues.length > 0 ? newValues : null);
  };

  // Get display text for current filter value
  const getFilterDisplayText = (field: FieldConfig, currentValue: string): string => {
    if (currentValue === 'all') {
      return `All ${field.label || field.name}`;
    }

    const options = getFilterOptions(field, workspaceUsers);
    const option = options.find((opt) => String(opt.value) === currentValue);
    return option?.text || currentValue;
  };

  const hasActiveFilters = filters.length > 0;

  const handleClearAll = () => {
    onFilterChange([]);
  };

  return (
    <div
      role="region"
      aria-label="Quick filters"
      className={`
        sticky top-0 z-10
        bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
        border-b border-border
        ${className}
      `}
    >
      <div className="px-3 sm:px-6 py-3">
        {/* Header with Clear All button */}
        <div className="flex items-center justify-between mb-2">
          <span id="quick-filters-heading" className="text-sm font-medium text-muted-foreground shrink-0">
            Quick Filters:
          </span>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              aria-label={`Clear all ${filters.length} filters`}
            >
              Clear All ({filters.length})
            </Button>
          )}

          {/* Screen reader live region */}
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {hasActiveFilters
              ? `${filters.length} ${filters.length === 1 ? 'filter' : 'filters'} active`
              : 'No filters active'}
          </div>
        </div>

        {/* Filter controls */}
        <div role="group" aria-labelledby="quick-filters-heading" className="flex items-center gap-2 flex-wrap">
          {quickFilterFields.map((field) => {
            const currentValue = getFilterValue(field.name);
            const options = getFilterOptions(field, workspaceUsers);
            const isMultiSelect = isMultiSelectField(field);
            const isActive = currentValue !== 'all';

            // For multi-select
            if (isMultiSelect) {
              const selectedValues = Array.isArray(currentValue) ? currentValue : [];
              const selectedCount = selectedValues.length;

              return (
                <div key={field.name} className="flex items-center gap-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-label={`Filter by ${field.label || field.name}`}
                        className={cn(
                          'flex justify-between min-w-[160px] max-w-[280px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                          isActive ? 'border-primary bg-primary/5 font-medium' : '',
                        )}
                      >
                        <span className="truncate">
                          {selectedCount === 0
                            ? `All ${field.label || field.name}`
                            : `${field.label || field.name} (${selectedCount})`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder={`Search ${field.label || field.name}...`} className="h-9" />
                        <CommandList>
                          <CommandEmpty>No options found.</CommandEmpty>
                          <CommandGroup>
                            {options.map((option) => {
                              const isSelected = selectedValues.includes(String(option.value));
                              return (
                                <CommandItem
                                  key={option.value}
                                  onSelect={() => toggleMultiSelectOption(field.name, String(option.value))}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Checkbox checked={isSelected} className="shrink-0" />
                                    {option.background_color && (
                                      <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: option.background_color }}
                                      />
                                    )}
                                    <span className="truncate">{option.text}</span>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            } else {
              // For single-select
              const displayText = getFilterDisplayText(field, currentValue as string);

              return (
                <div key={field.name} className="flex items-center gap-1.5">
                  <Select
                    value={currentValue as string}
                    onValueChange={(value) => handleFilterChange(field.name, value)}
                  >
                    <SelectTrigger
                      aria-label={`Filter by ${field.label || field.name}`}
                      className={`
                          min-w-[160px] max-w-[280px]
                          ${isActive ? 'border-primary bg-primary/5 font-medium' : ''}
                        `}
                    >
                      <SelectValue placeholder={field.label || field.name}>
                        <span className="truncate" title={displayText}>
                          {displayText}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-w-[320px]">
                      <SelectItem value="all">All {field.label || field.name}</SelectItem>
                      {options.map((option) => {
                        const isSelected = currentValue === String(option.value);
                        return (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                            className={isSelected ? 'bg-accent font-medium' : ''}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {option.background_color && (
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: option.background_color }}
                                />
                              )}
                              <span className="truncate" title={option.text}>
                                {option.text}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
          })}
        </div>

        {/* Active Filters Count Badge */}
        {hasActiveFilters && (
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs h-5">
              {filters.length} {filters.length === 1 ? 'filter' : 'filters'} active
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
