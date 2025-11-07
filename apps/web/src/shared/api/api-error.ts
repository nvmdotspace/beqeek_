/**
 * API Error Classification
 */
export type ApiErrorType = 'client' | 'server' | 'network' | 'unknown';

/**
 * Enhanced API Error with type classification and user-friendly messages
 */
export class ApiError extends Error {
  /** HTTP status code */
  status: number;

  /** Error type classification */
  type: ApiErrorType;

  /** Raw error details from backend */
  details?: unknown;

  /** User-friendly error title */
  title: string;

  /** User-friendly error description */
  description: string;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;

    // Classify error type based on status code
    this.type = this.classifyErrorType(status);

    // Generate user-friendly messages
    const { title, description } = this.generateUserMessages(message, status);
    this.title = title;
    this.description = description;
  }

  /**
   * Classify error type based on HTTP status code
   */
  private classifyErrorType(status: number): ApiErrorType {
    if (status === 0) return 'network';
    if (status >= 400 && status < 500) return 'client';
    if (status >= 500) return 'server';
    return 'unknown';
  }

  /**
   * Generate user-friendly error messages
   */
  private generateUserMessages(message: string, status: number): { title: string; description: string } {
    // For 4xx errors (client errors), use the message from backend
    if (status >= 400 && status < 500) {
      return {
        title: this.getClientErrorTitle(status),
        description: message, // Use backend message directly for controlled errors
      };
    }

    // For 5xx errors (server errors), use generic friendly message
    if (status >= 500) {
      return {
        title: 'Server Error',
        description:
          'An unexpected error occurred on our servers. Please try again later or contact support if the problem persists.',
      };
    }

    // For network errors
    if (status === 0) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection and try again.',
      };
    }

    // Default fallback
    return {
      title: 'Error',
      description: message || 'An unexpected error occurred. Please try again.',
    };
  }

  /**
   * Get appropriate title for client errors
   */
  private getClientErrorTitle(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid Request';
      case 401:
        return 'Authentication Required';
      case 403:
        return 'Access Denied';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Validation Error';
      case 429:
        return 'Too Many Requests';
      default:
        return 'Request Error';
    }
  }

  /**
   * Check if error is a controlled client error (4xx)
   */
  isClientError(): boolean {
    return this.type === 'client';
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.type === 'server';
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.type === 'network';
  }

  /**
   * Get formatted error for logging
   */
  toLogString(): string {
    return `[${this.type.toUpperCase()}] ${this.status}: ${this.message}`;
  }
}
