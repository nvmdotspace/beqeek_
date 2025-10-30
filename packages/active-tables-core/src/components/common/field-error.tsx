/**
 * FieldError Component
 *
 * Renders error messages for form fields
 */

export interface FieldErrorProps {
  /** Error message to display */
  error?: string;
  /** Additional CSS class names */
  className?: string;
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null;

  const baseClasses = 'text-sm text-red-600 mt-1';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <p className={combinedClasses} role="alert">
      {error}
    </p>
  );
}
