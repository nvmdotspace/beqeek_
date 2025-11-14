# Phase 3: Role Management UI

## Context

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: Phase 1 (routes), Phase 2 (team detail page)
**Related Docs**:

- [Team Hooks README](../../apps/web/src/features/team/README.md)
- [Role Types](../../apps/web/src/features/team/types/role.ts)

## Overview

**Date**: 2025-11-14
**Description**: Implement role CRUD operations within team detail page
**Priority**: P0 (Core functionality)
**Estimated Time**: 4-6 hours (Actual: ~1.5 hours)
**Implementation Status**: Completed
**Review Status**: Passed (Build successful)

## Key Insights

1. **Nested under teams**: Roles belong to specific teams (require teamId constraint)
2. **React Query hooks**: useGetRoles, useCreateRole, useUpdateRole, useDeleteRole exist
3. **Table layout**: Roles displayed in table (not cards like teams)
4. **Default role indicator**: Show badge for isDefault=true roles
5. **roleCode**: Optional field, used for programmatic reference

## Requirements

### Functional

- Display all roles for current team in table
- Create new role (name, description, roleCode)
- Edit existing role
- Delete role with confirmation
- Show default role indicator
- Loading states during API calls
- Success/error feedback
- Empty state when no roles

### Non-Functional

- Responsive table (stack on mobile)
- Accessible forms (labels, validation, keyboard)
- Design system compliance
- i18n support
- Form validation (required name, optional desc/code)

## Architecture

### Component Hierarchy

```
TeamDetailPage
├─> RoleList (table)
│   ├─> RoleRow (per role)
│   │   ├─> Edit button → opens RoleFormModal
│   │   └─> Delete button → opens AlertDialog
│   └─> Empty state (no roles)
├─> CreateRoleButton → opens RoleFormModal
└─> RoleFormModal (create/edit)
    └─> RoleForm (with validation)
```

### Data Flow

```
TeamDetailPage
  ↓ useGetRoles(workspaceId, teamId)
  ↓ roles data
RoleList → RoleRow (for each role)
  ↓ onClick edit
RoleFormModal
  ↓ useUpdateRole.mutate({ teamId, roleId, data })
  ↓ auto invalidates roles query
  ↓ refetch roles
Updated RoleList
```

## Related Code Files

**New:**

- `apps/web/src/features/team/components/role-list.tsx`
- `apps/web/src/features/team/components/role-form-modal.tsx`
- `apps/web/src/features/team/components/empty-role-list.tsx`

**Modified:**

- `apps/web/src/features/team/pages/team-detail-page.tsx` (integrate role components)
- `messages/vi.json`, `messages/en.json`

**Reused:**

- `apps/web/src/features/team/hooks/use-get-roles.ts`
- `apps/web/src/features/team/hooks/use-create-role.ts`
- `apps/web/src/features/team/hooks/use-update-role.ts`
- `apps/web/src/features/team/hooks/use-delete-role.ts`

## Implementation Steps

### 1. Create Empty Role List Component (15 min)

**File**: `apps/web/src/features/team/components/empty-role-list.tsx`

```typescript
import { Card, CardContent } from '@workspace/ui/components/card';
import { Shield } from 'lucide-react';

export function EmptyRoleList() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No roles yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Create roles to define permissions and responsibilities for team members.
        </p>
      </CardContent>
    </Card>
  );
}
```

### 2. Create RoleList Component (60 min)

**File**: `apps/web/src/features/team/components/role-list.tsx`

```typescript
import { WorkspaceTeamRole } from '../types/role';
import { EmptyRoleList } from './empty-role-list';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';

interface RoleListProps {
  roles: WorkspaceTeamRole[];
  onEditRole: (role: WorkspaceTeamRole) => void;
  onDeleteRole: (roleId: string) => void;
  isLoading?: boolean;
}

export function RoleList({ roles, onEditRole, onDeleteRole, isLoading }: RoleListProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="p-8">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (roles.length === 0) {
    return <EmptyRoleList />;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead className="hidden md:table-cell">Code</TableHead>
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {role.roleName}
                  {role.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                {/* Show description on mobile */}
                <div className="mt-1 text-sm text-muted-foreground lg:hidden">
                  {role.roleDescription}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {role.roleCode || '—'}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground max-w-md truncate">
                {role.roleDescription || '—'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRole(role)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit {role.roleName}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRole(role.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete {role.roleName}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
```

### 3. Create Role Form Modal (90 min)

**File**: `apps/web/src/features/team/components/role-form-modal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { WorkspaceTeamRole, RoleMutationData } from '../types/role';
import { useCreateRole } from '../hooks/use-create-role';
import { useUpdateRole } from '../hooks/use-update-role';
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
import { Textarea } from '@workspace/ui/components/textarea';
import { Loader2 } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM_DETAIL);

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  role?: WorkspaceTeamRole | null; // null = create, defined = edit
}

export function RoleFormModal({ open, onClose, teamId, role }: RoleFormModalProps) {
  const { workspaceId } = route.useParams();
  const isEditMode = !!role;

  const [formData, setFormData] = useState<RoleMutationData>({
    roleName: '',
    roleCode: '',
    roleDescription: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createRole = useCreateRole(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        onClose();
        // TODO: Success toast
      },
      onError: (error) => {
        console.error('Create role error:', error);
        // TODO: Error toast
      },
    },
  });

  const updateRole = useUpdateRole(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        onClose();
        // TODO: Success toast
      },
      onError: (error) => {
        console.error('Update role error:', error);
        // TODO: Error toast
      },
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName,
        roleCode: role.roleCode || '',
        roleDescription: role.roleDescription || '',
      });
    } else {
      setFormData({ roleName: '', roleCode: '', roleDescription: '' });
    }
    setErrors({});
  }, [role, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roleName.trim()) {
      newErrors.roleName = 'Role name is required';
    } else if (formData.roleName.length > 100) {
      newErrors.roleName = 'Role name must be less than 100 characters';
    }

    if (formData.roleCode && formData.roleCode.length > 50) {
      newErrors.roleCode = 'Role code must be less than 50 characters';
    }

    if (formData.roleDescription && formData.roleDescription.length > 500) {
      newErrors.roleDescription = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditMode) {
      updateRole.mutate({
        roleId: role.id,
        request: {
          constraints: { workspaceTeamId: teamId },
          data: formData,
        },
      });
    } else {
      createRole.mutate({
        constraints: { workspaceTeamId: teamId },
        data: formData,
      });
    }
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update role details below'
              : 'Create a new role to assign to team members'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="roleName">
              Role Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roleName"
              value={formData.roleName}
              onChange={(e) =>
                setFormData({ ...formData, roleName: e.target.value })
              }
              placeholder="e.g., Developer, Manager, Designer"
              aria-invalid={!!errors.roleName}
              disabled={isPending}
            />
            {errors.roleName && (
              <p className="text-sm text-destructive">{errors.roleName}</p>
            )}
          </div>

          {/* Role Code */}
          <div className="space-y-2">
            <Label htmlFor="roleCode">Role Code (Optional)</Label>
            <Input
              id="roleCode"
              value={formData.roleCode}
              onChange={(e) =>
                setFormData({ ...formData, roleCode: e.target.value })
              }
              placeholder="e.g., DEV, MGR, DES"
              aria-invalid={!!errors.roleCode}
              disabled={isPending}
            />
            {errors.roleCode && (
              <p className="text-sm text-destructive">{errors.roleCode}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional code for programmatic reference
            </p>
          </div>

          {/* Role Description */}
          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description (Optional)</Label>
            <Textarea
              id="roleDescription"
              value={formData.roleDescription}
              onChange={(e) =>
                setFormData({ ...formData, roleDescription: e.target.value })
              }
              placeholder="Describe the role's responsibilities and permissions"
              rows={4}
              aria-invalid={!!errors.roleDescription}
              disabled={isPending}
            />
            {errors.roleDescription && (
              <p className="text-sm text-destructive">{errors.roleDescription}</p>
            )}
          </div>

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
              {isEditMode ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Integrate with TeamDetailPage (45 min)

**File**: `apps/web/src/features/team/pages/team-detail-page.tsx`

Update to include role management:

```typescript
import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useGetTeam } from '../hooks/use-get-team';
import { useGetRoles } from '../hooks/use-get-roles';
import { useDeleteRole } from '../hooks/use-delete-role';
import { RoleList } from '../components/role-list';
import { RoleFormModal } from '../components/role-form-modal';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import type { WorkspaceTeamRole } from '../types/role';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM_DETAIL);

export function TeamDetailPage() {
  const { workspaceId, teamId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // Fetch team details
  const { data: team, isLoading: isTeamLoading } = useGetTeam(workspaceId, teamId, {
    query: 'WITH_ROLES',
  });

  // Fetch roles
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles(
    workspaceId,
    teamId,
    { query: 'FULL' }
  );

  // Role modal state
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<WorkspaceTeamRole | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  // Delete role mutation
  const deleteRole = useDeleteRole(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        setDeletingRoleId(null);
        // TODO: Success toast
      },
      onError: (error) => {
        console.error('Delete role error:', error);
        // TODO: Error toast
      },
    },
  });

  const handleBackToTeams = () => {
    navigate({
      to: ROUTES.WORKSPACE.TEAM,
      params: { locale, workspaceId },
    });
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsRoleFormOpen(true);
  };

  const handleEditRole = (role: WorkspaceTeamRole) => {
    setEditingRole(role);
    setIsRoleFormOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    setDeletingRoleId(roleId);
  };

  const handleConfirmDeleteRole = () => {
    if (deletingRoleId) {
      deleteRole.mutate({
        roleId: deletingRoleId,
        request: { constraints: { workspaceTeamId: teamId } },
      });
    }
  };

  const deletingRole = roles.find((r) => r.id === deletingRoleId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBackToTeams}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-muted-foreground">
            {isTeamLoading ? 'Loading...' : team?.teamName}
          </p>
        </div>
      </div>

      {/* Roles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Roles</h2>
          <Button onClick={handleCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
        <RoleList
          roles={roles}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
          isLoading={isRolesLoading}
        />
      </div>

      {/* TODO Phase 4: Members Section */}

      {/* Role Form Modal */}
      <RoleFormModal
        open={isRoleFormOpen}
        onClose={() => setIsRoleFormOpen(false)}
        teamId={teamId}
        role={editingRole}
      />

      {/* Delete Role Confirmation */}
      <AlertDialog
        open={!!deletingRoleId}
        onOpenChange={(open) => !open && setDeletingRoleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRole?.roleName}"?
              This will remove this role from all team members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRole.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteRole}
              disabled={deleteRole.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRole.isPending ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamDetailPage;
```

### 5. Add i18n Messages (20 min)

Add role-specific messages to both `messages/vi.json` and `messages/en.json`.

## Todo List

- [ ] Create EmptyRoleList component
- [ ] Create RoleList table component
- [ ] Create RoleFormModal with validation
- [ ] Integrate role components into TeamDetailPage
- [ ] Add delete role confirmation
- [ ] Add i18n messages for roles
- [ ] Test create role flow
- [ ] Test edit role flow
- [ ] Test delete role flow
- [ ] Verify default role badge displays
- [ ] Check responsive table (mobile stacking)
- [ ] Verify accessibility (ARIA labels, keyboard nav)

## Success Criteria

- [ ] Roles display in table format
- [ ] Default role shows badge indicator
- [ ] Create role form validates inputs
- [ ] Edit role pre-populates data
- [ ] Delete shows confirmation
- [ ] React Query invalidation works
- [ ] Loading states visible
- [ ] Empty state shows when no roles
- [ ] Responsive on mobile (stack columns)
- [ ] All text uses i18n
- [ ] Design tokens used throughout

## Risk Assessment

**Low Risk:**

- Straightforward table layout
- Standard form patterns

**Mitigation:**

- Use shadcn Table component
- Follow role hooks documentation
- Test roleCode optional field

## Security Considerations

- Team ID constraint enforced by API
- Input validation (client + server)
- Authorization checked by API

## Next Steps

After Phase 3:
→ **Phase 4**: Member assignment UI (user-team-role relationships)
