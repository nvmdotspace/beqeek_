/**
 * ErrorState Component
 *
 * Displays error message with optional retry action
 */

export interface ErrorStateProps {
  /** Error message */
  message?: string;
  /** Error details/description */
  details?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ErrorState({
  message = 'Something went wrong',
  details,
  onRetry,
  retryText = 'Try again',
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <svg
        className="w-16 h-16 text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>

      {details && (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
          {details}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}
