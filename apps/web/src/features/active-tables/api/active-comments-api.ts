import { apiRequest } from '@/shared/api/http-client';

export interface Comment {
  id: string;
  parentId?: string;
  commentContent: string;
  hashed_keywords?: Record<string, unknown>;
  createdBy: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CommentsResponse {
  data: Comment[];
  next_id?: string | null;
  previous_id?: string | null;
  limit?: number;
}

export interface CommentQueryParams {
  paging?: 'cursor';
  filtering?: Record<string, unknown>;
  next_id?: string | null;
  direction?: 'asc' | 'desc';
  limit?: number;
}

export interface CreateCommentRequest {
  commentContent: string;
  parentId?: string;
  mentions?: string[];
  hashed_keywords?: Record<string, unknown>;
}

export interface UpdateCommentRequest {
  commentContent: string;
  mentions?: string[];
  hashed_keywords?: Record<string, unknown>;
}

// Endpoints
const commentsEndpoint = (workspaceId: string, tableId: string, recordId: string) =>
  `/api/workspace/${workspaceId}/workflow/active_tables/${tableId}/records/${recordId}/get/comments`;

const commentDetailEndpoint = (workspaceId: string, tableId: string, recordId: string, commentId: string) =>
  `/api/workspace/${workspaceId}/workflow/active_tables/${tableId}/records/${recordId}/get/comments/${commentId}`;

const createCommentEndpoint = (workspaceId: string, tableId: string, recordId: string) =>
  `/api/workspace/${workspaceId}/workflow/active_tables/${tableId}/records/${recordId}/post/comments`;

const updateCommentEndpoint = (workspaceId: string, tableId: string, recordId: string, commentId: string) =>
  `/api/workspace/${workspaceId}/workflow/active_tables/${tableId}/records/${recordId}/patch/comments/${commentId}`;

const deleteCommentEndpoint = (workspaceId: string, tableId: string, recordId: string, commentId: string) =>
  `/api/workspace/${workspaceId}/workflow/active_tables/${tableId}/records/${recordId}/delete/comments/${commentId}`;

// Read operations
export const fetchComments = (
  workspaceId: string,
  tableId: string,
  recordId: string,
  params: CommentQueryParams = {},
) =>
  apiRequest<CommentsResponse>({
    url: commentsEndpoint(workspaceId, tableId, recordId),
    method: 'POST',
    data: params,
  });

export const fetchComment = (workspaceId: string, tableId: string, recordId: string, commentId: string) =>
  apiRequest<{ data: Comment }>({
    url: commentDetailEndpoint(workspaceId, tableId, recordId, commentId),
    method: 'POST',
    data: {},
  });

// Create operations
export const createComment = (workspaceId: string, tableId: string, recordId: string, request: CreateCommentRequest) =>
  apiRequest<{ data: { id: string } }>({
    url: createCommentEndpoint(workspaceId, tableId, recordId),
    method: 'POST',
    data: request,
  });

// Update operations
export const updateComment = (
  workspaceId: string,
  tableId: string,
  recordId: string,
  commentId: string,
  request: UpdateCommentRequest,
) =>
  apiRequest<{ message: string }>({
    url: updateCommentEndpoint(workspaceId, tableId, recordId, commentId),
    method: 'POST',
    data: request,
  });

// Delete operations
export const deleteComment = (workspaceId: string, tableId: string, recordId: string, commentId: string) =>
  apiRequest<{ message: string }>({
    url: deleteCommentEndpoint(workspaceId, tableId, recordId, commentId),
    method: 'POST',
    data: {},
  });
