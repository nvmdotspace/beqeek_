# Phase 4: Member Assignment

## Context

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: Phase 1-3 (routes, teams, roles)
**Related Docs**:

- [Workspace Users Hooks](../../apps/web/src/features/workspace-users/README.md)
- [Legacy Implementation](../../docs/html-module/workspaces-detail.blade.php) (lines 550-623, 849-896)

## Overview

**Date**: 2025-11-14
**Description**: Implement member assignment UI (link users to teams/roles)
**Priority**: P1 (Integration feature)
**Estimated Time**: 5-7 hours
**Implementation Status**: Not Started
**Review Status**: Not Started

## Key Insights

1. **Two user flows**: Invite existing user OR create new user
2. **Username lookup**: Check if user exists before create
3. **Team-role selection**: Dropdown selects (team → roles loaded dynamically)
4. **Workspace users API**: Reuse workspace-users feature hooks
5. **Member assignment**: POST /workspace/{workspaceId}/workspace/post/invitations/bulk
6. **User creation**: POST /workspace/{workspaceId}/workspace/post/users (with team/role constraints)
7. **Display members**: Two contexts (workspace-level, team-level)

## Requirements

### Functional

- Display workspace members (all teams)
- Display team members (specific team only)
- Add member form:
  - Enter username
  - Select team
  - Select role (filtered by team)
  - Optional: email, fullName
  - Conditional: password (only for new users)
- Check if username exists:
  - If exists → invite to workspace
  - If not exists → create new user
- Show team-role pairs for each member
- Filter members by team (team detail view)

### Non-Functional

- Form validation (required fields, email format)
- Dynamic role loading based on team selection
- Password field conditional visibility
- Accessible select dropdowns
- Mobile-responsive table
- i18n support

## Architecture

### Component Hierarchy

```
TeamsPage (Workspace Members)
├─> MemberList (all workspace members)
│   └─> MemberRow (shows all team-role pairs)
└─> MemberFormModal (invite or create)

TeamDetailPage (Team Members)
├─> MemberList (filtered by teamId)
│   └─> MemberRow (shows roles in this team only)
└─> MemberFormModal (pre-selects current team)
```

### Data Flow

```
MemberFormModal
  ↓ Enter username
  ↓ useUsernameLookup (API check)
  ↓ if exists → invite flow
  ↓ if not → create flow
  ↓ Select team + role
  ↓ Submit
    ├─> useInviteUser (if exists)
    └─> useCreateUser (if new)
  ↓ invalidate workspace-users query
  ↓ refetch members
Updated MemberList
```

## Related Code Files

**New:**

- `apps/web/src/features/team/components/member-list.tsx`
- `apps/web/src/features/team/components/member-form-modal.tsx`
- `apps/web/src/features/team/components/empty-member-list.tsx`
- `apps/web/src/features/team/hooks/use-username-lookup.ts` (optional utility)
- `apps/web/src/features/team/hooks/use-invite-user.ts` (wrapper)
- `apps/web/src/features/team/hooks/use-create-workspace-user.ts` (wrapper)

**Modified:**

- `apps/web/src/features/team/pages/teams-page.tsx` (add member section)
- `apps/web/src/features/team/pages/team-detail-page.tsx` (add member section)
- `messages/vi.json`, `messages/en.json`

**Reused:**

- `apps/web/src/features/workspace-users/hooks/use-get-workspace-users.ts`
- API: `/user/get/users/via-username/{username}` (username lookup)
- API: `/workspace/{workspaceId}/workspace/post/invitations/bulk` (invite)
- API: `/workspace/{workspaceId}/workspace/post/users` (create with team/role)

## Implementation Steps

### 1. Create Username Lookup Hook (30 min)

**File**: `apps/web/src/features/team/hooks/use-username-lookup.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';

interface UserLookupResult {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  avatar?: string;
}

/**
 * Check if username exists in system
 * API: POST /api/user/get/users/via-username/{username}
 */
export function useUsernameLookup(username: string, enabled: boolean = true) {
  return useQuery<UserLookupResult | null, Error>({
    queryKey: ['username-lookup', username],
    queryFn: async () => {
      if (!username || username.length < 2) return null;

      try {
        const response = await httpClient.post<{ data?: UserLookupResult }>(
          `/user/get/users/via-username/${username}`,
          {
            queries: {
              fields: 'id,username,fullName,email,avatar,thumbnailAvatar',
            },
          },
        );
        return response.data.data || null;
      } catch (error) {
        // User not found - return null (not an error case)
        return null;
      }
    },
    enabled: enabled && !!username && username.length >= 2,
    staleTime: 30 * 1000, // Cache for 30 seconds
    retry: false, // Don't retry on 404
  });
}
```

### 2. Create Invite/Create User Hooks (45 min)

**File**: `apps/web/src/features/team/hooks/use-invite-user.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';

interface InviteUserData {
  workspaceTeamId: string;
  workspaceTeamRoleId: string;
  userId: string;
}

interface InviteUserRequest {
  data: InviteUserData[];
}

export function useInviteUser(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: InviteUserRequest) => {
      const client = createActiveTablesApiClient(workspaceId);
      const response = await client.post('/workspace/post/invitations/bulk', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-users', workspaceId] });
    },
  });
}
```

**File**: `apps/web/src/features/team/hooks/use-create-workspace-user.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';

interface CreateUserData {
  username: string;
  password: string;
  email?: string;
  fullName?: string;
}

interface CreateUserRequest {
  constraints: {
    workspaceTeamId: string;
    workspaceTeamRoleId: string;
  };
  data: CreateUserData;
}

export function useCreateWorkspaceUser(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateUserRequest) => {
      const client = createActiveTablesApiClient(workspaceId);
      const response = await client.post('/workspace/post/users', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-users', workspaceId] });
    },
  });
}
```

### 3. Create Member Form Modal (120 min)

**File**: `apps/web/src/features/team/components/member-form-modal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useGetTeams } from '../hooks/use-get-teams';
import { useGetRoles } from '../hooks/use-get-roles';
import { useUsernameLookup } from '../hooks/use-username-lookup';
import { useInviteUser } from '../hooks/use-invite-user';
import { useCreateWorkspaceUser } from '../hooks/use-create-workspace-user';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  preselectedTeamId?: string; // Pre-select team (team detail view)
}

export function MemberFormModal({ open, onClose, preselectedTeamId }: MemberFormModalProps) {
  const { workspaceId } = route.useParams();

  const [username, setUsername] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(preselectedTeamId || '');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch teams
  const { data: teams = [] } = useGetTeams(workspaceId, { query: 'MINIMAL' });

  // Fetch roles for selected team
  const { data: roles = [] } = useGetRoles(
    workspaceId,
    selectedTeamId,
    { query: 'MINIMAL' },
    { enabled: !!selectedTeamId }
  );

  // Username lookup (debounced check)
  const { data: existingUser, isLoading: isCheckingUsername } = useUsernameLookup(
    username,
    username.length >= 3
  );

  const inviteUser = useInviteUser(workspaceId);
  const createUser = useCreateWorkspaceUser(workspaceId);

  useEffect(() => {
    setSelectedTeamId(preselectedTeamId || '');
  }, [preselectedTeamId, open]);

  // Reset role when team changes
  useEffect(() => {
    setSelectedRoleId('');
  }, [selectedTeamId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!selectedTeamId) {
      newErrors.teamId = 'Team is required';
    }
    if (!selectedRoleId) {
      newErrors.roleId = 'Role is required';
    }

    // If creating new user, password is required
    if (!existingUser && !password) {
      newErrors.password = 'Password is required for new users';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (existingUser) {
        // Invite existing user
        await inviteUser.mutateAsync({
          data: [{
            workspaceTeamId: selectedTeamId,
            workspaceTeamRoleId: selectedRoleId,
            userId: existingUser.id,
          }],
        });
      } else {
        // Create new user
        await createUser.mutateAsync({
          constraints: {
            workspaceTeamId: selectedTeamId,
            workspaceTeamRoleId: selectedRoleId,
          },
          data: {
            username,
            password,
            email,
            fullName,
          },
        });
      }
      onClose();
      // TODO: Success toast
    } catch (error) {
      console.error('Add member error:', error);
      // TODO: Error toast
    }
  };

  const isPending = inviteUser.isPending || createUser.isPending;
  const isNewUser = !existingUser && username.length >= 3 && !isCheckingUsername;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Invite existing user or create new account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                aria-invalid={!!errors.username}
                disabled={isPending}
              />
              {/* Username check indicator */}
              {isCheckingUsername && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {username.length >= 3 && !isCheckingUsername && existingUser && (
                <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
              )}
              {username.length >= 3 && !isCheckingUsername && !existingUser && (
                <XCircle className="absolute right-3 top-3 h-4 w-4 text-orange-600" />
              )}
            </div>
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
            {existingUser && (
              <p className="text-sm text-green-600">
                User found: {existingUser.fullName || existingUser.username}
              </p>
            )}
            {isNewUser && (
              <p className="text-sm text-orange-600">
                User not found - will create new account
              </p>
            )}
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="teamId">
              Team <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
              disabled={isPending || !!preselectedTeamId}
            >
              <SelectTrigger id="teamId">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamId && (
              <p className="text-sm text-destructive">{errors.teamId}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="roleId">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isPending || !selectedTeamId}
            >
              <SelectTrigger id="roleId">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && (
              <p className="text-sm text-destructive">{errors.roleId}</p>
            )}
          </div>

          {/* New User Fields */}
          {isNewUser && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (Optional)</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  aria-invalid={!!errors.password}
                  disabled={isPending}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingUser ? 'Invite User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Create Member List Component (60 min)

**File**: `apps/web/src/features/team/components/member-list.tsx`

```typescript
import { useGetWorkspaceUsers } from '@/features/workspace-users';
import { Card } from '@workspace/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

interface MemberListProps {
  workspaceId: string;
  teamId?: string; // Filter by team (team detail view)
  teams: Array<{ id: string; teamName: string }>;
  roles: Array<{ id: string; roleName: string; workspaceTeamId: string }>;
}

export function MemberList({ workspaceId, teamId, teams, roles }: MemberListProps) {
  // Fetch workspace users (with team filtering if needed)
  const { data: users = [], isLoading } = useGetWorkspaceUsers(workspaceId, {
    query: {
      fields: 'id,fullName,avatar,globalUser{username},workspaceMemberships{userId,workspaceTeamRoleId,workspaceTeamId}',
      filtering: teamId ? {
        workspaceTeamRole: { workspaceTeamId: teamId }
      } : undefined,
    },
  });

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <div className="p-12 text-center text-muted-foreground">
          No members yet. Add your first team member to get started.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Team - Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            // Get team-role pairs for user
            const teamRolePairs = user.workspaceMemberships
              ?.filter((m) => !teamId || m.workspaceTeamId === teamId)
              .map((m) => {
                const team = teams.find((t) => t.id === m.workspaceTeamId);
                const role = roles.find((r) => r.id === m.workspaceTeamRoleId);
                return team && role ? `${team.teamName} - ${role.roleName}` : null;
              })
              .filter(Boolean)
              .join(', ') || 'No assignment';

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.globalUser?.username || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {teamRolePairs}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
```

### 5. Integrate Members into Pages (45 min)

Update both TeamsPage and TeamDetailPage to include member sections.

**TeamsPage** - Add workspace members section.
**TeamDetailPage** - Add team members section (filtered by teamId).

### 6. Add i18n Messages (20 min)

Add member-specific messages to `messages/vi.json` and `messages/en.json`.

## Todo List

- [ ] Create use-username-lookup hook
- [ ] Create use-invite-user hook
- [ ] Create use-create-workspace-user hook
- [ ] Create MemberFormModal with conditional fields
- [ ] Create MemberList component
- [ ] Integrate members into TeamsPage
- [ ] Integrate members into TeamDetailPage
- [ ] Add i18n messages
- [ ] Test invite existing user flow
- [ ] Test create new user flow
- [ ] Test team-role selection
- [ ] Test username lookup indicator
- [ ] Verify member filtering by team
- [ ] Check form validation
- [ ] Test responsive layout

## Success Criteria

- [ ] Username lookup works (real-time check)
- [ ] Invite flow for existing users
- [ ] Create flow for new users
- [ ] Password field shows only for new users
- [ ] Team selection loads roles dynamically
- [ ] Members display with team-role pairs
- [ ] Team detail filters to team members only
- [ ] Form validation prevents invalid submissions
- [ ] All operations invalidate queries
- [ ] i18n support complete

## Risk Assessment

**Medium Risk:**

- Complex form logic (invite vs create)
- Dynamic role loading
- Username lookup debouncing

**Mitigation:**

- Follow legacy patterns closely
- Use React Query for username check
- Test both flows thoroughly

## Security Considerations

- Password transmission (HTTPS enforced)
- Input validation (username, email format)
- Authorization (API checks workspace membership)

## Next Steps

After Phase 4:
→ **Phase 5**: Polish, validation, mobile responsiveness, accessibility
