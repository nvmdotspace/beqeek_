/**
 * GanttRangeFilter Component
 *
 * Date range filter for Gantt chart view.
 * Uses Tabs component for consistent UI with Kanban view config selector.
 *
 * @see docs/design-system.md
 */

import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

export type GanttRangeType = 'week' | 'month' | 'quarter';

export interface GanttDateRange {
  start: Date;
  end: Date;
}

export interface GanttRangeFilterProps {
  /** Current range type */
  rangeType: GanttRangeType;
  /** Callback when range type changes */
  onRangeTypeChange: (type: GanttRangeType) => void;
  /** Optional class name */
  className?: string;
}

const RANGE_OPTIONS: { value: GanttRangeType; label: string }[] = [
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
];

/**
 * Calculate date range based on type (always uses current date)
 */
export function calculateDateRange(rangeType: GanttRangeType, anchorDate: Date = new Date()): GanttDateRange {
  switch (rangeType) {
    case 'week':
      return {
        start: startOfWeek(anchorDate, { weekStartsOn: 1 }),
        end: endOfWeek(anchorDate, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(anchorDate),
        end: endOfMonth(anchorDate),
      };
    case 'quarter':
      return {
        start: startOfQuarter(anchorDate),
        end: endOfQuarter(anchorDate),
      };
  }
}

export function GanttRangeFilter({ rangeType, onRangeTypeChange, className }: GanttRangeFilterProps) {
  return (
    <div className={className}>
      <Tabs value={rangeType} onValueChange={(v) => onRangeTypeChange(v as GanttRangeType)}>
        <TabsList className="w-full sm:w-auto">
          {RANGE_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value} className="flex-1 sm:flex-initial text-xs sm:text-sm">
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
