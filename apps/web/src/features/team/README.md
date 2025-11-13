# Workspace Team & Role Feature

This feature provides complete team and role management functionality for workspaces, including React Query hooks for all CRUD operations.

## Features

### Workspace Teams

- **List Teams**: Fetch all teams in a workspace with flexible field selection
- **Get Team**: Fetch a single team by ID with optional role details
- **Create Team**: Create a new team
- **Update Team**: Update team details
- **Delete Team**: Delete a team

### Team Roles

- **List Roles**: Fetch all roles for a specific team
- **Create Role**: Create a new role for a team
- **Update Role**: Update role details
- **Delete Role**: Delete a role

## API Endpoints

Based on `/docs/swagger.yaml`:

### Teams

- `POST /api/workspace/{workspaceId}/workspace/get/p/teams` - List teams (advanced query)
- `POST /api/workspace/{workspaceId}/workspace/get/teams/{teamId}` - Get team details
- `POST /api/workspace/{workspaceId}/workspace/post/teams` - Create team
- `POST /api/workspace/{workspaceId}/workspace/patch/teams/{teamId}` - Update team
- `POST /api/workspace/{workspaceId}/workspace/delete/teams/{teamId}` - Delete team

### Roles

- `POST /api/workspace/{workspaceId}/workspace/get/p/team_roles` - List roles (advanced query)
- `POST /api/workspace/{workspaceId}/workspace/post/team_roles` - Create role
- `POST /api/workspace/{workspaceId}/workspace/patch/team_roles/{roleId}` - Update role
- `POST /api/workspace/{workspaceId}/workspace/delete/team_roles/{roleId}` - Delete role

## Usage Examples

### Fetching Teams

```tsx
import { useGetTeams, TEAM_QUERY_PRESETS } from '@/features/team';

function TeamsList() {
  // Use preset for teams with roles
  const { data: teams, isLoading } = useGetTeams(workspaceId, {
    query: 'WITH_ROLES',
  });

  // Custom query with filtering
  const { data: engineeringTeams } = useGetTeams(workspaceId, {
    query: {
      fields: 'id,teamName,teamDescription',
      filtering: {
        'teamName:contains': 'Engineering',
      },
      limit: 20,
    },
  });

  return (
    <div>
      {teams?.map((team) => (
        <div key={team.id}>
          <h3>{team.teamName}</h3>
          <p>{team.teamDescription}</p>
          <p>Roles: {team.teamRoles?.length ?? 0}</p>
        </div>
      ))}
    </div>
  );
}
```

### Fetching Roles

```tsx
import { useGetRoles, ROLE_QUERY_PRESETS } from '@/features/team';

function RolesList({ teamId }: { teamId: string }) {
  // Fetch roles for a specific team
  const { data: roles, isLoading } = useGetRoles(workspaceId, teamId, {
    query: 'FULL',
  });

  return (
    <ul>
      {roles?.map((role) => (
        <li key={role.id}>
          {role.roleName}
          {role.isDefault && <span> (Default)</span>}
        </li>
      ))}
    </ul>
  );
}
```

### Creating a Team

```tsx
import { useCreateTeam } from '@/features/team';

function CreateTeamForm() {
  const createTeam = useCreateTeam(workspaceId, {
    mutationOptions: {
      onSuccess: (team) => {
        console.log('Team created:', team);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createTeam.mutate({
      data: {
        teamName: formData.get('teamName') as string,
        teamDescription: formData.get('teamDescription') as string,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="teamName" required />
      <textarea name="teamDescription" />
      <button type="submit" disabled={createTeam.isPending}>
        Create Team
      </button>
    </form>
  );
}
```

### Creating a Role

```tsx
import { useCreateRole } from '@/features/team';

function CreateRoleForm({ teamId }: { teamId: string }) {
  const createRole = useCreateRole(workspaceId, {
    mutationOptions: {
      onSuccess: (role) => {
        console.log('Role created:', role);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createRole.mutate({
      constraints: {
        workspaceTeamId: teamId,
      },
      data: {
        roleName: formData.get('roleName') as string,
        roleDescription: formData.get('roleDescription') as string,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="roleName" required />
      <textarea name="roleDescription" />
      <button type="submit" disabled={createRole.isPending}>
        Create Role
      </button>
    </form>
  );
}
```

### Updating a Team

```tsx
import { useUpdateTeam } from '@/features/team';

function UpdateTeamForm({ team }: { team: WorkspaceTeam }) {
  const updateTeam = useUpdateTeam(workspaceId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updateTeam.mutate({
      teamId: team.id,
      request: {
        data: {
          teamName: formData.get('teamName') as string,
          teamDescription: formData.get('teamDescription') as string,
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="teamName" defaultValue={team.teamName} required />
      <textarea name="teamDescription" defaultValue={team.teamDescription} />
      <button type="submit" disabled={updateTeam.isPending}>
        Update Team
      </button>
    </form>
  );
}
```

### Deleting a Team

```tsx
import { useDeleteTeam } from '@/features/team';

function DeleteTeamButton({ teamId }: { teamId: string }) {
  const deleteTeam = useDeleteTeam(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        console.log('Team deleted successfully');
      },
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this team?')) {
      deleteTeam.mutate(teamId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteTeam.isPending}>
      Delete Team
    </button>
  );
}
```

## Query Presets

### Team Presets

```typescript
TEAM_QUERY_PRESETS = {
  BASIC: {
    fields: 'id,teamName,teamDescription',
  },
  WITH_ROLES: {
    fields: 'id,teamName,teamDescription,teamRoleIds,teamRoles{...}',
  },
  MINIMAL: {
    fields: 'id,teamName',
  },
};
```

### Role Presets

```typescript
ROLE_QUERY_PRESETS = {
  BASIC: {
    fields: 'id,workspaceTeamId,roleCode,roleName,roleDescription',
  },
  FULL: {
    fields: 'id,isDefault,workspaceTeamId,roleCode,roleName,roleDescription,...',
  },
  MINIMAL: {
    fields: 'id,roleName',
  },
};
```

## Filtering Support

### Team Filtering

Supported filters:

- `id:eq`, `id:in`
- `labelId:eq`, `labelId:in`
- `teamName:eq`, `teamName:contains`
- `teamDescription:eq`, `teamDescription:contains`
- `createdAt:eq,lte,gte,lt,gt` (format: Y-m-d H:i:s)
- `updatedAt:eq,lte,gte,lt,gt` (format: Y-m-d H:i:s)

### Role Filtering

Supported filters:

- `id:eq`, `id:in`
- `labelId:eq`, `labelId:in`
- `roleName:eq`, `roleName:contains`
- `roleDescription:eq`, `roleDescription:contains`
- `createdAt:eq,lte,gte,lt,gt` (format: Y-m-d H:i:s)
- `updatedAt:eq,lte,gte,lt,gt` (format: Y-m-d H:i:s)

## Cache Configuration

All hooks use the following cache configuration:

- **Stale Time**: 5 minutes (data considered fresh)
- **GC Time**: 10 minutes (unused data retained)
- **Retry**: 2 attempts with exponential backoff
- **Refetch on Window Focus**: Enabled

## Type Safety

All types are generated from the Swagger API specification and provide full TypeScript type safety:

```typescript
import type {
  WorkspaceTeam,
  WorkspaceTeamRole,
  TeamQueries,
  RoleQueries,
  TeamMutationData,
  RoleMutationData,
} from '@/features/team';
```

## Architecture

This feature follows the same pattern as `workspace-users`:

- **Types**: Complete type definitions from API spec
- **Query Builders**: Type-safe query construction
- **React Query Hooks**: Automatic caching, invalidation, and optimistic updates
- **Constants**: Centralized cache configuration
