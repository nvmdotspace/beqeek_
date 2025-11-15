import { createYooptaEditor } from '@yoopta/editor';
import type { YooEditor } from '@yoopta/editor';

/**
 * Creates a new Beqeek editor instance.
 *
 * This is a thin wrapper around Yoopta's createYooptaEditor() that provides
 * a consistent API and allows for future customization (e.g., custom commands).
 *
 * @returns A new YooEditor instance
 *
 * @example
 * ```tsx
 * import { createBeqeekEditor } from '@workspace/beqeek-editor';
 * import { useMemo } from 'react';
 *
 * function MyEditor() {
 *   const editor = useMemo(() => createBeqeekEditor(), []);
 *   return <BeqeekEditor editor={editor} plugins={[]} />;
 * }
 * ```
 */
export function createBeqeekEditor(): YooEditor {
  return createYooptaEditor();
}
