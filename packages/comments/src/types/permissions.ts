import { CommentUser } from './user.js';
import { Comment } from './comment.js';

/**
 * Permission check result
 */
export type PermissionResult = {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Reason for denial (if not allowed) */
  reason?: string;
};

/**
 * Comment action types for permission checking
 */
export enum CommentActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  REACT = 'REACT',
}

/**
 * Permission configuration for comment system
 */
export type CommentPermissionConfig = {
  /** Can create new comments */
  canCreate: boolean;
  /** Can read comments */
  canRead: boolean;
  /** Can update own comments */
  canUpdateOwn: boolean;
  /** Can update any comment */
  canUpdateAny: boolean;
  /** Can delete own comments */
  canDeleteOwn: boolean;
  /** Can delete any comment */
  canDeleteAny: boolean;
  /** Can react to comments */
  canReact: boolean;
};

/**
 * Permission checker function type
 */
export type PermissionChecker = (
  action: CommentActionType,
  currentUser: CommentUser,
  comment?: Comment,
) => PermissionResult;
