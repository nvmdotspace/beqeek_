/**
 * GanttRangeFilter Component
 *
 * Date range filter for Gantt chart view following Beqeek Design System.
 * Uses shadcn Tabs component for accessible segmented control.
 *
 * Design references:
 * - shadcn/ui Tabs: https://ui.shadcn.com/docs/components/tabs
 * - Monday.com Gantt: zoom levels (day/week/month/year)
 * - Wrike Gantt: date range navigation with prev/next
 *
 * @see docs/design-system.md
 */

import { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
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

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
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
    <div className={cn('flex items-center gap-2', className)}>
      {/* Zoom Level Tabs - using shadcn Tabs for accessibility */}
      <Tabs value={rangeType} onValueChange={(v) => onRangeTypeChange(v as GanttRangeType)}>
        <TabsList className="h-8">
          {RANGE_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value} className="h-7 px-3 text-xs">
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Date Navigation - compact button group */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-r-none"
          onClick={handlePrev}
          aria-label="Kỳ trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className={cn('h-8 min-w-[140px] rounded-none border-x-0 font-medium', isCurrent && 'text-primary')}
          onClick={handleToday}
          aria-label="Về hôm nay"
        >
          {rangeLabel}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-l-none"
          onClick={handleNext}
          aria-label="Kỳ sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Today Quick Action - only show when navigated away */}
      {!isCurrent && (
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleToday}>
          <CalendarDays className="h-3.5 w-3.5" />
          Hôm nay
        </Button>
      )}
    </div>
  );
}
