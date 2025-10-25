import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest, WorkspaceTeam } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

export const workspaceTeamHandlers = [
  // POST /api/workspace/{workspaceId}/workspace/get/teams
  http.post('/api/workspace/:workspaceId/workspace/get/teams', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const teams = mockStore.getWorkspaceTeams(workspaceId as string);

    try {
      (await request.json()) as QueryRequest;

      return HttpResponse.json({
        data: teams,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: teams.length,
        },
      });
    } catch {
      return HttpResponse.json({
        data: teams,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: teams.length,
        },
      });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/get/p/teams
  http.post('/api/workspace/:workspaceId/workspace/get/p/teams', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;

    try {
      const body = (await request.json()) as QueryRequest;
      let teams = mockStore.getWorkspaceTeams(workspaceId as string);

      // Apply filtering if specified
      if (body.queries?.filtering) {
        // Simple filtering implementation
        // In real app, this would be more sophisticated
        teams = teams.filter((team) => {
          // Example: filter by team name
          if (body.queries?.filtering?.teamName && typeof body.queries.filtering.teamName === 'string') {
            return team.teamName.toLowerCase().includes(body.queries.filtering.teamName.toLowerCase());
          }
          return true;
        });
      }

      // Add team roles to each team if requested in fields
      const teamsWithRoles = teams.map((team) => ({
        ...team,
        teamRoles: team.teamRoleIds?.map((roleId) => mockStore.getRole(roleId)).filter(Boolean) || [],
      }));

      return HttpResponse.json({
        data: teamsWithRoles,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: teamsWithRoles.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/get/teams/{teamId}
  http.post('/api/workspace/:workspaceId/workspace/get/teams/:teamId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = params;
    const team = mockStore.getTeam(teamId as string);

    if (!team) {
      return HttpResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    // Add team roles
    const teamWithRoles = {
      ...team,
      teamRoles: team.teamRoleIds?.map((roleId) => mockStore.getRole(roleId)).filter(Boolean) || [],
    };

    return HttpResponse.json({
      data: teamWithRoles,
    });
  }),

  // POST /api/workspace/{workspaceId}/workspace/post/teams
  http.post('/api/workspace/:workspaceId/workspace/post/teams', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as MutationRequest<Partial<WorkspaceTeam>>;

      if (!body.data.teamName) {
        return HttpResponse.json(
          {
            message: 'Validation failed',
            errors: { teamName: ['Team name is required'] },
          },
          { status: 422 },
        );
      }

      const newTeam = mockStore.createTeam({
        teamName: body.data.teamName,
        teamDescription: body.data.teamDescription,
        teamRoleIds: body.data.teamRoleIds || [],
      });

      return HttpResponse.json({
        data: newTeam,
        success: true,
        message: 'Team created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/patch/teams/{teamId}
  http.post('/api/workspace/:workspaceId/workspace/patch/teams/:teamId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = params;
    const team = mockStore.getTeam(teamId as string);

    if (!team) {
      return HttpResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as MutationRequest<Partial<WorkspaceTeam>>;

      // Update team (in real app, this would update the database)
      void {
        ...team,
        ...body.data,
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json({
        success: true,
        message: 'Team updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workspace/delete/teams/{teamId}
  http.post('/api/workspace/:workspaceId/workspace/delete/teams/:teamId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = params;
    const team = mockStore.getTeam(teamId as string);

    if (!team) {
      return HttpResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    // In real app, this would delete from database
    return HttpResponse.json({
      success: true,
      message: 'Team deleted successfully',
    });
  }),
];
