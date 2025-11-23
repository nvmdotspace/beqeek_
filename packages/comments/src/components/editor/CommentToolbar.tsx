/**
 * Enhanced CommentToolbar with rich text formatting and media insertion
 * Based on image showing: Bold, Italic, Underline, Code, Link, Font size, Color, Text align
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import {
  Bold,
  Italic,
  Underline,
  Code,
  Link as LinkIcon,
  Type,
  Palette,
  AlignLeft,
  Paperclip,
  AtSign,
  Smile,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { EMOJI_PICKER_LIST } from '../../constants/emojis.js';
import { INSERT_IMAGE_COMMAND } from '../editor/plugins/ImagesPlugin.js';
import { $createTextNode } from 'lexical';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

export interface CommentToolbarProps {
  onImageUpload?: (file: File) => Promise<string>;
  onMentionTrigger?: () => void;
  /** Compact mode hides disabled/placeholder features (Font size, Color, Align) */
  compactMode?: boolean;
  className?: string;
}

export function CommentToolbar({
  onImageUpload,
  onMentionTrigger,
  compactMode = false,
  className,
}: CommentToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
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
          setIsCode(selection.hasFormat('code'));
        }
      });
    });
  }, [editor]);

  const handleFormat = useCallback(
    (format: 'bold' | 'italic' | 'underline' | 'code') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const handleInsertLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
  }, [editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload) {
        try {
          const url = await onImageUpload(file);
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: url,
            altText: file.name,
          });
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([$createTextNode(emoji)]);
        }
      });
      setEmojiPickerOpen(false);
    },
    [editor],
  );

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className || ''}`}>
      {/* Bold */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('bold')}
        className={`h-8 w-8 ${isBold ? 'bg-accent' : ''}`}
        title="Bold"
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>

      {/* Italic */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('italic')}
        className={`h-8 w-8 ${isItalic ? 'bg-accent' : ''}`}
        title="Italic"
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>

      {/* Underline */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('underline')}
        className={`h-8 w-8 ${isUnderline ? 'bg-accent' : ''}`}
        title="Underline"
        type="button"
      >
        <Underline className="h-4 w-4" />
      </Button>

      {/* Code */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('code')}
        className={`h-8 w-8 ${isCode ? 'bg-accent' : ''}`}
        title="Code"
        type="button"
      >
        <Code className="h-4 w-4" />
      </Button>

      {/* Link */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInsertLink}
        className="h-8 w-8"
        title="Insert link"
        type="button"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      {/* Separator and disabled features - hidden in compact mode */}
      {!compactMode && (
        <>
          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Font Size */}
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Font size" type="button" disabled>
            <Type className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Color */}
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Text color" type="button" disabled>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Text Align */}
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Text align" type="button" disabled>
            <AlignLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
        </>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Attachment */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleImageUpload}
        className="h-8 w-8"
        title="Attach image"
        type="button"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {/* Mention */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMentionTrigger}
        className="h-8 w-8"
        title="Mention someone (@)"
        type="button"
      >
        <AtSign className="h-4 w-4" />
      </Button>

      {/* Emoji Picker */}
      <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Insert emoji" type="button">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-2" align="start" style={{ width: '320px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
              gap: '4px',
              maxHeight: '280px',
              overflowY: 'auto',
            }}
          >
            {EMOJI_PICKER_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
