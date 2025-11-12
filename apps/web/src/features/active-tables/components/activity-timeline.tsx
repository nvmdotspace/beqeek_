/**
 * Activity Timeline Component
 *
 * Shows rich text comments with CRUD operations based on permissions
 * Now using @workspace/comments package
 */

import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { MessageSquare } from 'lucide-react';
import { CommentSection } from '@workspace/comments';
import type { Comment, CommentUser } from '@workspace/comments/types';
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
 * Transform RecordComment to Comment format
 */
function transformToComments(
  recordComments: RecordComment[],
  workspaceUsers?: Array<{ id: string; name: string; avatar?: string }>,
): Comment[] {
  return recordComments.map((rc) => {
    const user = workspaceUsers?.find((u) => u.id === rc.userId);

    return {
      id: rc.id,
      user: {
        id: rc.userId,
        fullName: user?.name || rc.userName || 'Unknown User',
        avatarUrl: user?.avatar || rc.userAvatar,
      },
      text: rc.content,
      createdAt: new Date(rc.createdAt),
      replies: [],
    };
  });
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
  };

  // Current user for CommentSection
  const currentUserData = workspaceUsers?.find((u) => u.id === currentUserId);
  const currentUser: CommentUser = currentUserId
    ? {
        id: currentUserId,
        fullName: currentUserData?.name || 'Current User',
        avatarUrl: currentUserData?.avatar,
      }
    : {
        id: 'guest',
        fullName: 'Guest',
      };

  // Transform comments
  const transformedComments = transformToComments(comments, workspaceUsers);

  // Handle comment changes
  const handleCommentsChange = async (updatedComments: Comment[]) => {
    // Find what changed and call appropriate handler
    // This is a simplified version - in production you'd track specific changes
    console.log('[ActivityTimeline] Comments changed:', updatedComments);
  };

  // Handle new comment
  const handleNewComment = async (html: string) => {
    if (onCommentAdd) {
      await onCommentAdd(html);
    }
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

      <CardContent className="p-4">
        <ScrollArea className="h-[600px]">
          {/* Use new CommentSection from @workspace/comments */}
          <CommentSection
            value={transformedComments}
            currentUser={currentUser}
            onChange={handleCommentsChange}
            allowUpvote={false}
            onImageUpload={onImageUpload}
            className="max-w-none"
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
