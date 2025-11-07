/**
 * Error Utility Functions
 *
 * Helper functions for handling and formatting errors
 */

import { ApiError } from '../api/api-error';

/**
 * Convert any error to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0, error);
  }

  if (typeof error === 'string') {
    return new ApiError(error, 0);
  }

  return new ApiError('An unknown error occurred', 0, error);
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  return apiError.description;
}

/**
 * Get error title from any error
 */
export function getErrorTitle(error: unknown): string {
  const apiError = toApiError(error);
  return apiError.title;
}

/**
 * Check if error should show retry button
 */
export function shouldShowRetry(error: unknown): boolean {
  const apiError = toApiError(error);
  return apiError.isServerError() || apiError.isNetworkError();
}

/**
 * Log error appropriately based on type
 */
export function logError(error: unknown, context?: string): void {
  const apiError = toApiError(error);

  const prefix = context ? `[${context}]` : '';
  const logMessage = `${prefix} ${apiError.toLogString()}`;

  // Only log to console in development or for server errors
  if (import.meta.env.DEV || apiError.isServerError()) {
    console.error(logMessage, {
      status: apiError.status,
      type: apiError.type,
      details: apiError.details,
    });
  }

  // In production, you might want to send errors to a logging service
  // sendToLoggingService(apiError, context);
}

/**
 * Format error for toast notifications
 */
export function formatErrorForToast(error: unknown): {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
} {
  const apiError = toApiError(error);

  return {
    title: apiError.title,
    description: apiError.description,
    variant: apiError.isClientError() ? 'destructive' : 'default',
  };
}

/**
 * Check if error is a specific HTTP status
 */
export function isHttpStatus(error: unknown, status: number): boolean {
  const apiError = toApiError(error);
  return apiError.status === status;
}

/**
 * Check if error is permission/forbidden error
 */
export function isForbiddenError(error: unknown): boolean {
  return isHttpStatus(error, 403);
}

/**
 * Check if error is not found error
 */
export function isNotFoundError(error: unknown): boolean {
  return isHttpStatus(error, 404);
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  return isHttpStatus(error, 401);
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  return isHttpStatus(error, 422) || isHttpStatus(error, 400);
}
