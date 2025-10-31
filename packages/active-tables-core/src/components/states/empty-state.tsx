/**
 * EmptyState Component
 *
 * Displays when no records are found
 */

export interface EmptyStateProps {
  /** Empty state message */
  message?: string;
  /** Optional description */
  description?: string;
  /** Optional icon/illustration */
  icon?: React.ReactNode;
  /** Optional action button */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function EmptyState({
  message = 'No records found',
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}

      {!icon && (
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>

      {description && <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{description}</p>}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
