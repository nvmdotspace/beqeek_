import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

export const workspaceHandlers = [
  // POST /api/user/me/get/workspaces
  http.post('/api/user/me/get/workspaces', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as QueryRequest;
      const workspaces = mockStore.getUserWorkspaces(userId);

      // Apply field selection if specified
      let responseData = workspaces;
      if (body.queries?.fields) {
        // In a real implementation, you'd filter fields based on the fields parameter
        // For now, we'll return the full objects
        responseData = workspaces;
      }

      return HttpResponse.json({
        data: responseData,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: workspaces.length,
        },
      });
    } catch {
      // If no body provided, return all workspaces
      const workspaces = mockStore.getUserWorkspaces(userId);

      return HttpResponse.json({
        data: workspaces,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: workspaces.length,
        },
      });
    }
  }),

  // POST /api/user/me/get/workspaces/{workspaceId}
  http.post('/api/user/me/get/workspaces/:workspaceId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const workspace = mockStore.getWorkspace(workspaceId as string);

    if (!workspace) {
      return HttpResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    // Check if user has access to this workspace
    if (workspace.ownedBy !== userId) {
      return HttpResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    try {
      const body = (await request.json()) as QueryRequest;

      // Apply field selection if specified
      let responseData = workspace;
      if (body.queries?.fields) {
        // In a real implementation, you'd filter fields based on the fields parameter
        responseData = workspace;
      }

      return HttpResponse.json({
        data: responseData,
      });
    } catch {
      // If no body provided, return full workspace
      return HttpResponse.json({
        data: workspace,
      });
    }
  }),
];
