import type { EditorValue, EditorConfig } from '../types/editor.js';

/**
 * Empty editor value - represents a blank document
 */
export const EMPTY_EDITOR_VALUE: EditorValue = {};

/**
 * Default editor configuration
 */
export const DEFAULT_EDITOR_CONFIG: Partial<EditorConfig> = {
  autoFocus: true,
  readOnly: false,
  placeholder: 'Start typing...',
};

/**
 * Default placeholder texts (i18n-ready)
 */
export const DEFAULT_PLACEHOLDERS = {
  en: 'Start typing...',
  vi: 'Bắt đầu nhập...',
} as const;
