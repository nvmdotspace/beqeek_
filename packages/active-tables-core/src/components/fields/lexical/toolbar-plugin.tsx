/**
 * Lexical Toolbar Plugin
 * Provides formatting controls for the rich text editor
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isListNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';

const HEADING_OPTIONS = [
  { label: 'Normal', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
];

interface ToolbarPluginProps {
  disabled?: boolean;
}

export function ToolbarPlugin({ disabled = false }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          if (parentList) {
            const listType = parentList.getListType();
            setBlockType(listType === 'number' ? 'ol' : 'ul');
          } else if ($isListNode(element)) {
            const listType = element.getListType();
            setBlockType(listType === 'number' ? 'ol' : 'ul');
          }
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
        }
      }

      // Update link state
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const formatList = (listType: 'bullet' | 'number') => {
    if (listType === 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const buttonClass = (active: boolean) =>
    `px-2 py-1 rounded hover:bg-accent transition-colors ${
      active ? 'bg-accent font-semibold' : ''
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-input bg-muted/50 rounded-t-lg flex-wrap">
      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={disabled}
        className={buttonClass(false)}
        title="Undo"
      >
        ↶
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={disabled}
        className={buttonClass(false)}
        title="Redo"
      >
        ↷
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text formatting */}
      <button
        type="button"
        onClick={() => formatText('bold')}
        disabled={disabled}
        className={buttonClass(isBold)}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => formatText('italic')}
        disabled={disabled}
        className={buttonClass(isItalic)}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => formatText('underline')}
        disabled={disabled}
        className={buttonClass(isUnderline)}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => formatText('strikethrough')}
        disabled={disabled}
        className={buttonClass(isStrikethrough)}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => formatList('bullet')}
        disabled={disabled}
        className={buttonClass(blockType === 'ul')}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => formatList('number')}
        disabled={disabled}
        className={buttonClass(blockType === 'ol')}
        title="Numbered List"
      >
        1. List
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Link */}
      <button
        type="button"
        onClick={insertLink}
        disabled={disabled}
        className={buttonClass(isLink)}
        title="Insert Link"
      >
        🔗 Link
      </button>
    </div>
  );
}
