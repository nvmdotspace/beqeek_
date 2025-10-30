/**
 * FieldWrapper Component
 *
 * Common wrapper for all field components that includes label and error handling
 */

import type { ReactNode } from 'react';
import { FieldLabel } from './field-label.js';
import { FieldError } from './field-error.js';

export interface FieldWrapperProps {
  /** Field identifier */
  fieldId?: string;
  /** Label text */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** The actual field input component */
  children: ReactNode;
  /** Additional CSS class names for the wrapper */
  className?: string;
  /** Additional CSS class names for the field container */
  fieldClassName?: string;
}

export function FieldWrapper({
  fieldId,
  label,
  required = false,
  error,
  children,
  className = '',
  fieldClassName = '',
}: FieldWrapperProps) {
  const wrapperClasses = className || 'mb-4';
  const fieldContainerClasses = fieldClassName || 'mt-1';

  return (
    <div className={wrapperClasses}>
      {label && (
        <FieldLabel htmlFor={fieldId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div className={fieldContainerClasses}>
        {children}
      </div>
      <FieldError error={error} />
    </div>
  );
}
