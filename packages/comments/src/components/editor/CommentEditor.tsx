/**
 * Enhanced CommentEditor with Lexical rich text editor
 * Google Chat style: collapsible formatting toolbar + always-visible action bar
 */

import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, EditorState } from 'lexical';
import { useCallback, useState } from 'react';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { SendHorizontal, ALargeSmall, Smile, Paperclip, AtSign } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';

import type { CommentUser } from '../../types/user.js';
import type { MentionUser } from './plugins/MentionsPlugin.js';

import { ImageNode } from './nodes/ImageNode.js';
import { MentionNode } from './nodes/MentionNode.js';
import { FormatToolbar } from './FormatToolbar.js';
import { ImagesPlugin } from './plugins/ImagesPlugin.js';
import { MentionsPlugin } from './plugins/MentionsPlugin.js';
import { FloatingLinkEditorPlugin } from './plugins/FloatingLinkEditorPlugin.js';
import { editorTheme } from './theme.js';
import { EMOJI_PICKER_LIST } from '../../constants/emojis.js';

export interface CommentEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  currentUser: CommentUser;
  submitText?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  mentionUsers?: MentionUser[];
  onMentionSearch?: (query: string) => Promise<MentionUser[]>;
  /** Compact mode hides disabled toolbar features */
  compactMode?: boolean;
  className?: string;
}

export function CommentEditor({
  value,
  onChange,
  placeholder = 'Write a comment...',
  currentUser,
  submitText = 'Comment',
  onSubmit,
  onCancel,
  showCancel = false,
  onImageUpload,
  mentionUsers,
  onMentionSearch,
  compactMode = false,
  className,
}: CommentEditorProps) {
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [editorRef, setEditorRef] = useState<any>(null);
  const [hasContent, setHasContent] = useState(false);

  const initialConfig = {
    namespace: 'CommentEditor',
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      ImageNode,
      MentionNode,
    ],
    editorState: value
      ? (editor: any) => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(value, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $getRoot().select();
          $insertNodes(nodes);
        }
      : undefined,
  };

  const handleEditorChange = useCallback(
    (editorState: EditorState, editor: any) => {
      setEditorRef(editor);
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);

        // Check if editor has actual text content (not just empty HTML)
        const textContent = $getRoot().getTextContent().trim();
        setHasContent(textContent.length > 0);
      });
    },
    [onChange],
  );

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload) {
        try {
          const url = await onImageUpload(file);
          // TODO: Insert image into editor
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }
    };
    input.click();
  }, [onImageUpload]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      if (editorRef) {
        editorRef.update(() => {
          const selection = (window as any).lexical?.$getSelection?.();
          if (selection) {
            selection.insertText(emoji);
          }
        });
      }
      setEmojiPickerOpen(false);
    },
    [editorRef],
  );

  return (
    <div className={cn('comment-editor border border-input rounded-lg bg-background overflow-hidden', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          {/* Collapsible Format Toolbar (Google Chat style) */}
          {showFormatToolbar && (
            <div className="format-toolbar-container px-3 py-2 bg-muted/30 border-b border-input">
              <FormatToolbar compactMode={compactMode} />
            </div>
          )}

          {/* Editor Content */}
          <div className="editor-inner relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input min-h-[60px] max-h-[200px] overflow-y-auto focus:outline-none text-sm px-4 py-3"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="editor-placeholder text-muted-foreground pointer-events-none text-sm px-4 py-3 absolute top-0 left-0 right-0">
                      {placeholder}
                    </div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={handleEditorChange} />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <FloatingLinkEditorPlugin />
            <ImagesPlugin onImageUpload={onImageUpload} />
            <MentionsPlugin users={mentionUsers} onSearch={onMentionSearch} />
          </div>

          {/* Bottom Action Bar (always visible, Google Chat style) */}
          <div className="action-bar flex items-center justify-between px-3 py-2 border-t border-input">
            {/* Left side: Action buttons */}
            <div className="flex items-center gap-1">
              {/* Format Toggle (A button) */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowFormatToolbar(!showFormatToolbar)}
                className={cn('h-8 w-8 rounded-full', showFormatToolbar && 'bg-primary/10 text-primary')}
                title="Toggle formatting"
              >
                <ALargeSmall className="h-4 w-4" />
              </Button>

              {/* Emoji Picker */}
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    title="Insert emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 w-[280px]" align="start">
                  <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
                    {EMOJI_PICKER_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="h-8 w-8 flex items-center justify-center text-lg hover:bg-accent rounded cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Attachment */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleImageUpload}
                className="h-8 w-8 rounded-full"
                title="Attach image"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {/* Mention */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                title="Mention someone (@)"
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </div>

            {/* Right side: Cancel + Send */}
            <div className="flex items-center gap-2">
              {showCancel && (
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                onClick={onSubmit}
                disabled={!hasContent}
                className={cn(
                  'h-8 w-8 rounded-full transition-colors',
                  hasContent
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
                title={submitText}
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
