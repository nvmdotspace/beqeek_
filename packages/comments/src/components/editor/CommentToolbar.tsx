/**
 * Comment Toolbar Plugin
 * Simplified toolbar for comment editing with essential formatting options
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { Button } from '@workspace/ui/components/button';
import { Bold, Italic, List, ListOrdered, Undo2, Redo2, Heading2 } from 'lucide-react';

export function CommentToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h2'));
      }
    });
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <div className="flex items-center gap-1 border-b border-input p-2">
      <Button type="button" variant="ghost" size="sm" onClick={undo} className="h-8 w-8 p-0" title="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={redo} className="h-8 w-8 p-0" title="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBold}
        className={`h-8 w-8 p-0 ${isBold ? 'bg-accent' : ''}`}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatItalic}
        className={`h-8 w-8 p-0 ${isItalic ? 'bg-accent' : ''}`}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button type="button" variant="ghost" size="sm" onClick={formatHeading} className="h-8 w-8 p-0" title="Heading">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBulletList}
        className="h-8 w-8 p-0"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatNumberedList}
        className="h-8 w-8 p-0"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}
