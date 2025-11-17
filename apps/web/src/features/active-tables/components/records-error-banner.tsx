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
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';

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
    <Box className={`w-full py-4 ${className}`} role="alert" aria-live="assertive">
      <Alert variant="destructive" className="relative">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load more records</AlertTitle>
        <AlertDescription>
          <Stack space="space-075" className="mt-2">
            <p className="text-sm">{errorMessage}</p>

            <Inline space="space-050" align="center">
              {/* Retry button */}
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="bg-background hover:bg-accent"
                >
                  <Inline space="space-050" align="center">
                    <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : 'Try again'}
                  </Inline>
                </Button>
              )}

              {/* Dismiss button */}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss error">
                  <Inline space="space-050" align="center">
                    <X className="h-3 w-3" />
                    Dismiss
                  </Inline>
                </Button>
              )}
            </Inline>
          </Stack>
        </AlertDescription>
      </Alert>
    </Box>
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
    <Box padding="space-075" className={`w-full ${className}`} role="alert" aria-live="assertive">
      <Box padding="space-075" border="default" borderRadius="lg" className="border-destructive bg-destructive/10">
        <Inline space="space-050" align="start">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
          <Stack space="space-050" className="flex-1">
            <p className="text-xs font-medium text-destructive">Failed to load more</p>
            <p className="text-xs text-destructive/80">{errorMessage}</p>

            <Inline space="space-050" align="center">
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
            </Inline>
          </Stack>
        </Inline>
      </Box>
    </Box>
  );
}
