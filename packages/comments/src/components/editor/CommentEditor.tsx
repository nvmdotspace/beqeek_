/**
 * Enhanced CommentEditor with Lexical rich text editor
 * Google Chat style: collapsible formatting toolbar + always-visible action bar
 */

import { CodeHighlightNode, CodeNode } from '@lexical/code';
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
import { $getRoot, $getSelection, $insertNodes, $isRangeSelection, EditorState, LexicalEditor } from 'lexical';
import { useCallback, useState, useRef } from 'react';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { SendHorizontal, ALargeSmall, Smile, Paperclip, AtSign } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';

import type { CommentUser } from '../../types/user.js';
import type { CommentI18n } from '../../types/i18n.js';
import type { MentionUser } from './plugins/MentionsPlugin.js';

import { defaultI18n } from '../../types/i18n.js';

import { ImageNode } from './nodes/ImageNode.js';
import { EnterKeyPlugin } from './plugins/EnterKeyPlugin.js';
import { MentionNode } from './nodes/MentionNode.js';
import { FormatToolbar } from './FormatToolbar.js';
import { EmojiPlugin } from './plugins/EmojiPlugin.js';
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
  cancelText?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  mentionUsers?: MentionUser[];
  onMentionSearch?: (query: string) => Promise<MentionUser[]>;
  /** Compact mode hides disabled toolbar features */
  compactMode?: boolean;
  className?: string;
  /** Whether the comment is being submitted (shows loading state) */
  isSubmitting?: boolean;
  /** Internationalization strings */
  i18n?: Partial<CommentI18n>;
}

export function CommentEditor({
  value,
  onChange,
  placeholder,
  currentUser,
  submitText,
  cancelText,
  onSubmit,
  onCancel,
  showCancel = false,
  onImageUpload,
  mentionUsers,
  onMentionSearch,
  compactMode = false,
  className,
  isSubmitting = false,
  i18n: i18nProp,
}: CommentEditorProps) {
  const i18n = { ...defaultI18n, ...i18nProp };
  const resolvedPlaceholder = placeholder ?? i18n.placeholder;
  const resolvedSubmitText = submitText ?? i18n.comment;
  const resolvedCancelText = cancelText ?? i18n.cancel;
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [emojiToInsert, setEmojiToInsert] = useState<string | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const editorRef = useRef<LexicalEditor | null>(null);

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
      CodeNode,
      CodeHighlightNode,
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
    (editorState: EditorState, editor: LexicalEditor) => {
      // Store editor reference for external actions (like @ button)
      editorRef.current = editor;

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

  // Insert @ to trigger mention typeahead
  const handleMentionTrigger = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText('@');
      }
    });

    // Focus the editor
    editor.focus();
  }, []);

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

  const handleEmojiSelect = useCallback((emoji: string) => {
    setEmojiToInsert(emoji);
    setEmojiPickerOpen(false);
  }, []);

  const handleEmojiInserted = useCallback(() => {
    setEmojiToInsert(null);
  }, []);

  // Handle Enter key to submit (only if has content and not submitting)
  const handleEnterKey = useCallback(() => {
    if (hasContent && !isSubmitting && onSubmit) {
      onSubmit();
    }
  }, [hasContent, isSubmitting, onSubmit]);

  return (
    <div className={cn('comment-editor border border-input rounded-lg bg-background overflow-hidden', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          {/* Collapsible Format Toolbar (Google Chat style) */}
          {showFormatToolbar && (
            <div className="format-toolbar-container px-3 py-2 bg-muted/30 border-b border-input">
              <FormatToolbar compactMode={compactMode} i18n={i18n} />
            </div>
          )}

          {/* Editor Content */}
          <div className="editor-inner relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input min-h-[60px] max-h-[200px] overflow-y-auto focus:outline-none text-sm px-4 py-3"
                  aria-placeholder={resolvedPlaceholder}
                  placeholder={
                    <div className="editor-placeholder text-muted-foreground pointer-events-none text-sm px-4 py-3 absolute top-0 left-0 right-0">
                      {resolvedPlaceholder}
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
            <EmojiPlugin emojiToInsert={emojiToInsert} onEmojiInserted={handleEmojiInserted} />
            <EnterKeyPlugin onEnter={handleEnterKey} />
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
                title={i18n.toolbar.toggleFormatting}
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
                    title={i18n.toolbar.insertEmoji}
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
                        onClick={() => handleEmojiSelect(emoji)}
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
                title={i18n.toolbar.attachImage}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {/* Mention */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMentionTrigger}
                className="h-8 w-8 rounded-full"
                title={i18n.toolbar.mentionSomeone}
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </div>

            {/* Right side: Cancel + Send */}
            <div className="flex items-center gap-2">
              {showCancel && (
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                  {resolvedCancelText}
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                onClick={onSubmit}
                disabled={!hasContent || isSubmitting}
                className={cn(
                  'h-8 w-8 rounded-full transition-colors',
                  hasContent && !isSubmitting
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
                title={isSubmitting ? i18n.loading : resolvedSubmitText}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
