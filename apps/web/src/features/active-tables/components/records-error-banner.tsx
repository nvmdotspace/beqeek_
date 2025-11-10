/**
 * RecordsErrorBanner Component
 *
 * Displays error messages when loading more records fails
 * Provides retry functionality and clear error messaging
 *
 * Features:
 * - Clear error display
 * - Retry button
 * - Auto-dismissible
 * - Accessibility support
 *
 * @see docs/BA/active-table-records-infinite-scroll-ux-review.md
 */

import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';

export interface RecordsErrorBannerProps {
  /**
   * Error object or message
   */
  error: Error | string | null;

  /**
   * Callback when retry is clicked
   */
  onRetry?: () => void;

  /**
   * Callback when dismiss is clicked
   */
  onDismiss?: () => void;

  /**
   * Whether currently retrying
   * @default false
   */
  isRetrying?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Error banner for failed record loading
 *
 * @example
 * ```tsx
 * {error && (
 *   <RecordsErrorBanner
 *     error={error}
 *     onRetry={fetchNextPage}
 *     onDismiss={() => setError(null)}
 *   />
 * )}
 * ```
 */
export function RecordsErrorBanner({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = '',
}: RecordsErrorBannerProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';

  return (
    <div className={`w-full py-4 ${className}`} role="alert" aria-live="assertive">
      <Alert variant="destructive" className="relative">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load more records</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-3">
          <p className="text-sm">{errorMessage}</p>

          <div className="flex items-center gap-2">
            {/* Retry button */}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="gap-2 bg-background hover:bg-accent"
              >
                <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try again'}
              </Button>
            )}

            {/* Dismiss button */}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} className="gap-2" aria-label="Dismiss error">
                <X className="h-3 w-3" />
                Dismiss
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Compact error banner for mobile views
 */
export function RecordsErrorBannerCompact({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = '',
}: RecordsErrorBannerProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';

  return (
    <div className={`w-full px-3 py-3 ${className}`} role="alert" aria-live="assertive">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
          <div className="flex-1 space-y-2">
            <p className="text-xs font-medium text-destructive">Failed to load more</p>
            <p className="text-xs text-destructive/80">{errorMessage}</p>

            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-1 text-xs font-medium text-destructive underline-offset-4 hover:underline disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
              )}

              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center gap-1 text-xs text-destructive/60 hover:text-destructive"
                  aria-label="Dismiss error"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
