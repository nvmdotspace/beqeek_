import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest, WorkspaceTeamRole } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

export const workspaceRoleHandlers = [
  // POST /api/workspace/{workspaceId}/workspace/get/team_roles
  http.post('/api/workspace/:workspaceId/workspace/get/team_roles', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as QueryRequest;

      if (!body.constraints?.workspaceTeamId) {
        return HttpResponse.json({ message: 'workspaceTeamId is required in constraints' }, { status: 400 });
      }

      const roles = mockStore.getTeamRoles(body.constraints.workspaceTeamId as string);

      return HttpResponse.json({
        data: roles,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: roles.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/get/p/team_roles
  http.post('/api/workspace/:workspaceId/workspace/get/p/team_roles', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as QueryRequest;

      if (!body.constraints?.workspaceTeamId) {
        return HttpResponse.json({ message: 'workspaceTeamId is required in constraints' }, { status: 400 });
      }

      let roles = mockStore.getTeamRoles(body.constraints.workspaceTeamId as string);

      // Apply filtering if specified
      if (body.queries?.filtering) {
        roles = roles.filter((role) => {
          // Example: filter by role name
          if (body.queries?.filtering?.roleName && typeof body.queries.filtering.roleName === 'string') {
            return role.roleName.toLowerCase().includes(body.queries.filtering.roleName.toLowerCase());
          }
          return true;
        });
      }

      return HttpResponse.json({
        data: roles,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: roles.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/post/team_roles
  http.post('/api/workspace/:workspaceId/workspace/post/team_roles', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as MutationRequest<Partial<WorkspaceTeamRole>>;

      if (!body.constraints?.workspaceTeamId) {
        return HttpResponse.json({ message: 'workspaceTeamId is required in constraints' }, { status: 400 });
      }

      if (!body.data.roleName) {
        return HttpResponse.json(
          {
            message: 'Validation failed',
            errors: { roleName: ['Role name is required'] },
          },
          { status: 422 },
        );
      }

      const newRole = mockStore.createRole({
        workspaceTeamId: body.constraints.workspaceTeamId as string,
        roleCode: body.data.roleCode || body.data.roleName?.toUpperCase().replace(/\s+/g, '_') || 'CUSTOM',
        roleName: body.data.roleName,
        roleDescription: body.data.roleDescription,
        isDefault: body.data.isDefault || false,
        createdBy: userId,
        labelIds: body.data.labelIds || [],
      });

      return HttpResponse.json({
        data: newRole,
        success: true,
        message: 'Role created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/patch/team_roles/{roleId}
  http.post('/api/workspace/:workspaceId/workspace/patch/team_roles/:roleId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { roleId } = params;
    const role = mockStore.getRole(roleId as string);

    if (!role) {
      return HttpResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as MutationRequest<Partial<WorkspaceTeamRole>>;

      // Update role (in real app, this would update the database)
      const updatedRole = {
        ...role,
        ...body.data,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      };
      console.log('Updated role:', updatedRole);

      return HttpResponse.json({
        success: true,
        message: 'Role updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/delete/team_roles/{roleId}
  http.post('/api/workspace/:workspaceId/workspace/delete/team_roles/:roleId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { roleId } = params;
    const role = mockStore.getRole(roleId as string);

    if (!role) {
      return HttpResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as { constraints?: { moveUsersToRoleId?: string } };
      console.log('Delete role body:', body);

      // In real app, this would handle moving users to another role if specified
      // and then delete the role from database

      return HttpResponse.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),
];
