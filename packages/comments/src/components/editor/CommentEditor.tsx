/**
 * Enhanced CommentEditor with Lexical rich text editor
 * Features: formatting, images, videos, mentions, emojis, and AI assistant
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
import { useCallback, useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { SendHorizontal } from 'lucide-react';

import type { CommentUser } from '../../types/user.js';
import type { MentionUser } from './plugins/MentionsPlugin.js';

import { ImageNode } from './nodes/ImageNode.js';
import { MentionNode } from './nodes/MentionNode.js';
import { CommentToolbar } from './CommentToolbar.js';
import { ImagesPlugin } from './plugins/ImagesPlugin.js';
import { MentionsPlugin } from './plugins/MentionsPlugin.js';
import { FloatingLinkEditorPlugin } from './plugins/FloatingLinkEditorPlugin.js';
import { editorTheme } from './theme.js';

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
  className,
}: CommentEditorProps) {
  const [isComposerReady, setIsComposerReady] = useState(false);

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
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);
      });
    },
    [onChange],
  );

  const handleMentionTrigger = useCallback(() => {
    // Insert @ character to trigger mentions
    if (isComposerReady) {
      // Editor will handle this via MentionsPlugin
    }
  }, [isComposerReady]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`comment-editor border border-input rounded-lg bg-background ${className || ''}`}>
      <div className="p-4">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-container">
            <div className="editor-inner relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="editor-input min-h-[60px] mb-3 focus:outline-none text-base"
                    aria-placeholder={placeholder}
                    placeholder={
                      <div className="editor-placeholder text-muted-foreground pointer-events-none text-base">
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
            <div className="flex items-center justify-between pt-2 border-t border-input">
              <CommentToolbar onImageUpload={onImageUpload} onMentionTrigger={handleMentionTrigger} className="" />
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
                  disabled={!value.trim()}
                  className="h-9 w-9 bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground rounded-full"
                  title={submitText}
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}
