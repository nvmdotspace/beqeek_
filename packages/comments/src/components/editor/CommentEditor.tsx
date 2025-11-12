/**
 * CommentEditor - Lexical-based rich text editor for comments
 * React 19 compatible, simplified for comment editing
 */

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { $getRoot, $createParagraphNode, type EditorState, type LexicalNode } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { createCommentEditorConfig } from './editor-config.js';
import { CommentToolbar } from './CommentToolbar.js';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import type { CommentUser } from '../../types/user.js';
import { cn } from '@workspace/ui/lib/utils';

export interface CommentEditorProps {
  /** HTML content value */
  value?: string;
  /** Callback when content changes */
  onChange?: (html: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Current user for avatar display */
  currentUser: CommentUser;
  /** Button text */
  submitText?: string;
  /** Submit callback */
  onSubmit?: () => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Additional className */
  className?: string;
  /** Whether to show cancel button */
  showCancel?: boolean;
}

/**
 * Plugin to set initial HTML content
 */
function InitialContentPlugin({ html, lastHtmlRef }: { html: string; lastHtmlRef: RefObject<string> }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html || lastHtmlRef.current === html) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      const root = $getRoot();
      root.clear();

      if (nodes.length > 0) {
        nodes.forEach((node: LexicalNode) => root.append(node));
      } else {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      }

      lastHtmlRef.current = html;
    });
  }, [editor, html, lastHtmlRef]);

  return null;
}

/**
 * Plugin to handle content changes
 */
function OnChangeHtmlPlugin({
  onChange,
  lastHtmlRef,
}: {
  onChange: (html: string) => void;
  lastHtmlRef: RefObject<string>;
}) {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      if (html === lastHtmlRef.current) {
        return;
      }

      lastHtmlRef.current = html;
      onChange(html);
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

/**
 * Main CommentEditor Component
 */
export function CommentEditor({
  value = '',
  onChange = () => {},
  placeholder = 'Add your comment here...',
  currentUser,
  submitText = 'Comment',
  onSubmit,
  onCancel,
  className,
  showCancel = false,
}: CommentEditorProps) {
  const lastHtmlRef = useRef(value);
  const initialConfig = createCommentEditorConfig();

  const hasContent = value.trim().length > 0;

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <div className="flex gap-4 w-full">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
          <AvatarFallback>{currentUser.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <LexicalComposer initialConfig={initialConfig}>
            <div className="relative border border-input rounded-lg bg-background overflow-hidden">
              <CommentToolbar />
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="outline-none p-3 min-h-[100px] max-h-[300px] overflow-y-auto" />
                }
                placeholder={
                  <div className="absolute top-14 left-3 text-muted-foreground pointer-events-none">{placeholder}</div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              {onChange && <OnChangeHtmlPlugin onChange={onChange} lastHtmlRef={lastHtmlRef} />}
              <InitialContentPlugin html={value} lastHtmlRef={lastHtmlRef} />
            </div>
          </LexicalComposer>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {showCancel && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="h-8">
            Cancel
          </Button>
        )}
        <Button type="button" disabled={!hasContent} onClick={onSubmit} className="h-8">
          {submitText}
        </Button>
      </div>
    </div>
  );
}
