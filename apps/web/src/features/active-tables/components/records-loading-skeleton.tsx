/**
 * RecordsLoadingSkeleton Component
 *
 * Loading skeleton for records while fetching next page
 * Matches the record list layout for smooth loading experience
 *
 * Features:
 * - Matches table row height
 * - Pulsing animation
 * - Accessible loading announcement
 * - Configurable row count
 *
 * @see docs/BA/active-table-records-infinite-scroll-ux-review.md
 */

import { Skeleton } from '@workspace/ui/components/skeleton';

export interface RecordsLoadingSkeletonProps {
  /**
   * Number of skeleton rows to display
   * @default 3
   */
  rowCount?: number;

  /**
   * Number of columns per row
   * @default 5
   */
  columnCount?: number;

  /**
   * Loading message for screen readers
   * @default 'Loading more records...'
   */
  message?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Loading skeleton for table records
 *
 * @example
 * ```tsx
 * {isFetchingNextPage && (
 *   <RecordsLoadingSkeleton rowCount={3} columnCount={5} />
 * )}
 * ```
 */
export function RecordsLoadingSkeleton({
  rowCount = 3,
  columnCount = 5,
  message = 'Loading more records...',
  className = '',
}: RecordsLoadingSkeletonProps) {
  return (
    <div className={`w-full ${className}`} role="status" aria-busy="true">
      {/* Screen reader announcement */}
      <span className="sr-only">{message}</span>

      {/* Skeleton rows */}
      <div className="rounded-md border border-border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b transition-colors hover:bg-muted/50">
                  {Array.from({ length: columnCount }).map((_, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading indicator text */}
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>{message}</span>
      </div>
    </div>
  );
}

/**
 * Compact loading skeleton for mobile/card views
 */
export function RecordsLoadingSkeletonCompact({
  rowCount = 3,
  message = 'Loading more records...',
  className = '',
}: Omit<RecordsLoadingSkeletonProps, 'columnCount'>) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-busy="true">
      {/* Screen reader announcement */}
      <span className="sr-only">{message}</span>

      {/* Skeleton cards */}
      {Array.from({ length: rowCount }).map((_, index) => (
        <div key={index} className="bg-card text-card-foreground rounded-lg border border-border p-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}

      {/* Loading indicator text */}
      <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>{message}</span>
      </div>
    </div>
  );
}
