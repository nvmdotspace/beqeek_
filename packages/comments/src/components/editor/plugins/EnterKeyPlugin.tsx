/**
 * Enter Key Plugin for Lexical editor
 * Handles Enter key to submit comment (when not in mention typeahead)
 * Shift+Enter creates a new line
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND } from 'lexical';
import { useEffect } from 'react';

export interface EnterKeyPluginProps {
  /** Callback when Enter is pressed (without Shift) */
  onEnter?: () => void;
}

export function EnterKeyPlugin({ onEnter }: EnterKeyPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register Enter key command handler
    const removeEnterHandler = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        // If Shift is held, allow default behavior (new line)
        if (event?.shiftKey) {
          return false; // Let Lexical handle it (creates new line)
        }

        // Check if typeahead menu is open by looking for the popover element
        const typeaheadMenu = document.querySelector('.typeahead-popover');
        if (typeaheadMenu) {
          // Typeahead is open, let the typeahead handle Enter
          return false;
        }

        // No typeahead, trigger submit
        if (onEnter) {
          event?.preventDefault();
          onEnter();
          return true; // We handled the event
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      removeEnterHandler();
    };
  }, [editor, onEnter]);

  return null;
}
