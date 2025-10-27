import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send, Loader2, Pencil, Trash2 } from 'lucide-react';

// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { Textarea } from '@workspace/ui/components/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@workspace/ui/components/sheet';
import { toast } from '@workspace/ui/components/sonner';

import type { ActiveTableRecord } from '../types';
import { useRecordComments } from '../hooks/use-record-comments';

interface RecordCommentsPanelProps {
  workspaceId?: string;
  tableId?: string;
  record: ActiveTableRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommentTimestamp = ({ date }: { date?: string }) => {
  if (!date) return <span className="text-xs text-muted-foreground">—</span>;
  try {
    return <span className="text-xs text-muted-foreground">{new Date(date).toLocaleString()}</span>;
  } catch (error) {
    console.warn('Invalid date', error);
    return <span className="text-xs text-muted-foreground">{date}</span>;
  }
};

const CommentItem = ({
  comment,
  onEdit,
  onDelete,
}: {
  comment: {
    id: string;
    commentContent: string;
    createdAt?: string;
    createdBy?: { fullName?: string };
  };
  onEdit?: () => void;
  onDelete?: () => void;
}) => {
  const initials = useMemo(() => {
    const name = comment.createdBy?.fullName ?? 'U';
    const [first = '', second = ''] = name.split(' ');
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || 'U';
  }, [comment.createdBy?.fullName]);

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="size-9">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{comment.createdBy?.fullName ?? 'Anonymous'}</p>
            <CommentTimestamp date={comment.createdAt} />
          </div>
          <div className="flex items-center gap-2">
            {onEdit ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8" onClick={onEdit}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">{m.activeTables_comments_edit()}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{m.activeTables_comments_edit()}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            {onDelete ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={onDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{m.activeTables_comments_delete()}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{m.activeTables_comments_delete()}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">{comment.commentContent}</p>
      </div>
    </div>
  );
};

const CommentsLayout = ({
  record,
  comments,
  isLoading,
  isFetchingNext,
  hasNext,
  onLoadMore,
  draft,
  onDraftChange,
  onSubmit,
  onCancelEdit,
  isSubmitting,
  editing,
  onEdit,
  onDelete,
}: {
  record: ActiveTableRecord;
  comments: ReturnType<typeof useRecordComments>['comments'];
  isLoading: boolean;
  isFetchingNext: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onCancelEdit: () => void;
  isSubmitting: boolean;
  editing: { id: string; isEditing: boolean } | null;
  onEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}) => (
  <div className="flex h-full flex-col">
    <CardHeader className="px-4 pb-2 pt-4">
      <CardTitle className="flex items-center gap-2 text-base font-semibold">
        <MessageSquare className="h-4 w-4" />
        {m.activeTables_comments_title()}
      </CardTitle>
      <p className="text-xs text-muted-foreground">{record.id}</p>
    </CardHeader>
    <Separator />
    <ScrollArea className="flex-1 px-4">
      <CardContent className="flex flex-col gap-2 px-0 py-4">
        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {m.activeTables_comments_loading()}
          </div>
        ) : null}
        {!isLoading && !comments.length ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            {m.activeTables_comments_empty()}
          </div>
        ) : null}
        {comments.map((comment, index) => (
          <div key={comment.id}>
            {index > 0 ? <Separator className="my-2" /> : null}
            <CommentItem
              comment={comment}
              onEdit={() => onEdit(comment.id)}
              onDelete={() => onDelete(comment.id)}
            />
          </div>
        ))}
        {hasNext ? (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isFetchingNext}>
              {isFetchingNext ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {m.activeTables_comments_loadMore()}
                </>
              ) : (
                m.activeTables_comments_loadMore()
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </ScrollArea>
    <Separator />
    <div className="space-y-3 p-4">
      <Textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder={m.activeTables_comments_placeholder()}
        className="min-h-[120px]"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{m.activeTables_comments_mentionPlaceholder()}</p>
        <div className="flex items-center gap-2">
          {editing?.isEditing ? (
            <Button type="button" variant="ghost" onClick={onCancelEdit} disabled={isSubmitting}>
              {m.activeTables_comments_cancelEdit()}
            </Button>
          ) : null}
          <Button type="button" onClick={onSubmit} disabled={!draft.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {m.activeTables_comments_post()}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {editing?.isEditing ? m.activeTables_comments_edit() : m.activeTables_comments_post()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export const RecordCommentsPanel = ({ workspaceId, tableId, record, open, onOpenChange }: RecordCommentsPanelProps) => {
  const [draft, setDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const recordId = record?.id;

  const {
    comments,
    query,
    fetchNext,
    hasNextPage,
    isFetchingNextPage,
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRecordComments({ workspaceId, tableId, recordId });

  useEffect(() => {
    setDraft('');
    setEditingCommentId(null);
  }, [recordId, open]);

  const handleSubmit = async () => {
    if (!recordId || !draft.trim()) return;

    try {
      if (editingCommentId) {
        await updateComment({
          commentId: editingCommentId,
          payload: { commentContent: draft.trim() },
        });
        toast.success(m.activeTables_comments_updated());
      } else {
        await createComment({ commentContent: draft.trim() });
        toast.success(m.activeTables_comments_posted());
      }
      setDraft('');
      setEditingCommentId(null);
    } catch (error) {
      console.error('Failed to submit comment', error);
      toast.error(editingCommentId ? m.activeTables_comments_errorUpdate() : m.activeTables_comments_errorCreate());
    }
  };

  const handleEdit = (commentId: string) => {
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) return;
    setDraft(comment.commentContent ?? '');
    setEditingCommentId(commentId);
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm(m.activeTables_comments_deleteConfirm())) return;
    try {
      await deleteComment(commentId);
      toast.success(m.activeTables_comments_deleted());
    } catch (error) {
      console.error('Failed to delete comment', error);
      toast.error(m.activeTables_comments_errorDelete());
    }
  };

  if (!record || !recordId) return null;

  const isSubmitting = isCreating || isUpdating;

  const commonLayoutProps = {
    record,
    comments,
    isLoading: query.isLoading,
    isFetchingNext: isFetchingNextPage,
    hasNext: Boolean(hasNextPage),
    onLoadMore: () => fetchNext(),
    draft,
    onDraftChange: setDraft,
    onSubmit: handleSubmit,
    onCancelEdit: () => {
      setDraft('');
      setEditingCommentId(null);
    },
    isSubmitting,
    editing: editingCommentId ? { id: editingCommentId, isEditing: true } : null,
    onEdit: handleEdit,
    onDelete: handleDelete,
  } as const;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="block h-[85vh] max-h-[90vh] overflow-hidden border-t bg-background p-0 sm:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>{m.activeTables_comments_title()}</SheetTitle>
            <SheetDescription>{record.id}</SheetDescription>
          </SheetHeader>
          <CommentsLayout {...commonLayoutProps} />
        </SheetContent>
      </Sheet>
      {open ? (
        <Card className="hidden h-full w-full max-w-md border-l bg-background sm:flex sm:flex-col">
          <CommentsLayout {...commonLayoutProps} />
        </Card>
      ) : null}
    </>
  );
};
