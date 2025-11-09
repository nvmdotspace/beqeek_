/**
 * Settings Footer Component
 *
 * Provides Save, Cancel, and Reset buttons for settings forms.
 */

import { Save, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import type { ValidationError } from '../../utils/settings-validation';

export interface SettingsFooterProps {
  /** Whether there are unsaved changes */
  isDirty: boolean;

  /** Whether save operation is in progress */
  isSaving: boolean;

  /** Callback when save button is clicked */
  onSave: () => void;

  /** Callback when cancel button is clicked */
  onCancel: () => void;

  /** Whether to disable all buttons */
  disabled?: boolean;

  /** Validation errors to display */
  validationErrors?: ValidationError[];
}

/**
 * Settings Footer
 *
 * Sticky footer with action buttons for saving, canceling, and resetting changes.
 * Buttons are disabled when appropriate and show loading states.
 * Displays validation errors when present.
 */
export function SettingsFooter({
  isDirty,
  isSaving,
  onSave,
  onCancel,
  disabled,
  validationErrors = [],
}: SettingsFooterProps) {
  const hasErrors = validationErrors.length > 0;
  const canSave = isDirty && !hasErrors && !disabled;

  return (
    <div className="space-y-3">
      {/* Validation Errors */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">Please fix the following errors before saving:</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasErrors && <span className="text-destructive">Cannot save - validation errors present</span>}
          {!hasErrors && isDirty && !isSaving && <span>{m.settings_header_unsaved()}</span>}
          {isSaving && <span>{m.settings_footer_saving()}</span>}
          {!hasErrors && !isDirty && !isSaving && <span>{m.settings_save_success()}</span>}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={disabled || isSaving}
            aria-label={m.settings_footer_cancel()}
          >
            <X className="mr-2 h-4 w-4" />
            {m.settings_footer_cancel()}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={!canSave || isSaving}
            aria-label={m.settings_footer_save()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {m.settings_footer_saving()}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {m.settings_footer_save()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
