import { useMemo } from 'react';
import { Comment, CommentUser, CommentActionType, PermissionResult, CommentPermissionConfig } from '../types/index.js';
import { isCommentAuthor } from '../utils/index.js';

/**
 * Default permission configuration
 */
const DEFAULT_PERMISSIONS: CommentPermissionConfig = {
  canCreate: true,
  canRead: true,
  canUpdateOwn: true,
  canUpdateAny: false,
  canDeleteOwn: true,
  canDeleteAny: false,
  canReact: true,
};

/**
 * Hook to check comment permissions for current user
 */
export function useCommentPermissions(currentUser: CommentUser, permissions: Partial<CommentPermissionConfig> = {}) {
  const config = useMemo(() => ({ ...DEFAULT_PERMISSIONS, ...permissions }), [permissions]);

  const checkPermission = useMemo(
    () =>
      (action: CommentActionType, comment?: Comment): PermissionResult => {
        switch (action) {
          case CommentActionType.CREATE:
            return {
              allowed: config.canCreate,
              reason: config.canCreate ? undefined : 'You do not have permission to create comments',
            };

          case CommentActionType.READ:
            return {
              allowed: config.canRead,
              reason: config.canRead ? undefined : 'You do not have permission to read comments',
            };

          case CommentActionType.UPDATE:
            if (!comment) {
              return { allowed: false, reason: 'Comment not provided' };
            }
            const isAuthor = isCommentAuthor(comment, currentUser);
            const canUpdate = config.canUpdateAny || (config.canUpdateOwn && isAuthor);
            return {
              allowed: canUpdate,
              reason: canUpdate
                ? undefined
                : isAuthor
                  ? 'You do not have permission to update your own comments'
                  : 'You can only update your own comments',
            };

          case CommentActionType.DELETE:
            if (!comment) {
              return { allowed: false, reason: 'Comment not provided' };
            }
            const isOwner = isCommentAuthor(comment, currentUser);
            const canDelete = config.canDeleteAny || (config.canDeleteOwn && isOwner);
            return {
              allowed: canDelete,
              reason: canDelete
                ? undefined
                : isOwner
                  ? 'You do not have permission to delete your own comments'
                  : 'You can only delete your own comments',
            };

          case CommentActionType.REACT:
            return {
              allowed: config.canReact,
              reason: config.canReact ? undefined : 'You do not have permission to react to comments',
            };

          default:
            return { allowed: false, reason: 'Unknown action type' };
        }
      },
    [config, currentUser],
  );

  return {
    config,
    checkPermission,
    canCreate: config.canCreate,
    canRead: config.canRead,
    canReact: config.canReact,
    canUpdate: (comment: Comment) => checkPermission(CommentActionType.UPDATE, comment).allowed,
    canDelete: (comment: Comment) => checkPermission(CommentActionType.DELETE, comment).allowed,
  };
}
