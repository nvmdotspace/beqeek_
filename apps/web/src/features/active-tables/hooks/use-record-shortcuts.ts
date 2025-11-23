/**
 * useRecordShortcuts Hook
 *
 * Keyboard shortcuts for record detail page
 */

import { useEffect } from 'react';

export interface RecordShortcutsHandlers {
  onEscape?: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  onShowHelp?: () => void;
}

/**
 * Register keyboard shortcuts for record detail page
 *
 * Shortcuts:
 * - Escape: Go back / Cancel editing
 * - Cmd/Ctrl + S: Save (when editing)
 * - Cmd/Ctrl + E: Enter edit mode
 * - Cmd/Ctrl + /: Show shortcuts help
 */
export function useRecordShortcuts(handlers: RecordShortcutsHandlers) {
  const { onEscape, onSave, onEdit, onShowHelp } = handlers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      const isMod = e.metaKey || e.ctrlKey;

      // Escape - Go back / Cancel
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      // Cmd/Ctrl + S - Save
      if (isMod && e.key === 's' && onSave) {
        e.preventDefault();
        onSave();
        return;
      }

      // Cmd/Ctrl + E - Edit mode (only if not in input)
      if (isMod && e.key === 'e' && !isInput && onEdit) {
        e.preventDefault();
        onEdit();
        return;
      }

      // Cmd/Ctrl + / - Show help
      if (isMod && e.key === '/' && onShowHelp) {
        e.preventDefault();
        onShowHelp();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onSave, onEdit, onShowHelp]);
}
