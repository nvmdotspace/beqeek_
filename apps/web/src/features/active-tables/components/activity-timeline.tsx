/**
 * Activity Timeline Component
 *
 * Shows rich text comments with CRUD operations based on permissions
 */

import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { MessageSquare } from 'lucide-react';
import { RichCommentEditor } from './rich-comment-editor';
import { CommentItem } from './comment-item';
import type { RecordComment, CommentPermissions } from '../hooks/use-record-comments-with-permissions';

export interface ActivityTimelineProps {
  /** Record comments */
  comments: RecordComment[];
  /** Comment permissions */
  permissions: CommentPermissions;
  /** Current user ID */
  currentUserId?: string;
  /** Workspace users for @mentions and avatars */
  workspaceUsers?: Array<{ id: string; name: string; avatar?: string }>;
  /** Loading state */
  isLoading?: boolean;
  /** Comment handlers */
  onCommentAdd?: (content: string) => Promise<void>;
  onCommentUpdate?: (commentId: string, content: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  /** Image upload handler */
  onImageUpload?: (file: File) => Promise<string>;
  /** Locale */
  locale?: string;
  /** CSS class name */
  className?: string;
}

/**
 * Activity timeline showing comments only
 */
export function ActivityTimeline({
  comments,
  permissions,
  currentUserId,
  workspaceUsers,
  isLoading = false,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
  onImageUpload,
  locale = 'vi',
  className = '',
}: ActivityTimelineProps) {
  // Labels (i18n)
  const labels = {
    comments: locale === 'vi' ? 'Bình luận' : 'Comments',
    noComments: locale === 'vi' ? 'Chưa có bình luận nào' : 'No comments yet',
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <MessageSquare className="h-4 w-4" />
          <span>{labels.comments}</span>
          <span className="text-xs text-muted-foreground font-normal">({comments.length})</span>
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {/* Comment Editor - only show if user has create permission */}
            {permissions.canCreate && onCommentAdd && (
              <>
                <RichCommentEditor
                  placeholder={
                    locale === 'vi'
                      ? 'Viết bình luận... (Ctrl+Enter để gửi)'
                      : 'Add a comment... (Ctrl+Enter to submit)'
                  }
                  onSubmit={onCommentAdd}
                  workspaceUsers={workspaceUsers}
                  onImageUpload={onImageUpload}
                />
                <Separator />
              </>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{labels.noComments}</div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    canUpdate={permissions.canUpdate(comment.userId)}
                    canDelete={permissions.canDelete(comment.userId)}
                    onUpdate={onCommentUpdate}
                    onDelete={onCommentDelete}
                    workspaceUsers={workspaceUsers}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
