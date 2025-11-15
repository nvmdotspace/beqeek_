import type { YooEditor, YooptaContentValue, YooptaOnChangeOptions, SlateElement } from '@yoopta/editor';
import type { YooptaPlugin } from '@yoopta/editor';
import type { YooptaMark } from '@yoopta/editor';
import type { Tools } from '@yoopta/editor';

/**
 * Editor value structure - Yoopta content value type
 */
export type EditorValue = YooptaContentValue;

/**
 * Props for BeqeekEditor component
 */
export interface BeqeekEditorProps {
  /** Editor instance from createBeqeekEditor() */
  editor: YooEditor;

  /** Array of configured Yoopta plugins */
  plugins: Readonly<YooptaPlugin<Record<string, SlateElement>>[]>;

  /** Tools configuration (ActionMenu, Toolbar, LinkTool) */
  tools?: Partial<Tools>;

  /** Marks array (Bold, Italic, Code, Underline, Strike, Highlight) */
  marks?: YooptaMark<unknown>[];

  /** Controlled editor value */
  value?: EditorValue;

  /** Default value for uncontrolled mode */
  defaultValue?: EditorValue;

  /** Auto-focus on mount (default: true) */
  autoFocus?: boolean;

  /** Change handler for controlled mode */
  onChange?: (value: EditorValue, options: YooptaOnChangeOptions) => void;

  /** Additional wrapper class name */
  className?: string;

  /** Read-only mode (default: false) */
  readOnly?: boolean;

  /** Placeholder text when editor is empty */
  placeholder?: string;
}

/**
 * Editor configuration object
 */
export interface EditorConfig {
  /** Array of configured Yoopta plugins */
  plugins: Readonly<YooptaPlugin<Record<string, SlateElement>>[]>;

  /** Tools configuration */
  tools?: Partial<Tools>;

  /** Marks array */
  marks?: YooptaMark<unknown>[];

  /** Default value for uncontrolled mode */
  defaultValue?: EditorValue;

  /** Auto-focus on mount */
  autoFocus?: boolean;

  /** Read-only mode */
  readOnly?: boolean;

  /** Placeholder text */
  placeholder?: string;
}
