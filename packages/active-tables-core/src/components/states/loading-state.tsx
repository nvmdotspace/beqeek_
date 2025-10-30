/**
 * LoadingState Component
 *
 * Displays loading indicator
 */

export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Loading type: spinner, skeleton, or bars */
  type?: 'spinner' | 'skeleton' | 'bars';
  /** Size of loader */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  type = 'spinner',
  size = 'md',
  className = '',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'bars') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} w-2 bg-blue-500 rounded-full animate-bounce`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
        role="status"
        aria-label={message}
      />
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
