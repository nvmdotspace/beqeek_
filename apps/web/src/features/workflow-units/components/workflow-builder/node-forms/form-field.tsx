/**
 * FormField - Reusable form field component
 *
 * Provides consistent styling and structure for node config forms.
 * Follows design system tokens for inputs.
 */

import type { ReactNode } from 'react';
import { Label } from '@workspace/ui/components/label';
import { cn } from '@workspace/ui/lib/utils';

interface FormFieldProps {
  /** Field label */
  label: string;
  /** Unique ID for accessibility */
  htmlFor: string;
  /** Optional help text below input */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Input element(s) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function FormField({ label, htmlFor, description, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {children}

      {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
