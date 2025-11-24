/**
 * EmojiPlugin - Handles emoji insertion into Lexical editor
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection } from 'lexical';
import { useEffect } from 'react';

export interface EmojiPluginProps {
  /** Emoji to insert (when changed, will insert) */
  emojiToInsert: string | null;
  /** Callback after emoji is inserted */
  onEmojiInserted: () => void;
}

export function EmojiPlugin({ emojiToInsert, onEmojiInserted }: EmojiPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (emojiToInsert) {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          selection.insertText(emojiToInsert);
        } else {
          // If no selection, insert at end of content
          const root = $getRoot();
          root.selectEnd();
          const newSelection = $getSelection();
          newSelection?.insertText(emojiToInsert);
        }
      });
      onEmojiInserted();
    }
  }, [editor, emojiToInsert, onEmojiInserted]);

  return null;
}
