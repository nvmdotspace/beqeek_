/**
 * GanttRangeFilter Component
 *
 * Date range filter for Gantt chart view following Beqeek Design System.
 * Features:
 * - Segmented control for range type selection (day/week/month/quarter)
 * - Navigation buttons with cohesive button group styling
 * - "Today" quick action button
 *
 * @see docs/design-system.md
 */

import { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from 'date-fns';
import { vi } from 'date-fns/locale';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

export type GanttRangeType = 'day' | 'week' | 'month' | 'quarter';

export interface GanttDateRange {
  start: Date;
  end: Date;
}

export interface GanttRangeFilterProps {
  /** Current range type */
  rangeType: GanttRangeType;
  /** Anchor date for the range */
  anchorDate: Date;
  /** Callback when range type changes */
  onRangeTypeChange: (type: GanttRangeType) => void;
  /** Callback when anchor date changes (prev/next/today) */
  onAnchorDateChange: (date: Date) => void;
  /** Optional class name */
  className?: string;
}

const RANGE_OPTIONS: { value: GanttRangeType; label: string }[] = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
];

/**
 * Calculate date range based on type and anchor date
 */
export function calculateDateRange(rangeType: GanttRangeType, anchorDate: Date): GanttDateRange {
  switch (rangeType) {
    case 'day':
      return {
        start: startOfDay(anchorDate),
        end: endOfDay(anchorDate),
      };
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

/**
 * Navigate to previous/next period
 */
function navigateDate(rangeType: GanttRangeType, anchorDate: Date, direction: 'prev' | 'next'): Date {
  const delta = direction === 'next' ? 1 : -1;

  switch (rangeType) {
    case 'day':
      return addDays(anchorDate, delta);
    case 'week':
      return addWeeks(anchorDate, delta);
    case 'month':
      return addMonths(anchorDate, delta);
    case 'quarter':
      return addQuarters(anchorDate, delta);
  }
}

/**
 * Format range label for display
 */
function formatRangeLabel(rangeType: GanttRangeType, anchorDate: Date): string {
  const range = calculateDateRange(rangeType, anchorDate);

  switch (rangeType) {
    case 'day':
      return format(range.start, 'dd MMM yyyy', { locale: vi });
    case 'week': {
      const startMonth = format(range.start, 'MMM', { locale: vi });
      const endMonth = format(range.end, 'MMM', { locale: vi });
      if (startMonth === endMonth) {
        return `${format(range.start, 'dd', { locale: vi })} - ${format(range.end, 'dd MMM yyyy', { locale: vi })}`;
      }
      return `${format(range.start, 'dd MMM', { locale: vi })} - ${format(range.end, 'dd MMM yyyy', { locale: vi })}`;
    }
    case 'month':
      return format(range.start, 'MMMM yyyy', { locale: vi });
    case 'quarter':
      return `Q${Math.ceil((range.start.getMonth() + 1) / 3)} ${format(range.start, 'yyyy')}`;
  }
}

/**
 * Check if current range includes today
 */
function isCurrentPeriod(rangeType: GanttRangeType, anchorDate: Date): boolean {
  const today = new Date();
  switch (rangeType) {
    case 'day':
      return isSameDay(anchorDate, today);
    case 'week':
      return isSameWeek(anchorDate, today, { weekStartsOn: 1 });
    case 'month':
      return isSameMonth(anchorDate, today);
    case 'quarter':
      return startOfQuarter(anchorDate).getTime() === startOfQuarter(today).getTime();
  }
}

export function GanttRangeFilter({
  rangeType,
  anchorDate,
  onRangeTypeChange,
  onAnchorDateChange,
  className,
}: GanttRangeFilterProps) {
  const rangeLabel = useMemo(() => formatRangeLabel(rangeType, anchorDate), [rangeType, anchorDate]);
  const isCurrent = useMemo(() => isCurrentPeriod(rangeType, anchorDate), [rangeType, anchorDate]);

  const handlePrev = useCallback(() => {
    onAnchorDateChange(navigateDate(rangeType, anchorDate, 'prev'));
  }, [rangeType, anchorDate, onAnchorDateChange]);

  const handleNext = useCallback(() => {
    onAnchorDateChange(navigateDate(rangeType, anchorDate, 'next'));
  }, [rangeType, anchorDate, onAnchorDateChange]);

  const handleToday = useCallback(() => {
    onAnchorDateChange(new Date());
  }, [onAnchorDateChange]);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Segmented Control for Range Type */}
      <div className="inline-flex items-center rounded-md border border-input bg-muted p-0.5">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onRangeTypeChange(opt.value)}
            className={cn(
              'px-3 py-1 text-sm font-medium rounded-sm transition-all',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              rangeType === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Navigation Group */}
      <div className="inline-flex items-center rounded-md border border-input">
        {/* Prev Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-r-none border-r border-input p-0 hover:bg-muted"
          onClick={handlePrev}
          aria-label="Kỳ trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Date Label */}
        <button
          type="button"
          onClick={handleToday}
          className={cn(
            'h-8 px-3 text-sm font-medium min-w-[160px]',
            'hover:bg-muted transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
          )}
        >
          {rangeLabel}
        </button>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-l-none border-l border-input p-0 hover:bg-muted"
          onClick={handleNext}
          aria-label="Kỳ sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Today Button - only show when not on current period */}
      {!isCurrent && (
        <Button variant="outline" size="sm" className="h-8" onClick={handleToday}>
          Hôm nay
        </Button>
      )}
    </div>
  );
}
