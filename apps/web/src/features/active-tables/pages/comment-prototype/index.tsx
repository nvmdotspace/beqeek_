/**
 * Multi-Reply Comments Prototype
 *
 * Flat conversation design with multi-reply support
 * - All comments at same level (no nesting)
 * - Can reply to multiple comments at once
 * - Reply references shown as indicators
 */

import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  MessageCircle,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Send,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Heading } from '@workspace/ui/components/typography';
import { Badge } from '@workspace/ui/components/badge';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';

// ============================================
// Types
// ============================================

interface CommentUser {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

interface FlatComment {
  id: string;
  user: CommentUser;
  content: string;
  createdAt: Date;
  /** IDs of comments this is replying to (multi-reply support) */
  replyToIds: string[];
}

// ============================================
// Mock Data
// ============================================

const MOCK_USERS: CommentUser[] = [
  { id: 'user-1', fullName: 'Trường Giang', avatarUrl: '' },
  { id: 'user-2', fullName: 'Minh Anh', avatarUrl: '' },
  { id: 'user-3', fullName: 'Hoàng Nam', avatarUrl: '' },
];

const CURRENT_USER: CommentUser = MOCK_USERS[0]!;

const INITIAL_COMMENTS: FlatComment[] = [
  {
    id: 'c1',
    user: MOCK_USERS[0]!,
    content: 'Deadline dự án là khi nào vậy mọi người?',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
    replyToIds: [],
  },
  {
    id: 'c2',
    user: MOCK_USERS[1]!,
    content: 'Báo cáo tuần này nộp lúc mấy giờ ạ?',
    createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
    replyToIds: [],
  },
  {
    id: 'c3',
    user: MOCK_USERS[2]!,
    content: 'Kế hoạch sprint tiếp theo có gì mới không?',
    createdAt: new Date(Date.now() - 3600000 * 12), // 12 hours ago
    replyToIds: [],
  },
  {
    id: 'c4',
    user: MOCK_USERS[0]!,
    content: 'Deadline là thứ 6 tuần này, báo cáo nộp trước 5h chiều, sprint mới sẽ focus vào tính năng comment nhé!',
    createdAt: new Date(Date.now() - 3600000 * 6), // 6 hours ago
    replyToIds: ['c1', 'c2', 'c3'], // Multi-reply to 3 comments
  },
  {
    id: 'c5',
    user: MOCK_USERS[1]!,
    content: 'Ok anh, em hiểu rồi ạ!',
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    replyToIds: ['c4'],
  },
];

// ============================================
// Helper Functions
// ============================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ============================================
// Components
// ============================================

/**
 * Reply Indicator - Shows which comments are being replied to
 * Appears above the editor when replying
 */
interface ReplyIndicatorProps {
  replyingToIds: string[];
  comments: FlatComment[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  maxVisible?: number;
}

function ReplyIndicator({ replyingToIds, comments, onRemove, onClearAll, maxVisible = 2 }: ReplyIndicatorProps) {
  const [showAll, setShowAll] = useState(false);

  if (replyingToIds.length === 0) return null;

  const replyingComments = replyingToIds
    .map((id) => comments.find((c) => c.id === id))
    .filter(Boolean) as FlatComment[];

  const visibleComments = showAll ? replyingComments : replyingComments.slice(0, maxVisible);
  const hiddenCount = replyingComments.length - maxVisible;

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <CornerDownRight className="h-3.5 w-3.5" />
          Đang trả lời {replyingToIds.length > 1 ? `${replyingToIds.length} tin nhắn` : ''}
        </span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClearAll}>
          <X className="h-3 w-3 mr-1" />
          Hủy
        </Button>
      </div>

      <div className="space-y-1.5">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="flex items-center gap-2 bg-background rounded px-2 py-1.5 group">
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarImage src={comment.user.avatarUrl} />
              <AvatarFallback className="text-[10px]">{getInitials(comment.user.fullName)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate flex-1">
              <span className="font-medium text-foreground">{comment.user.fullName}:</span>{' '}
              {truncateText(comment.content, 50)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(comment.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && !showAll && (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs mt-1.5 w-full" onClick={() => setShowAll(true)}>
          <ChevronDown className="h-3 w-3 mr-1" />
          Xem thêm {hiddenCount} tin nhắn
        </Button>
      )}

      {showAll && replyingComments.length > maxVisible && (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs mt-1.5 w-full" onClick={() => setShowAll(false)}>
          <ChevronUp className="h-3 w-3 mr-1" />
          Thu gọn
        </Button>
      )}
    </div>
  );
}

/**
 * Reply Reference Badge - Shows which comments a message is replying to
 * Displayed inline with the comment
 */
interface ReplyReferenceBadgeProps {
  replyToIds: string[];
  comments: FlatComment[];
  onJumpToComment?: (id: string) => void;
}

function ReplyReferenceBadge({ replyToIds, comments, onJumpToComment }: ReplyReferenceBadgeProps) {
  if (replyToIds.length === 0) return null;

  const replyingComments = replyToIds.map((id) => comments.find((c) => c.id === id)).filter(Boolean) as FlatComment[];

  if (replyingComments.length === 0) return null;

  // Single reply - show inline preview
  if (replyingComments.length === 1) {
    const singleComment = replyingComments[0]!;
    return (
      <button
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5 group"
        onClick={() => onJumpToComment?.(singleComment.id)}
      >
        <CornerDownRight className="h-3 w-3 flex-shrink-0" />
        <span className="truncate max-w-[200px]">
          <span className="font-medium">{singleComment.user.fullName}:</span> {truncateText(singleComment.content, 30)}
        </span>
      </button>
    );
  }

  // Multiple replies - show popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5">
          <CornerDownRight className="h-3 w-3 flex-shrink-0" />
          <span>Trả lời {replyingComments.length} tin nhắn</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <ScrollArea className="max-h-48">
          <div className="space-y-1">
            {replyingComments.map((comment) => (
              <button
                key={comment.id}
                className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted transition-colors text-left"
                onClick={() => onJumpToComment?.(comment.id)}
              >
                <Avatar className="h-5 w-5 flex-shrink-0">
                  <AvatarImage src={comment.user.avatarUrl} />
                  <AvatarFallback className="text-[10px]">{getInitials(comment.user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium block">{comment.user.fullName}</span>
                  <span className="text-xs text-muted-foreground truncate block">
                    {truncateText(comment.content, 40)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Flat Comment Card - Single comment without nesting
 */
interface FlatCommentCardProps {
  comment: FlatComment;
  allComments: FlatComment[];
  currentUser: CommentUser;
  isSelected: boolean;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
  onJumpToComment: (commentId: string) => void;
}

function FlatCommentCard({
  comment,
  allComments,
  currentUser,
  isSelected,
  onReply,
  onEdit,
  onDelete,
  onJumpToComment,
}: FlatCommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwner = comment.user.id === currentUser.id;

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className={cn('group rounded-lg p-3 transition-colors', isSelected && 'bg-primary/5 ring-1 ring-primary/20')}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatarUrl} />
          <AvatarFallback>{getInitials(comment.user.fullName)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user.fullName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: vi })}
            </span>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(comment.content)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy nội dung
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply Reference */}
          <ReplyReferenceBadge
            replyToIds={comment.replyToIds}
            comments={allComments}
            onJumpToComment={onJumpToComment}
          />

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Lưu
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => onReply(comment.id)}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Trả lời</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(comment.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Comment Editor - Input for new comments
 */
interface CommentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

function CommentEditor({ value, onChange, onSubmit, placeholder = 'Viết bình luận...', disabled }: CommentEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[80px] pr-12 text-sm resize-none"
        disabled={disabled}
      />
      <Button
        size="sm"
        className="absolute bottom-2 right-2 h-8 w-8 p-0"
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
      >
        <Send className="h-4 w-4" />
      </Button>
      <span className="absolute bottom-2 left-3 text-[10px] text-muted-foreground">Ctrl+Enter để gửi</span>
    </div>
  );
}

// ============================================
// Main Prototype Page
// ============================================

export default function MultiReplyCommentsPrototype() {
  const [comments, setComments] = useState<FlatComment[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToIds, setReplyingToIds] = useState<string[]>([]);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  // Handle adding reply target (multi-select)
  const handleReply = useCallback((commentId: string) => {
    setReplyingToIds((prev) => {
      // If already replying to this comment, remove it (toggle)
      if (prev.includes(commentId)) {
        return prev.filter((id) => id !== commentId);
      }
      // Otherwise add it to the list
      return [...prev, commentId];
    });
  }, []);

  // Handle removing a reply target
  const handleRemoveReplyTarget = useCallback((commentId: string) => {
    setReplyingToIds((prev) => prev.filter((id) => id !== commentId));
  }, []);

  // Handle clearing all reply targets
  const handleClearReplyTargets = useCallback(() => {
    setReplyingToIds([]);
  }, []);

  // Handle submitting new comment
  const handleSubmitComment = useCallback(() => {
    if (!newCommentText.trim()) return;

    const newComment: FlatComment = {
      id: `c${Date.now()}`,
      user: CURRENT_USER,
      content: newCommentText,
      createdAt: new Date(),
      replyToIds: [...replyingToIds],
    };

    setComments((prev) => [...prev, newComment]);
    setNewCommentText('');
    setReplyingToIds([]);
  }, [newCommentText, replyingToIds]);

  // Handle editing comment
  const handleEditComment = useCallback((commentId: string, newContent: string) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, content: newContent } : c)));
  }, []);

  // Handle deleting comment
  const handleDeleteComment = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    // Also remove from reply targets if present
    setReplyingToIds((prev) => prev.filter((id) => id !== commentId));
  }, []);

  // Handle jumping to a comment
  const handleJumpToComment = useCallback((commentId: string) => {
    setHighlightedCommentId(commentId);
    const element = document.getElementById(`comment-${commentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Clear highlight after animation
    setTimeout(() => setHighlightedCommentId(null), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Heading level={1} className="mb-2">
            Multi-Reply Comments Prototype
          </Heading>
          <p className="text-muted-foreground">Thiết kế hội thoại phẳng với khả năng trả lời nhiều tin nhắn cùng lúc</p>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <Heading level={4}>Hướng dẫn sử dụng</Heading>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Trả lời đơn:</strong> Click "Trả lời" trên 1 tin nhắn → Viết → Gửi
            </p>
            <p>
              <strong>Trả lời nhiều:</strong> Click "Trả lời" trên nhiều tin nhắn → Tất cả sẽ được thêm vào danh sách →
              Viết 1 tin trả lời tất cả
            </p>
            <p>
              <strong>Bỏ chọn:</strong> Click "Trả lời" lần nữa trên tin đã chọn, hoặc click X để xóa
            </p>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader className="pb-3">
            <Heading level={4} className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Bình luận ({comments.length})
            </Heading>
          </CardHeader>
          <CardContent>
            {/* Comment Editor */}
            <div className="mb-6">
              <ReplyIndicator
                replyingToIds={replyingToIds}
                comments={comments}
                onRemove={handleRemoveReplyTarget}
                onClearAll={handleClearReplyTargets}
              />
              <CommentEditor
                value={newCommentText}
                onChange={setNewCommentText}
                onSubmit={handleSubmitComment}
                placeholder={
                  replyingToIds.length > 0 ? `Trả lời ${replyingToIds.length} tin nhắn...` : 'Viết bình luận...'
                }
              />
            </div>

            {/* Selected Reply Badges */}
            {replyingToIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {replyingToIds.map((id) => {
                  const comment = comments.find((c) => c.id === id);
                  if (!comment) return null;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="pr-1 cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleRemoveReplyTarget(id)}
                    >
                      {truncateText(comment.user.fullName, 10)}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            <div className="border-t my-4" />

            {/* Comments List - Flat */}
            <div className="space-y-1">
              {comments.map((comment) => (
                <FlatCommentCard
                  key={comment.id}
                  comment={comment}
                  allComments={comments}
                  currentUser={CURRENT_USER}
                  isSelected={replyingToIds.includes(comment.id) || highlightedCommentId === comment.id}
                  onReply={handleReply}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onJumpToComment={handleJumpToComment}
                />
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Panel */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <Heading level={4}>Debug State</Heading>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
              {JSON.stringify(
                {
                  replyingToIds,
                  commentsCount: comments.length,
                  comments: comments.map((c) => ({
                    id: c.id,
                    user: c.user.fullName,
                    replyToIds: c.replyToIds,
                    content: truncateText(c.content, 30),
                  })),
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
