/**
 * Type declarations for react-quill
 *
 * Since @types/react-quill doesn't exist, we provide minimal type definitions
 */

declare module 'react-quill' {
  import { Component, CSSProperties } from 'react';

  export interface QuillOptions {
    theme?: string;
    modules?: Record<string, unknown>;
    formats?: string[];
    bounds?: string | HTMLElement;
    debug?: boolean | string;
    placeholder?: string;
    readOnly?: boolean;
    scrollingContainer?: string | HTMLElement;
  }

  export interface ReactQuillProps extends QuillOptions {
    value?: string;
    defaultValue?: string;
    onChange?: (
      content: string,
      delta: unknown,
      source: string,
      editor: unknown
    ) => void;
    onChangeSelection?: (
      range: unknown,
      source: string,
      editor: unknown
    ) => void;
    onFocus?: (range: unknown, source: string, editor: unknown) => void;
    onBlur?: (previousRange: unknown, source: string, editor: unknown) => void;
    onKeyPress?: (event: React.KeyboardEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    style?: CSSProperties;
    className?: string;
    tabIndex?: number;
    preserveWhitespace?: boolean;
  }

  export default class ReactQuill extends Component<ReactQuillProps> {
    focus(): void;
    blur(): void;
    getEditor(): unknown;
  }
}
