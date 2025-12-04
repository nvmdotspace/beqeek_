/**
 * GanttRangeFilter Component
 *
 * Date range filter for Gantt chart view
 * Supports: day, week, month, quarter ranges
 * Syncs state to URL for shareable links
 */

import { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
} from 'date-fns';
import { vi } from 'date-fns/locale';

import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Inline } from '@workspace/ui/components/primitives';

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
        start: startOfWeek(anchorDate, { weekStartsOn: 1 }), // Monday
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
      return format(range.start, 'dd/MM/yyyy', { locale: vi });
    case 'week':
      return `${format(range.start, 'dd/MM', { locale: vi })} - ${format(range.end, 'dd/MM/yyyy', { locale: vi })}`;
    case 'month':
      return format(range.start, 'MMMM yyyy', { locale: vi });
    case 'quarter':
      return `Q${Math.ceil((range.start.getMonth() + 1) / 3)} ${format(range.start, 'yyyy')}`;
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
    <Inline space="space-050" align="center" className={className}>
      <Calendar className="h-4 w-4 text-muted-foreground" />

      <Select value={rangeType} onValueChange={(v) => onRangeTypeChange(v as GanttRangeType)}>
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Inline space="space-025" align="center">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" className="h-8 min-w-[140px]" onClick={handleToday}>
          {rangeLabel}
        </Button>

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Inline>

      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleToday}>
        Hôm nay
      </Button>
    </Inline>
  );
}
