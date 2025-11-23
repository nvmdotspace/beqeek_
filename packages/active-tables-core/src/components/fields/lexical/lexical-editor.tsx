/**
 * Lexical Rich Text Editor Component
 * A reusable rich text editor powered by Lexical
 *
 * Week 3: Added image upload support
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
import type { MutableRefObject } from 'react';
import { $getRoot, $createParagraphNode, EditorState, LexicalNode } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { createEditorConfig } from './editor-config.js';
import { ToolbarPlugin } from './toolbar-plugin.js';
import { ImagePlugin } from './image-plugin.js';

interface LexicalEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Optional image upload handler (Week 3) */
  onImageUpload?: (file: File) => Promise<string>;
}

/**
 * Plugin to set initial HTML content
 */
function InitialContentPlugin({ html, lastHtmlRef }: { html: string; lastHtmlRef: MutableRefObject<string> }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Skip if no content or already processed this exact content
    if (!html) return;

    // On first mount, always load the initial content
    // After that, only update if html changes
    if (hasInitialized.current && lastHtmlRef.current === html) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      const root = $getRoot();
      root.clear();

      if (nodes.length > 0) {
        nodes.forEach((node: LexicalNode) => root.append(node));
      } else {
        // Empty content
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      }

      lastHtmlRef.current = html;
      hasInitialized.current = true;
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
  lastHtmlRef: MutableRefObject<string>;
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
 * Main Lexical Editor Component
 */
export function LexicalEditor({
  value,
  onChange,
  placeholder = 'Enter rich text content...',
  disabled = false,
  className = '',
  onImageUpload,
}: LexicalEditorProps) {
  const config = createEditorConfig('rich-text-editor', !disabled);
  const lastSerializedHtmlRef = useRef(value);

  return (
    <LexicalComposer initialConfig={config}>
      <div
        className={`relative border border-input rounded-lg bg-background ${disabled ? 'opacity-50' : ''} ${className}`}
      >
        <ToolbarPlugin disabled={disabled} onImageUpload={onImageUpload} />

        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="lexical-content-editable min-h-[200px] w-full whitespace-pre-wrap break-words p-3 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring" />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImagePlugin onImageUpload={onImageUpload} disabled={disabled} />
          <InitialContentPlugin html={value} lastHtmlRef={lastSerializedHtmlRef} />
          <OnChangeHtmlPlugin onChange={onChange} lastHtmlRef={lastSerializedHtmlRef} />
        </div>
      </div>
    </LexicalComposer>
  );
}
