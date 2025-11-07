/**
 * Error Boundary Component
 *
 * Catches React errors and displays user-friendly error UI
 * Integrates with error logging and reporting
 */

import { Component, ReactNode } from 'react';
import { ErrorCard } from './error-display';
import { toApiError, logError } from '@/shared/utils/error-utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary
 *
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error
    logError(error, 'ErrorBoundary');

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send to error reporting service
    // sendErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      const apiError = toApiError(this.state.error);

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <ErrorCard error={apiError} onRetry={this.handleReset} showDetails={import.meta.env.DEV} />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
