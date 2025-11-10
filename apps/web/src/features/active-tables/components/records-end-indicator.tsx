/**
 * RecordsEndIndicator Component
 *
 * Displays a friendly message when all records have been loaded
 * Prevents confusion about whether more content exists
 *
 * Features:
 * - Clear visual indicator
 * - Record count display
 * - "Back to top" button for long lists
 * - Accessibility support
 *
 * @see docs/BA/active-table-records-infinite-scroll-ux-review.md
 */

import { CheckCircle, ArrowUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export interface RecordsEndIndicatorProps {
  /**
   * Total number of records loaded
   */
  recordCount: number;

  /**
   * Show "Back to top" button
   * @default true for lists > 50 records
   */
  showBackToTop?: boolean;

  /**
   * Callback when "Back to top" is clicked
   */
  onBackToTop?: () => void;

  /**
   * Custom message
   * @default "You've reached the end"
   */
  message?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * End of list indicator component
 *
 * @example
 * ```tsx
 * {!hasNextPage && records.length > 0 && (
 *   <RecordsEndIndicator
 *     recordCount={records.length}
 *     onBackToTop={scrollToTop}
 *   />
 * )}
 * ```
 */
export function RecordsEndIndicator({
  recordCount,
  showBackToTop = recordCount > 50,
  onBackToTop,
  message = "You've reached the end",
  className = '',
}: RecordsEndIndicatorProps) {
  const handleBackToTop = () => {
    if (onBackToTop) {
      onBackToTop();
    } else {
      // Default: smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Success icon */}
      <div className="flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-muted-foreground/50" />
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {recordCount} {recordCount === 1 ? 'record' : 'records'} loaded
        </p>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToTop}
          className="mt-2 gap-2"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="h-4 w-4" />
          Back to top
        </Button>
      )}

      {/* Divider */}
      <div className="mt-4 h-px w-32 bg-border" />
    </div>
  );
}

/**
 * Compact version for mobile/card views
 */
export function RecordsEndIndicatorCompact({
  recordCount,
  showBackToTop = recordCount > 30,
  onBackToTop,
  message = "That's all!",
  className = '',
}: RecordsEndIndicatorProps) {
  const handleBackToTop = () => {
    if (onBackToTop) {
      onBackToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4" />
        <span>{message}</span>
      </div>

      <p className="text-xs text-muted-foreground/70">
        {recordCount} {recordCount === 1 ? 'record' : 'records'}
      </p>

      {showBackToTop && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToTop}
          className="mt-1 h-8 gap-1 text-xs"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="h-3 w-3" />
          Top
        </Button>
      )}
    </div>
  );
}
