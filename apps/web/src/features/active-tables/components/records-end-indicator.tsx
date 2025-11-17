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
import { Stack, Inline } from '@workspace/ui/components/primitives';

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
    <Stack space="space-075" align="center" className={`py-8 ${className}`} role="status" aria-live="polite">
      {/* Success icon */}
      <Inline align="center" justify="center">
        <CheckCircle className="h-8 w-8 text-muted-foreground/50" />
      </Inline>

      {/* Message */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {recordCount} {recordCount === 1 ? 'record' : 'records'} loaded
        </p>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <Button variant="outline" size="sm" onClick={handleBackToTop} className="mt-2" aria-label="Scroll back to top">
          <Inline space="space-050" align="center">
            <ArrowUp className="h-4 w-4" />
            Back to top
          </Inline>
        </Button>
      )}

      {/* Divider */}
      <div className="mt-4 h-px w-32 bg-border" />
    </Stack>
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
    <Stack space="space-050" align="center" className={`py-6 ${className}`} role="status" aria-live="polite">
      <Inline space="space-050" align="center" className="text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4" />
        <span>{message}</span>
      </Inline>

      <p className="text-xs text-muted-foreground/70">
        {recordCount} {recordCount === 1 ? 'record' : 'records'}
      </p>

      {showBackToTop && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToTop}
          className="mt-1 h-8 text-xs"
          aria-label="Scroll back to top"
        >
          <Inline space="space-025" align="center">
            <ArrowUp className="h-3 w-3" />
            Top
          </Inline>
        </Button>
      )}
    </Stack>
  );
}
