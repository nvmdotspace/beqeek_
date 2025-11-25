import { CommentUser } from './user.js';

/**
 * Emoji reaction types for comments
 */
export enum ACTIONS_TYPE {
  THUMB_UP = 'THUMB_UP',
  THUMB_DOWN = 'THUMB_DOWN',
  LAUGH = 'LAUGH',
  HOORAY = 'HOORAY',
  CONFUSED = 'CONFUSED',
  HEART = 'HEART',
  ROCKET = 'ROCKET',
  EYE = 'EYE',
  UPVOTE = 'UPVOTE',
}

/**
 * Emoji list for reactions
 */
export const LIST_EMOJI = ['👍', '👎', '😄', '🎉', '😕', '❤️', '🚀', '👀'] as const;

/**
 * Action configuration with emoji mapping
 */
export const ACTIONS = [
  { id: ACTIONS_TYPE.THUMB_UP, emoji: LIST_EMOJI[0] },
  { id: ACTIONS_TYPE.THUMB_DOWN, emoji: LIST_EMOJI[1] },
  { id: ACTIONS_TYPE.LAUGH, emoji: LIST_EMOJI[2] },
  { id: ACTIONS_TYPE.HOORAY, emoji: LIST_EMOJI[3] },
  { id: ACTIONS_TYPE.CONFUSED, emoji: LIST_EMOJI[4] },
  { id: ACTIONS_TYPE.HEART, emoji: LIST_EMOJI[5] },
  { id: ACTIONS_TYPE.ROCKET, emoji: LIST_EMOJI[6] },
  { id: ACTIONS_TYPE.EYE, emoji: LIST_EMOJI[7] },
] as const;

/**
 * Comment data structure
 * Supports flat conversation design with multi-reply
 */
export type Comment = {
  /** Unique comment identifier */
  id: string;
  /** Comment author */
  user: CommentUser;
  /**
   * @deprecated Use replyToIds instead. Kept for backward compatibility.
   * Single parent comment ID (first element of replyToIds)
   */
  parentId?: string;
  /**
   * IDs of comments this is replying to (multi-reply support)
   * Empty array means top-level comment
   */
  replyToIds: string[];
  /** Comment text content (supports plain text or MDX) */
  text: string;
  /** Comment creation timestamp */
  createdAt: Date;
  /** Reaction counts by type */
  actions?: { [key in ACTIONS_TYPE]?: number };
  /** Reactions selected by current user */
  selectedActions?: ACTIONS_TYPE[];
  /** Whether upvoting is allowed for this comment */
  allowUpvote?: boolean;
};

/**
 * Comment change payload for updates
 */
export type CommentChange = {
  text?: string;
  actions?: { [key in ACTIONS_TYPE]?: number };
  selectedActions?: ACTIONS_TYPE[];
};
