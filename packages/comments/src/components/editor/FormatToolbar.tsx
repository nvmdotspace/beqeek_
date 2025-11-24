/**
 * FormatToolbar - Text formatting toolbar (collapsible, Google Chat style)
 * Contains: Bold, Italic, Underline, Strikethrough, Link, List, Code, Code Block
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { $createCodeNode } from '@lexical/code';
import { $setBlocksType } from '@lexical/selection';
import { Bold, Italic, Underline, Strikethrough, Link as LinkIcon, List, Code, FileCode2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

export interface FormatToolbarProps {
  /** Compact mode hides some features */
  compactMode?: boolean;
  className?: string;
}

export function FormatToolbar({ compactMode = false, className }: FormatToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  // Update toolbar state based on selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
          setIsStrikethrough(selection.hasFormat('strikethrough'));
          setIsCode(selection.hasFormat('code'));
        }
      });
    });
  }, [editor]);

  const handleFormat = useCallback(
    (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const handleInsertLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
  }, [editor]);

  const handleInsertBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const handleInsertCodeBlock = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode());
      }
    });
  }, [editor]);

  return (
    <div className={`flex items-center gap-0.5 flex-wrap ${className || ''}`}>
      {/* Bold */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('bold')}
        className={`h-7 w-7 rounded ${isBold ? 'bg-primary/20 text-primary' : ''}`}
        title="Bold (Ctrl+B)"
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>

      {/* Italic */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('italic')}
        className={`h-7 w-7 rounded ${isItalic ? 'bg-primary/20 text-primary' : ''}`}
        title="Italic (Ctrl+I)"
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>

      {/* Underline */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('underline')}
        className={`h-7 w-7 rounded ${isUnderline ? 'bg-primary/20 text-primary' : ''}`}
        title="Underline (Ctrl+U)"
        type="button"
      >
        <Underline className="h-4 w-4" />
      </Button>

      {/* Strikethrough */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('strikethrough')}
        className={`h-7 w-7 rounded ${isStrikethrough ? 'bg-primary/20 text-primary' : ''}`}
        title="Strikethrough"
        type="button"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Bulleted List */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInsertBulletList}
        className="h-7 w-7 rounded"
        title="Bulleted list"
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Link */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInsertLink}
        className="h-7 w-7 rounded"
        title="Insert link"
        type="button"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Inline Code */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('code')}
        className={`h-7 w-7 rounded ${isCode ? 'bg-primary/20 text-primary' : ''}`}
        title="Inline code"
        type="button"
      >
        <Code className="h-4 w-4" />
      </Button>

      {/* Code Block */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInsertCodeBlock}
        className="h-7 w-7 rounded"
        title="Code block"
        type="button"
      >
        <FileCode2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
