import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

interface Comment {
  id: string;
  workspaceId: string;
  recordId: string;
  userId: string;
  content: string;
  parentId?: string;
  mentions?: string[];
  attachments?: Attachment[];
  reactions?: Reaction[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Reaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

interface Action {
  id: string;
  workspaceId: string;
  recordId: string;
  userId: string;
  type: 'status_change' | 'assignment' | 'priority_change' | 'field_update' | 'custom';
  description: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '8001',
    workspaceId: '1001',
    recordId: '5001',
    userId: '2001',
    content: 'This task looks good, but we need to add validation for the email field.',
    mentions: ['2002'],
    attachments: [],
    reactions: [{ emoji: '👍', userId: '2002', createdAt: '2024-01-01T01:00:00Z' }],
    isEdited: false,
    createdAt: '2024-01-01T00:30:00Z',
    updatedAt: '2024-01-01T00:30:00Z',
  },
  {
    id: '8002',
    workspaceId: '1001',
    recordId: '5001',
    userId: '2002',
    content: "Agreed! I'll add the email validation. Should we also add password strength requirements?",
    parentId: '8001',
    mentions: ['2001'],
    attachments: [],
    reactions: [],
    isEdited: false,
    createdAt: '2024-01-01T01:15:00Z',
    updatedAt: '2024-01-01T01:15:00Z',
  },
];

// Mock actions data
const mockActions: Action[] = [
  {
    id: '9001',
    workspaceId: '1001',
    recordId: '5001',
    userId: '2001',
    type: 'status_change',
    description: 'Changed status from "Todo" to "In Progress"',
    oldValue: 'todo',
    newValue: 'in_progress',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '9002',
    workspaceId: '1001',
    recordId: '5001',
    userId: '2002',
    type: 'assignment',
    description: 'Assigned to John Doe',
    oldValue: null,
    newValue: '2002',
    metadata: { assigneeName: 'John Doe' },
    createdAt: '2024-01-01T00:15:00Z',
  },
  {
    id: '9003',
    workspaceId: '1001',
    recordId: '5002',
    userId: '2001',
    type: 'priority_change',
    description: 'Changed priority from "Medium" to "High"',
    oldValue: 'medium',
    newValue: 'high',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

export const commentsActionsHandlers = [
  // POST /api/workspace/{workspaceId}/workflow/get/records/{recordId}/comments
  http.post('/api/workspace/:workspaceId/workflow/get/records/:recordId/comments', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, recordId } = params;

    try {
      const body = (await request.json()) as QueryRequest;

      let comments = mockComments.filter(
        (comment) => comment.workspaceId === workspaceId && comment.recordId === recordId,
      );

      // Apply filtering if specified
      if (body.queries?.filtering) {
        if (body.queries.filtering.search && typeof body.queries.filtering.search === 'string') {
          const searchTerm = body.queries.filtering.search.toLowerCase();
          comments = comments.filter((comment) => comment.content.toLowerCase().includes(searchTerm));
        }

        if (body.queries.filtering.userId) {
          comments = comments.filter((comment) => comment.userId === body.queries?.filtering?.userId);
        }

        if (body.queries.filtering.parentId !== undefined) {
          if (body.queries.filtering.parentId === null) {
            // Get top-level comments only
            comments = comments.filter((comment) => !comment.parentId);
          } else {
            // Get replies to specific comment
            comments = comments.filter((comment) => comment.parentId === body.queries?.filtering?.parentId);
          }
        }
      }

      // Apply sorting if specified
      if (body.queries?.sorting && typeof body.queries.sorting === 'object') {
        const sorting = body.queries.sorting as { field: string; direction: 'asc' | 'desc' };
        const { field, direction } = sorting;
        comments.sort((a, b) => {
          const aValue = a[field as keyof Comment];
          const bValue = b[field as keyof Comment];

          if (aValue === undefined || bValue === undefined) return 0;

          if (direction === 'desc') {
            return aValue > bValue ? -1 : 1;
          }
          return aValue > bValue ? 1 : -1;
        });
      } else {
        // Default sort by creation date
        comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      // Apply pagination
      const page = body.queries?.pagination?.page || 1;
      const perPage = body.queries?.pagination?.per_page || 50;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedComments = comments.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: paginatedComments,
        meta: {
          current_page: page,
          last_page: Math.ceil(comments.length / perPage),
          per_page: perPage,
          total: comments.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/records/{recordId}/comments
  http.post('/api/workspace/:workspaceId/workflow/post/records/:recordId/comments', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, recordId } = params;

    try {
      const body = (await request.json()) as MutationRequest<{
        content: string;
        parentId?: string;
        mentions?: string[];
        attachments?: Attachment[];
      }>;

      if (!body.data?.content?.trim()) {
        return HttpResponse.json({ message: 'Comment content is required' }, { status: 400 });
      }

      const newComment: Comment = {
        id: mockStore.generateId(),
        workspaceId: workspaceId as string,
        recordId: recordId as string,
        userId: userId,
        content: body.data.content,
        parentId: body.data.parentId,
        mentions: body.data.mentions || [],
        attachments: body.data.attachments || [],
        reactions: [],
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockComments.push(newComment);

      return HttpResponse.json({
        data: newComment,
        success: true,
        message: 'Comment created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/patch/comments/{commentId}
  http.post('/api/workspace/:workspaceId/workflow/patch/comments/:commentId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, commentId } = params;

    const commentIndex = mockComments.findIndex((c) => c.id === commentId && c.workspaceId === workspaceId);

    if (commentIndex === -1) {
      return HttpResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    const comment = mockComments[commentIndex];

    if (!comment) {
      return HttpResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return HttpResponse.json({ message: 'You can only edit your own comments' }, { status: 403 });
    }

    try {
      const body = (await request.json()) as MutationRequest<{
        content?: string;
        mentions?: string[];
      }>;

      if (body.data?.content !== undefined && !body.data.content.trim()) {
        return HttpResponse.json({ message: 'Comment content cannot be empty' }, { status: 400 });
      }

      const updatedComment: Comment = {
        ...comment,
        content: body.data?.content || comment.content,
        mentions: body.data?.mentions || comment.mentions,
        isEdited: true,
        updatedAt: new Date().toISOString(),
      };

      mockComments[commentIndex] = updatedComment;

      return HttpResponse.json({
        data: updatedComment,
        success: true,
        message: 'Comment updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/delete/comments/{commentId}
  http.post('/api/workspace/:workspaceId/workflow/delete/comments/:commentId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, commentId } = params;

    const commentIndex = mockComments.findIndex((c) => c.id === commentId && c.workspaceId === workspaceId);

    if (commentIndex === -1) {
      return HttpResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    const comment = mockComments[commentIndex];

    if (!comment) {
      return HttpResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return HttpResponse.json({ message: 'You can only delete your own comments' }, { status: 403 });
    }

    // Also delete all replies to this comment
    const repliesToDelete = mockComments
      .map((c, index) => ({ comment: c, index }))
      .filter(({ comment: c }) => c.parentId === commentId)
      .map(({ index }) => index)
      .sort((a, b) => b - a); // Sort in descending order to avoid index issues

    repliesToDelete.forEach((index) => mockComments.splice(index, 1));
    mockComments.splice(commentIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/comments/{commentId}/reactions
  http.post('/api/workspace/:workspaceId/workflow/post/comments/:commentId/reactions', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, commentId } = params;

    const commentIndex = mockComments.findIndex((c) => c.id === commentId && c.workspaceId === workspaceId);

    if (commentIndex === -1) {
      return HttpResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as MutationRequest<{
        emoji: string;
      }>;

      if (!body.data?.emoji) {
        return HttpResponse.json({ message: 'Emoji is required' }, { status: 400 });
      }

      const comment = mockComments[commentIndex];

      if (!comment) {
        return HttpResponse.json({ message: 'Comment not found' }, { status: 404 });
      }

      const reactions = comment.reactions || [];

      // Check if user already reacted with this emoji
      const existingReactionIndex = reactions.findIndex((r) => r.userId === userId && r.emoji === body.data.emoji);

      if (existingReactionIndex !== -1) {
        // Remove existing reaction (toggle)
        reactions.splice(existingReactionIndex, 1);
      } else {
        // Add new reaction
        reactions.push({
          emoji: body.data.emoji,
          userId: userId,
          createdAt: new Date().toISOString(),
        });
      }

      mockComments[commentIndex] = {
        ...comment,
        reactions,
      };

      return HttpResponse.json({
        data: { reactions },
        success: true,
        message: 'Reaction updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/get/records/{recordId}/actions
  http.post('/api/workspace/:workspaceId/workflow/get/records/:recordId/actions', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, recordId } = params;

    try {
      const body = (await request.json()) as QueryRequest;

      let actions = mockActions.filter((action) => action.workspaceId === workspaceId && action.recordId === recordId);

      // Apply filtering if specified
      if (body.queries?.filtering) {
        if (body.queries.filtering.type) {
          actions = actions.filter((action) => action.type === body.queries?.filtering?.type);
        }

        if (body.queries.filtering.userId) {
          actions = actions.filter((action) => action.userId === body.queries?.filtering?.userId);
        }
      }

      // Apply sorting (default by creation date, newest first)
      actions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      const page = body.queries?.pagination?.page || 1;
      const perPage = body.queries?.pagination?.per_page || 50;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedActions = actions.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: paginatedActions,
        meta: {
          current_page: page,
          last_page: Math.ceil(actions.length / perPage),
          per_page: perPage,
          total: actions.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/records/{recordId}/actions
  http.post('/api/workspace/:workspaceId/workflow/post/records/:recordId/actions', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, recordId } = params;

    try {
      const body = (await request.json()) as MutationRequest<{
        type: Action['type'];
        description: string;
        oldValue?: unknown;
        newValue?: unknown;
        metadata?: Record<string, unknown>;
      }>;

      if (!body.data?.type || !body.data?.description) {
        return HttpResponse.json({ message: 'Type and description are required' }, { status: 400 });
      }

      const newAction: Action = {
        id: mockStore.generateId(),
        workspaceId: workspaceId as string,
        recordId: recordId as string,
        userId: userId,
        type: body.data.type,
        description: body.data.description,
        oldValue: body.data.oldValue,
        newValue: body.data.newValue,
        metadata: body.data.metadata,
        createdAt: new Date().toISOString(),
      };

      mockActions.push(newAction);

      return HttpResponse.json({
        data: newAction,
        success: true,
        message: 'Action recorded successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),
];
