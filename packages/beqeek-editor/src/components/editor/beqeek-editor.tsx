import YooptaEditor from '@yoopta/editor';
import { useRef } from 'react';
import type { BeqeekEditorProps } from '../../types/editor.js';
import { cn } from '@workspace/ui/lib/utils';

/**
 * BeqeekEditor - Notion-like document editor wrapper for Yoopta Editor v4
 *
 * Features:
 * - 14 rich content plugins (headings, lists, media, tables, etc.)
 * - 3 collaborative tools (ActionMenu, Toolbar, LinkTool)
 * - 6 text formatting marks (bold, italic, code, underline, strike, highlight)
 * - Large document optimization
 * - shadcn/ui design system integration
 *
 * @example
 * ```tsx
 * import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
 * import { useMemo } from 'react';
 *
 * function MyDocument() {
 *   const editor = useMemo(() => createBeqeekEditor(), []);
 *
 *   return (
 *     <BeqeekEditor
 *       editor={editor}
 *       plugins={[]} // Configure in Phase 03
 *       autoFocus
 *     />
 *   );
 * }
 * ```
 */
export function BeqeekEditor({
  editor,
  plugins,
  tools,
  marks,
  value,
  defaultValue: _defaultValue, // Not used - Yoopta handles this internally via value prop
  autoFocus = true,
  onChange,
  className,
  readOnly = false,
  placeholder = 'Start typing...',
}: BeqeekEditorProps) {
  const selectionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={selectionRef}
      className={cn('beqeek-editor-wrapper', 'min-h-[500px] w-full p-4', 'focus-within:outline-none', className)}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={tools}
        marks={marks}
        value={value}
        onChange={onChange}
        selectionBoxRoot={selectionRef}
        autoFocus={autoFocus}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </div>
  );
}
