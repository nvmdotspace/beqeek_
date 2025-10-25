import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest, User } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

export const workspaceUserHandlers = [
  // POST /api/workspace/{workspaceId}/workspace/get/users
  http.post('*/api/workspace/:workspaceId/workspace/get/users', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as QueryRequest;
      let users = mockStore.getAllUsers();

      // Apply filtering if specified
      if (body.queries?.filtering) {
        users = users.filter(() => {
          // Example filtering by workspace team role
          if (
            body.queries?.filtering?.workspaceTeamRole &&
            typeof body.queries.filtering.workspaceTeamRole === 'object' &&
            'workspaceTeamId' in body.queries.filtering.workspaceTeamRole
          ) {
            // In real app, this would filter users by their team membership
            return true;
          }
          return true;
        });
      }

      // Add mock workspace memberships
      const usersWithMemberships = users.map((user) => ({
        ...user,
        workspaceMemberships: [
          {
            userId: user.id,
            workspaceTeamRoleId: '3001',
            workspaceTeamId: '2001',
            invitedAt: user.createdAt,
          },
        ],
      }));

      return HttpResponse.json({
        data: usersWithMemberships,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: usersWithMemberships.length,
        },
      });
    } catch {
      // If no body provided, return all users
      const users = mockStore.getAllUsers();

      return HttpResponse.json({
        data: users,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: users.length,
        },
      });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/post/users
  http.post('*/api/workspace/:workspaceId/workspace/post/users', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as MutationRequest<{
        username: string;
        password: string;
        email: string;
        fullName: string;
        phone?: string;
        phoneCountryCode?: string;
      }>;

      if (!body.constraints?.workspaceTeamId || !body.constraints?.workspaceTeamRoleId) {
        return HttpResponse.json(
          { message: 'workspaceTeamId and workspaceTeamRoleId are required in constraints' },
          { status: 400 },
        );
      }

      // Validate required fields
      const errors: Record<string, string[]> = {};
      if (!body.data.username) errors.username = ['Username is required'];
      if (!body.data.password) errors.password = ['Password is required'];
      if (!body.data.email) errors.email = ['Email is required'];
      if (!body.data.fullName) errors.fullName = ['Full name is required'];

      if (Object.keys(errors).length > 0) {
        return HttpResponse.json(
          {
            message: 'Validation failed',
            errors,
          },
          { status: 422 },
        );
      }

      // Check if username already exists
      const existingUser = mockStore.getUserByUsername(body.data.username);
      if (existingUser) {
        return HttpResponse.json(
          {
            message: 'Validation failed',
            errors: { username: ['Username already exists'] },
          },
          { status: 422 },
        );
      }

      // Create new user (in real app, this would save to database)
      const newUser: User = {
        id: mockStore.generateId(),
        fullName: body.data.fullName,
        email: body.data.email,
        phone: body.data.phone,
        phoneCountryCode: body.data.phoneCountryCode,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.data.username}`,
        thumbnailAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.data.username}&size=64`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        globalUser: { username: body.data.username },
      };

      return HttpResponse.json({
        data: newUser,
        success: true,
        message: 'User created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/post/invitations/bulk
  http.post('*/api/workspace/:workspaceId/workspace/post/invitations/bulk', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as {
        constraints: {
          workspaceTeamId: string;
          workspaceTeamRoleId: string;
        };
        data: {
          userIds: string[];
        };
      };

      if (!body.constraints?.workspaceTeamId || !body.constraints?.workspaceTeamRoleId) {
        return HttpResponse.json(
          { message: 'workspaceTeamId and workspaceTeamRoleId are required in constraints' },
          { status: 400 },
        );
      }

      if (!body.data?.userIds || !Array.isArray(body.data.userIds)) {
        return HttpResponse.json({ message: 'userIds array is required in data' }, { status: 400 });
      }

      // In real app, this would create invitations for the specified users
      // For now, we'll just return success

      return HttpResponse.json({
        success: true,
        message: `Invitations sent to ${body.data.userIds.length} users`,
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/user/get/users/via-username/{username}
  http.post('*/api/user/get/users/via-username/:username', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = mockStore.getUserByUsername(params.username as string);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as QueryRequest;

      // Apply field selection if specified
      let responseData = user;
      if (body.queries?.fields) {
        // In a real implementation, you'd filter fields based on the fields parameter
        responseData = user;
      }

      return HttpResponse.json({
        data: responseData,
      });
    } catch {
      // If no body provided, return full user
      return HttpResponse.json({
        data: user,
      });
    }
  }),
];
