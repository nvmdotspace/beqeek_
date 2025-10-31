/**
 * Lexical Rich Text Editor Component
 * A reusable rich text editor powered by Lexical
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
import { useEffect } from 'react';
import { $getRoot, $createParagraphNode, EditorState, LexicalNode } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { createEditorConfig } from './editor-config.js';
import { ToolbarPlugin } from './toolbar-plugin.js';

interface LexicalEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Plugin to set initial HTML content
 */
function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html) return;

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
    });
  }, []); // Only run once on mount

  return null;
}

/**
 * Plugin to handle content changes
 */
function OnChangeHtmlPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
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
}: LexicalEditorProps) {
  const config = createEditorConfig('rich-text-editor', !disabled);

  return (
    <LexicalComposer initialConfig={config}>
      <div
        className={`relative border border-gray-300 rounded-lg bg-white ${
          disabled ? 'opacity-50' : ''
        } ${className}`}
      >
        <ToolbarPlugin disabled={disabled} />

        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-content-editable min-h-[200px] p-3 outline-none"
                style={{
                  backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
                }}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <InitialContentPlugin html={value} />
          <OnChangeHtmlPlugin onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}
