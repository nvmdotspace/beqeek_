/**
 * Error Display Components
 *
 * Comprehensive error UI components for displaying API errors
 * Handles both controlled (4xx) and system (5xx) errors
 */

import { AlertCircle, WifiOff, ServerCrash, XCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ApiError } from '@/shared/api/api-error';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Props for inline error alert
 */
export interface ErrorAlertProps {
  error: Error | ApiError | string;
  className?: string;
  onRetry?: () => void;
}

/**
 * Inline Error Alert
 *
 * Compact error display for inline use (forms, sections, etc.)
 */
export function ErrorAlert({ error, className, onRetry }: ErrorAlertProps) {
  const apiError = error instanceof ApiError ? error : null;
  const title = apiError?.title || 'Error';
  const description = apiError?.description || (typeof error === 'string' ? error : error.message);

  const Icon = getErrorIcon(apiError);
  const variant = getErrorVariant(apiError);

  return (
    <Alert variant={variant} className={cn('flex items-start gap-4', className)}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
        {onRetry && apiError && (apiError.isServerError() || apiError.isNetworkError()) && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </Alert>
  );
}

/**
 * Props for full-page error card
 */
export interface ErrorCardProps {
  error: Error | ApiError | string;
  className?: string;
  onRetry?: () => void;
  onBack?: () => void;
  showDetails?: boolean;
}

/**
 * Full-Page Error Card
 *
 * Large error display for full-page error states
 */
export function ErrorCard({ error, className, onRetry, onBack, showDetails = false }: ErrorCardProps) {
  const apiError = error instanceof ApiError ? error : null;
  const title = apiError?.title || 'Error';
  const description = apiError?.description || (typeof error === 'string' ? error : error.message);

  const Icon = getErrorIcon(apiError);
  const colorClass = getErrorColorClass(apiError);

  return (
    <Card className={cn(colorClass, className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn('rounded-full p-2', getIconBgClass(apiError))}>
            <Icon className={cn('h-6 w-6', getIconColorClass(apiError))} />
          </div>
          <div>
            <CardTitle className={getTextColorClass(apiError)}>{title}</CardTitle>
            {apiError && <CardDescription>Error Code: {apiError.status}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{description}</p>

        {showDetails && apiError?.details !== undefined && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Technical Details</summary>
            <pre className="mt-2 rounded bg-muted p-3 overflow-auto">
              {typeof apiError.details === 'string' ? apiError.details : JSON.stringify(apiError.details, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
      {(onRetry || onBack) && (
        <CardFooter className="flex gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
          )}
          {onRetry && apiError && (apiError.isServerError() || apiError.isNetworkError()) && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Props for minimal error message
 */
export interface ErrorMessageProps {
  error: Error | ApiError | string;
  className?: string;
}

/**
 * Minimal Error Message
 *
 * Simple text-based error display for space-constrained areas
 */
export function ErrorMessage({ error, className }: ErrorMessageProps) {
  const apiError = error instanceof ApiError ? error : null;
  const message = apiError?.description || (typeof error === 'string' ? error : error.message);

  return (
    <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Helper: Get appropriate icon for error type
 */
function getErrorIcon(error: ApiError | null): typeof AlertCircle {
  if (!error) return AlertCircle;

  if (error.isNetworkError()) return WifiOff;
  if (error.isServerError()) return ServerCrash;
  return XCircle;
}

/**
 * Helper: Get Alert variant for error type
 */
function getErrorVariant(error: ApiError | null): 'default' | 'destructive' {
  if (!error) return 'destructive';
  if (error.isServerError() || error.isNetworkError()) return 'default';
  return 'destructive';
}

/**
 * Helper: Get card border color class
 */
function getErrorColorClass(error: ApiError | null): string {
  if (!error) return 'border-destructive';
  if (error.isNetworkError()) return 'border-yellow-500';
  if (error.isServerError()) return 'border-orange-500';
  return 'border-destructive';
}

/**
 * Helper: Get icon background color class
 */
function getIconBgClass(error: ApiError | null): string {
  if (!error) return 'bg-destructive/10';
  if (error.isNetworkError()) return 'bg-yellow-500/10';
  if (error.isServerError()) return 'bg-orange-500/10';
  return 'bg-destructive/10';
}

/**
 * Helper: Get icon color class
 */
function getIconColorClass(error: ApiError | null): string {
  if (!error) return 'text-destructive';
  if (error.isNetworkError()) return 'text-yellow-600';
  if (error.isServerError()) return 'text-orange-600';
  return 'text-destructive';
}

/**
 * Helper: Get text color class
 */
function getTextColorClass(error: ApiError | null): string {
  if (!error) return 'text-destructive';
  if (error.isNetworkError()) return 'text-yellow-700';
  if (error.isServerError()) return 'text-orange-700';
  return 'text-destructive';
}
