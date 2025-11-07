/**
 * Settings Footer Component
 *
 * Provides Save, Cancel, and Reset buttons for settings forms.
 */

import { Save, X, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
// @ts-ignore - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
        {isDirty && !isSaving && <span>{m.settings_header_unsaved()}</span>}
        {isSaving && <span>{m.settings_footer_saving()}</span>}
        {!isDirty && !isSaving && <span>{m.settings_save_success()}</span>}
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
          disabled={disabled || !isDirty || isSaving}
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
  );
}
