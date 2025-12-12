/**
 * Comment Item Component
 *
 * Displays a single comment with:
 * - User avatar and name
 * - Timestamp (relative)
 * - Rich text content
 * - Edit/delete actions (based on permissions)
 * - Inline editing mode
 */

import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Textarea } from '@workspace/ui/components/textarea';
import { Text } from '@workspace/ui/components/typography';
import { Inline } from '@workspace/ui/components/primitives';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { RecordComment } from '../hooks/use-record-comments-with-permissions';

export interface CommentItemProps {
  comment: RecordComment;
  _currentUserId?: string;
  canUpdate: boolean;
  canDelete: boolean;
  onUpdate?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  workspaceUsers?: Array<{ id: string; name: string; avatar?: string }>;
  locale?: string;
}

/**
 * Single comment display with edit/delete actions
 */
export function CommentItem({
  comment,
  _currentUserId,
  canUpdate,
  canDelete,
  onUpdate,
  onDelete,
  workspaceUsers,
  locale = 'vi',
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get user info
  const user = workspaceUsers?.find((u) => u.id === comment.userId);
  const userName = user?.name || comment.userName || 'Unknown User';
  const userAvatar = user?.avatar || comment.userAvatar;
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: locale === 'vi' ? vi : undefined,
  });

  // Check if comment was edited
  const isEdited = comment.updatedAt !== comment.createdAt || comment.edited;

  // Handle save edit
  const handleSaveEdit = useCallback(async () => {
    if (!editContent.trim() || !onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('[CommentItem] Update failed:', error);
      // Keep editing mode open on error
    } finally {
      setIsUpdating(false);
    }
  }, [comment.id, editContent, onUpdate]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditContent(comment.content);
    setIsEditing(false);
  }, [comment.content]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    // Confirm deletion
    const confirmMessage = locale === 'vi' ? 'Xóa bình luận này?' : 'Delete this comment?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('[CommentItem] Delete failed:', error);
      setIsDeleting(false);
    }
  }, [comment.id, onDelete, locale]);

  // Render edit mode
  if (isEditing) {
    return (
      <Inline space="space-075" className="p-4 bg-muted/30 rounded-lg">
        <Avatar className="h-8 w-8 flex-shrink-0">
          {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
          <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <span className="font-medium text-sm">{userName}</span>
          </div>

          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px] w-full resize-none"
            autoFocus
          />

          <Inline align="center" space="space-050" className="mt-3">
            <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating || !editContent.trim()}>
              <Inline space="space-025" align="center">
                <Check className="h-3.5 w-3.5" />
                {isUpdating ? (locale === 'vi' ? 'Đang lưu...' : 'Saving...') : locale === 'vi' ? 'Lưu' : 'Save'}
              </Inline>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isUpdating}>
              <Inline space="space-025" align="center">
                <X className="h-3.5 w-3.5" />
                {locale === 'vi' ? 'Hủy' : 'Cancel'}
              </Inline>
            </Button>
          </Inline>
        </div>
      </Inline>
    );
  }

  // Render view mode
  return (
    <Inline space="space-075" className="p-4 hover:bg-muted/30 rounded-lg group transition-colors">
      <Avatar className="h-8 w-8 flex-shrink-0">
        {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
        <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <Inline align="center" justify="between" className="mb-1">
          <Inline align="center" space="space-050">
            <span className="font-medium text-sm">{userName}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {isEdited && (
              <Badge variant="secondary" className="text-xs">
                {locale === 'vi' ? 'Đã chỉnh sửa' : 'Edited'}
              </Badge>
            )}
          </Inline>

          {/* Actions - show on hover if user has permissions */}
          {(canUpdate || canDelete) && (
            <Inline align="center" space="space-025" className="opacity-0 group-hover:opacity-100 transition-opacity">
              {canUpdate && onUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsEditing(true)}
                  title={locale === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title={locale === 'vi' ? 'Xóa' : 'Delete'}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </Inline>
          )}
        </Inline>

        {/* Content - render as text */}
        <Text size="small" className="whitespace-pre-wrap">
          {comment.content}
        </Text>
      </div>
    </Inline>
  );
}
