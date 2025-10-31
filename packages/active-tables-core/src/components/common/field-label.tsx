/**
 * FieldLabel Component
 *
 * Renders a label for form fields with optional required indicator
 */

import type { ReactNode } from 'react';

export interface FieldLabelProps {
  /** The field name/id this label is for */
  htmlFor?: string;
  /** Label text */
  children: ReactNode;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export function FieldLabel({ htmlFor, children, required = false, className = '' }: FieldLabelProps) {
  const baseClasses = 'block text-sm font-medium text-gray-700';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <label htmlFor={htmlFor} className={combinedClasses}>
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
}
