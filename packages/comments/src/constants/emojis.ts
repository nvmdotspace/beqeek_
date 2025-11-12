/**
 * Emoji constants for comment editor
 */

/**
 * Common emojis available in the emoji picker for inserting into comment content
 * These are different from reaction emojis (👍 👎 😄 🎉 😕 ❤️ 🚀 👀)
 */
export const EMOJI_PICKER_LIST = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🥳',
  '🤩',
] as const;

/**
 * Type for emoji picker emojis
 */
export type EmojiPickerEmoji = (typeof EMOJI_PICKER_LIST)[number];
