/**
 * CommentsPanel Component
 *
 * Displays comments and activity history for a record
 */

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Separator } from '@workspace/ui/components/separator';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CommentsPanelProps {
  /** Record ID */
  recordId: string;

  /** Existing comments */
  comments?: Comment[];

  /** Callback when comment is added */
  onCommentAdd?: (content: string) => void;

  /** Is loading */
  loading?: boolean;

  /** Custom class name */
  className?: string;
}

/**
 * Comments panel with input and list
 */
export function CommentsPanel({
  recordId: _recordId,
  comments = [],
  onCommentAdd,
  loading = false,
  className = '',
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCommentAdd?.(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments & Activity
        </CardTitle>
      </CardHeader>

      <Separator />

      {/* Comments list */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment</p>
          </div>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </CardContent>

      <Separator />

      {/* Comment input */}
      <CardContent className="p-4 bg-muted/30">
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (Ctrl+Enter to submit)"
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Press Ctrl+Enter to submit</p>
            <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim() || isSubmitting}>
              <Send className="h-3 w-3 mr-1" />
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Individual comment item
 */
function CommentItem({ comment }: { comment: Comment }) {
  const initials = comment.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{comment.userName}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

/**
 * Generate mock comments for preview
 */
export function generateMockComments(_recordId: string): Comment[] {
  return [
    {
      id: 'comment-1',
      content: 'Started working on this task. Will have an update by EOD.',
      userId: 'user-1',
      userName: 'Alice Johnson',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'comment-2',
      content: 'Made good progress today. Completed the initial design mockups.',
      userId: 'user-1',
      userName: 'Alice Johnson',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'comment-3',
      content: 'Looks great! Can you also add dark mode support?',
      userId: 'user-2',
      userName: 'Bob Smith',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'comment-4',
      content: "Sure! I'll add that to the scope.",
      userId: 'user-1',
      userName: 'Alice Johnson',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'comment-5',
      content: 'Task is ready for review. Please check when you have time.',
      userId: 'user-1',
      userName: 'Alice Johnson',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
}
