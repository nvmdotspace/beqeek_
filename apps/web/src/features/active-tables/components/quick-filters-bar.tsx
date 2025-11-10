/**
 * Quick Filters Bar Component
 *
 * Displays a sticky filter bar with quick filter controls for choice-based fields.
 * Based on active-table-config-functional-spec.md section 2.6
 */

import { useMemo } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import type { Table, QuickFilterConfig, FieldConfig, FieldOption } from '@workspace/active-tables-core';
import { QUICK_FILTER_VALID_FIELD_TYPES } from '@workspace/beqeek-shared';

export interface QuickFilterValue {
  fieldName: string;
  value: string | string[];
}

export interface QuickFiltersBarProps {
  table: Table;
  filters: QuickFilterValue[];
  onFilterChange: (filters: QuickFilterValue[]) => void;
  className?: string;
}

/**
 * Check if a field is valid for quick filters
 */
function isValidQuickFilterField(field: FieldConfig): boolean {
  return QUICK_FILTER_VALID_FIELD_TYPES.includes(field.type as any);
}

/**
 * Get filter options for a field
 */
function getFilterOptions(field: FieldConfig): FieldOption[] {
  if (field.options) {
    return field.options;
  }
  return [];
}

/**
 * QuickFiltersBar Component
 */
export function QuickFiltersBar({ table, filters, onFilterChange, className = '' }: QuickFiltersBarProps) {
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

  const handleFilterChange = (fieldName: string, value: string | null) => {
    const newFilters = filters.filter((f) => f.fieldName !== fieldName);

    if (value && value !== 'all') {
      newFilters.push({
        fieldName,
        value,
      });
    }

    onFilterChange(newFilters);
  };

  const getFilterValue = (fieldName: string): string => {
    const filter = filters.find((f) => f.fieldName === fieldName);
    if (!filter) return 'all';

    if (Array.isArray(filter.value)) {
      return filter.value[0] || 'all';
    }

    return filter.value || 'all';
  };

  // Get display text for current filter value
  const getFilterDisplayText = (field: FieldConfig, currentValue: string): string => {
    if (currentValue === 'all') {
      return `All ${field.label || field.name}`;
    }

    const options = getFilterOptions(field);
    const option = options.find((opt) => String(opt.value) === currentValue);
    return option?.text || currentValue;
  };

  const hasActiveFilters = filters.length > 0;

  return (
    <div
      className={`
        sticky top-0 z-10
        bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
        border-b border-border
        ${className}
      `}
    >
      <div className="px-3 sm:px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground shrink-0">Quick Filters:</span>

          <div className="flex items-center gap-2 flex-wrap flex-1">
            {quickFilterFields.map((field) => {
              const currentValue = getFilterValue(field.name);
              const options = getFilterOptions(field);
              const isActive = currentValue !== 'all';

              const displayText = getFilterDisplayText(field, currentValue);

              return (
                <div key={field.name} className="flex items-center gap-1.5">
                  <Select value={currentValue} onValueChange={(value) => handleFilterChange(field.name, value)}>
                    <SelectTrigger
                      className={`
                        h-8 text-xs
                        min-w-[160px] max-w-[280px]
                        ${isActive ? 'border-primary' : ''}
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
                      {options.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
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
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Filters Count */}
        {hasActiveFilters && (
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] h-5">
              {filters.length} {filters.length === 1 ? 'filter' : 'filters'} active
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
