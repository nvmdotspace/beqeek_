import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@workspace/ui/components/sheet';
import { toast } from '@workspace/ui/components/sonner';

import { useAuthStore } from '@/features/auth';

const selectUserId = (state: { userId: string | null }) => state.userId;

import type { ActiveTable, ActiveTableRecord } from '../../types';
import type { Comment } from '../../api/active-comments-api';
import { useRecordComments } from '../../hooks/use-record-comments';
import { useTableEncryption } from '../../hooks/use-table-encryption';
import { decryptFieldValue } from '../../utils/encryption-helpers';

import { CommentThread } from './comment-thread';
import { CommentEditor } from './comment-editor';

/**
 * CommentsPanel - Main comments panel with encryption support
 *
 * Features:
 * - Sidebar layout (desktop) / drawer (mobile)
 * - Comment list with threaded replies
 * - Encryption/decryption of comment content
 * - Edit/delete own comments
 * - Real-time updates via React Query
 * - Infinite scroll with cursor pagination
 * - Empty and loading states
 */

export interface CommentsPanelProps {
  /**
   * Workspace ID
   */
  workspaceId: string;

  /**
   * Active table data
   */
  table: ActiveTable;

  /**
   * Current record
   */
  record: ActiveTableRecord | null;

  /**
   * Whether panel is open
   */
  open: boolean;

  /**
   * Callback when panel open state changes
   */
  onOpenChange: (open: boolean) => void;
}

/**
 * Decrypt comment content using encryption key
 */
async function decryptComment(comment: Comment, encryptionKey: string | null): Promise<Comment> {
  if (!encryptionKey || !comment.commentContent) {
    return comment;
  }

  try {
    // Decrypt comment content (treat as SHORT_TEXT field)
    const decrypted = await decryptFieldValue(
      comment.commentContent,
      { type: 'SHORT_TEXT', label: 'Comment', name: 'commentContent' },
      encryptionKey
    );

    return {
      ...comment,
      commentContent: typeof decrypted === 'string' ? decrypted : comment.commentContent,
    };
  } catch (error) {
    console.error('Failed to decrypt comment:', error);
    return comment; // Return original on error
  }
}

/**
 * Encrypt comment content before saving
 */
async function encryptComment(content: string, encryptionKey: string | null): Promise<string> {
  if (!encryptionKey) {
    return content;
  }

  try {
    // Import encryption utility
    const { AES256 } = await import('@workspace/encryption-core');

    // Encrypt comment content using AES-256-CBC
    const encrypted = await AES256.encrypt(content, encryptionKey);

    // Pack with IV prefix (server expects this format)
    return AES256.packIvPrefixed(encrypted);
  } catch (error) {
    console.error('Failed to encrypt comment:', error);
    throw new Error('Failed to encrypt comment. Please try again.');
  }
}

export function CommentsPanel({ workspaceId, table, record, open, onOpenChange }: CommentsPanelProps) {
  const currentUserId = useAuthStore(selectUserId);
  const [newCommentDraft, setNewCommentDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const tableId = table.id;
  const recordId = record?.id;

  // Get encryption key if E2EE enabled
  const { isE2EEEnabled, encryptionKey, isKeyLoaded, error: encryptionError } = useTableEncryption({
    table,
    workspaceId,
  });

  // Fetch comments
  const {
    comments: rawComments,
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
  } = useRecordComments({
    workspaceId,
    tableId,
    recordId,
  });

  // Decrypt comments
  const comments = useMemo(() => {
    if (!isE2EEEnabled || !isKeyLoaded) {
      return rawComments;
    }

    return Promise.all(rawComments.map((c) => decryptComment(c, encryptionKey)));
  }, [rawComments, isE2EEEnabled, isKeyLoaded, encryptionKey]);

  const [decryptedComments, setDecryptedComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (comments instanceof Promise) {
      comments.then(setDecryptedComments);
    } else {
      setDecryptedComments(comments);
    }
  }, [comments]);

  // Filter top-level comments (no parent)
  const topLevelComments = useMemo(() => {
    return decryptedComments.filter((c) => !c.parentId);
  }, [decryptedComments]);

  // Reset drafts when record changes or panel closes
  useEffect(() => {
    if (!open || !recordId) {
      setNewCommentDraft('');
      setEditingCommentId(null);
      setEditDraft('');
    }
  }, [recordId, open]);

  /**
   * Handle new comment submission
   */
  const handleNewCommentSubmit = async () => {
    if (!recordId || !newCommentDraft.trim()) return;

    try {
      // Encrypt if E2EE enabled
      const content = isE2EEEnabled && encryptionKey
        ? await encryptComment(newCommentDraft.trim(), encryptionKey)
        : newCommentDraft.trim();

      await createComment({ commentContent: content });
      setNewCommentDraft('');
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to post comment. Please try again.');
    }
  };

  /**
   * Handle edit start
   */
  const handleEditStart = (commentId: string) => {
    const comment = decryptedComments.find((c) => c.id === commentId);
    if (!comment) return;

    setEditingCommentId(commentId);
    setEditDraft(comment.commentContent || '');
  };

  /**
   * Handle edit save
   */
  const handleEditSave = async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      // Encrypt if E2EE enabled
      const encryptedContent = isE2EEEnabled && encryptionKey
        ? await encryptComment(content.trim(), encryptionKey)
        : content.trim();

      await updateComment({
        commentId,
        payload: { commentContent: encryptedContent },
      });
      setEditingCommentId(null);
      setEditDraft('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment. Please try again.');
    }
  };

  /**
   * Handle edit cancel
   */
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditDraft('');
  };

  /**
   * Handle comment delete
   */
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  /**
   * Handle reply submission
   */
  const handleReply = async (parentId: string, content: string) => {
    if (!recordId || !content.trim()) return;

    try {
      // Encrypt if E2EE enabled
      const encryptedContent = isE2EEEnabled && encryptionKey
        ? await encryptComment(content.trim(), encryptionKey)
        : content.trim();

      await createComment({
        commentContent: encryptedContent,
        parentId,
      });
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Failed to create reply:', error);
      toast.error('Failed to post reply. Please try again.');
    }
  };

  /**
   * Handle reaction (placeholder - not implemented yet)
   */
  const handleReaction = (commentId: string, reaction: string) => {
    console.log('Reaction:', commentId, reaction);
    toast.info('Reactions coming soon!');
  };

  // Check if encryption is required but key not loaded
  const needsEncryptionKey = isE2EEEnabled && !isKeyLoaded;

  if (!record) {
    return null;
  }

  const isLoading = query.isLoading;
  const isSubmitting = isCreating || isUpdating || isDeleting;

  const panelContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="h-4 w-4" />
          Comments
        </CardTitle>
        <p className="text-xs text-muted-foreground">Record: {record.id}</p>
      </CardHeader>

      <Separator />

      {/* Encryption error */}
      {encryptionError && (
        <div className="px-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{encryptionError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Need encryption key */}
      {needsEncryptionKey && (
        <div className="px-4 pt-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This table uses end-to-end encryption. Please provide your encryption key to view comments.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Comments list */}
      <ScrollArea className="flex-1 px-4">
        <CardContent className="flex flex-col gap-2 px-0 py-4">
          {isLoading && (
            <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading comments...
            </div>
          )}

          {!isLoading && topLevelComments.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          )}

          {topLevelComments.map((comment, index) => (
            <div key={comment.id}>
              {index > 0 && <Separator className="my-2" />}
              <CommentThread
                comment={comment}
                allComments={decryptedComments}
                currentUserId={currentUserId ?? undefined}
                canEdit={Boolean(currentUserId && currentUserId === comment.createdBy?.id)}
                canDelete={Boolean(currentUserId && currentUserId === comment.createdBy?.id)}
                onEdit={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onDelete={handleDelete}
                onReply={handleReply}
                onReaction={handleReaction}
                editingCommentId={editingCommentId ?? undefined}
                editValue={editDraft}
              />
            </div>
          ))}

          {hasNextPage && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => fetchNext()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </ScrollArea>

      <Separator />

      {/* New comment editor */}
      <div className="p-4">
        <CommentEditor
          value={newCommentDraft}
          onChange={setNewCommentDraft}
          onSubmit={handleNewCommentSubmit}
          placeholder="Write a comment..."
          disabled={isSubmitting || needsEncryptionKey}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="block h-[85vh] max-h-[90vh] overflow-hidden border-t bg-background p-0 sm:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Comments</SheetTitle>
            <SheetDescription>Record: {record.id}</SheetDescription>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      {open && (
        <Card className="hidden h-full w-full max-w-md border-l bg-background sm:flex sm:flex-col">
          {panelContent}
        </Card>
      )}
    </>
  );
}
