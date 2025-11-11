/**
 * Activity Timeline Component
 *
 * Tabbed interface showing:
 * - Comments tab: Rich text comments with CRUD
 * - History tab: System activities (field changes, status updates)
 * - All Activity tab: Merged chronological view
 */

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@workspace/ui/components/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { MessageSquare, History, Activity } from 'lucide-react';
import { RichCommentEditor } from './rich-comment-editor';
import { CommentItem } from './comment-item';
import type { RecordComment, CommentPermissions } from '../hooks/use-record-comments-with-permissions';

export interface ActivityEvent {
  id: string;
  type: 'system' | 'user';
  action: string; // e.g., 'field_updated', 'status_changed', 'record_created'
  userId: string;
  userName?: string;
  description: string; // Human-readable description
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityTimelineProps {
  /** Record comments */
  comments: RecordComment[];
  /** System activities (TODO: fetch from API) */
  activities?: ActivityEvent[];
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
 * Activity timeline with comments and system events
 */
export function ActivityTimeline({
  comments,
  activities = [],
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
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'all'>('comments');

  // Merge comments and activities for "All" tab
  const mergedActivity = useMemo(() => {
    const commentEvents: ActivityEvent[] = comments.map((c) => ({
      id: `comment-${c.id}`,
      type: 'user' as const,
      action: 'comment_added',
      userId: c.userId,
      userName: c.userName,
      description: c.content,
      timestamp: c.createdAt,
      metadata: { commentId: c.id },
    }));

    return [...commentEvents, ...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [comments, activities]);

  // Tab labels (i18n)
  const labels = {
    comments: locale === 'vi' ? 'Bình luận' : 'Comments',
    history: locale === 'vi' ? 'Lịch sử' : 'History',
    all: locale === 'vi' ? 'Tất cả' : 'All Activity',
    noComments: locale === 'vi' ? 'Chưa có bình luận nào' : 'No comments yet',
    noActivity: locale === 'vi' ? 'Chưa có hoạt động nào' : 'No activity yet',
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{labels.comments}</span>
              <span className="sm:hidden">{labels.comments.slice(0, 1)}</span>
              <span className="text-xs text-muted-foreground">({comments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">{labels.history}</span>
              <span className="sm:hidden">{labels.history.slice(0, 1)}</span>
              <span className="text-xs text-muted-foreground">({activities.length})</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">{labels.all}</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
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
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-2">
                {activities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">{labels.noActivity}</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-4 rounded-lg hover:bg-muted/30 transition-colors">
                      {/* TODO: Implement ActivityItem component for system events */}
                      <div className="text-sm">
                        <span className="font-medium">{activity.userName || 'System'}</span>
                        <span className="text-muted-foreground"> {activity.description}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleString(locale)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* All Activity Tab */}
            {activeTab === 'all' && (
              <div className="space-y-2">
                {mergedActivity.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">{labels.noActivity}</div>
                ) : (
                  mergedActivity.map((item) => {
                    // Render comment
                    if (item.action === 'comment_added' && item.metadata?.commentId) {
                      const comment = comments.find((c) => c.id === item.metadata!.commentId);
                      if (comment) {
                        return (
                          <CommentItem
                            key={item.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            canUpdate={permissions.canUpdate(comment.userId)}
                            canDelete={permissions.canDelete(comment.userId)}
                            onUpdate={onCommentUpdate}
                            onDelete={onCommentDelete}
                            workspaceUsers={workspaceUsers}
                            locale={locale}
                          />
                        );
                      }
                    }

                    // Render system activity
                    return (
                      <div key={item.id} className="p-4 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="text-sm">
                          <span className="font-medium">{item.userName || 'System'}</span>
                          <span className="text-muted-foreground"> {item.description}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(item.timestamp).toLocaleString(locale)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
