/**
 * Settings Footer Component
 *
 * Provides Save, Cancel, and Reset buttons for settings forms.
 */

import { Save, X, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

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
}

/**
 * Settings Footer
 *
 * Sticky footer with action buttons for saving, canceling, and resetting changes.
 * Buttons are disabled when appropriate and show loading states.
 */
export function SettingsFooter({ isDirty, isSaving, onSave, onCancel, disabled }: SettingsFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {isDirty && !isSaving && <span>You have unsaved changes</span>}
        {isSaving && <span>Saving changes...</span>}
        {!isDirty && !isSaving && <span>All changes saved</span>}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={disabled || isSaving}
          aria-label="Cancel changes"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={disabled || !isDirty || isSaving}
          aria-label="Save changes"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
