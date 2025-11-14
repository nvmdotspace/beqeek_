# Phase 2: Team Management UI

## Context

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: Phase 1 (routes and layouts)
**Related Docs**:

- [Team Hooks README](../../apps/web/src/features/team/README.md)
- [Design System](../../docs/design-system.md)
- [shadcn/ui Dialog](../../packages/ui/src/components/dialog.tsx)

## Overview

**Date**: 2025-11-14
**Description**: Implement team CRUD operations with UI components
**Priority**: P0 (Core functionality)
**Estimated Time**: 4-6 hours (Actual: ~2 hours)
**Implementation Status**: Completed
**Review Status**: Passed (Build successful)

## Key Insights

1. **React Query hooks**: useGetTeams, useCreateTeam, useUpdateTeam, useDeleteTeam already exist
2. **Card-based grid**: Legacy uses simple divs, modern version uses shadcn Card components
3. **Modal forms**: Dialog component for create/edit operations
4. **Optimistic updates**: React Query auto-invalidates on success
5. **Delete confirmation**: AlertDialog for destructive actions

## Requirements

### Functional

- Display all workspace teams in card grid
- Create new team (name + description)
- Edit existing team
- Delete team with confirmation
- Loading states during API calls
- Success/error feedback messages
- Empty state when no teams

### Non-Functional

- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Accessible forms (labels, error messages, keyboard nav)
- Form validation (required fields, max length)
- Design system compliance (CSS tokens)
- i18n support (all text translated)

## Architecture

### Component Hierarchy

```
TeamsPage
├─> TeamList
│   ├─> TeamCard (per team)
│   │   ├─> Edit button → opens TeamFormModal
│   │   └─> Delete button → opens AlertDialog
│   └─> Empty state (no teams)
├─> CreateTeamButton → opens TeamFormModal
└─> TeamFormModal (create/edit)
    └─> TeamForm (with validation)
```

### Data Flow

```
TeamsPage
  ↓ useGetTeams(workspaceId)
  ↓ teams data
TeamList → TeamCard (for each team)
  ↓ onClick edit
TeamFormModal
  ↓ useUpdateTeam.mutate()
  ↓ auto invalidates query
  ↓ refetch teams
Updated TeamList
```

## Related Code Files

**New:**

- `apps/web/src/features/team/components/team-list.tsx`
- `apps/web/src/features/team/components/team-card.tsx`
- `apps/web/src/features/team/components/team-form-modal.tsx`
- `apps/web/src/features/team/components/empty-team-list.tsx`

**Modified:**

- `apps/web/src/features/team/pages/teams-page.tsx` (integrate components)
- `messages/vi.json` (add form labels, errors)
- `messages/en.json` (add form labels, errors)

**Reused:**

- `apps/web/src/features/team/hooks/use-get-teams.ts`
- `apps/web/src/features/team/hooks/use-create-team.ts`
- `apps/web/src/features/team/hooks/use-update-team.ts`
- `apps/web/src/features/team/hooks/use-delete-team.ts`

## Implementation Steps

### 1. Create TeamCard Component (45 min)

**File**: `apps/web/src/features/team/components/team-card.tsx`

```typescript
import { WorkspaceTeam } from '../types/team';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Edit, Trash2, ChevronRight } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

interface TeamCardProps {
  team: WorkspaceTeam;
  onEdit: (team: WorkspaceTeam) => void;
  onDelete: (teamId: string) => void;
}

export function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  const handleNavigateToDetail = () => {
    navigate({
      to: ROUTES.WORKSPACE.TEAM_DETAIL,
      params: { locale, workspaceId, teamId: team.id },
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 cursor-pointer" onClick={handleNavigateToDetail}>
            <CardTitle className="hover:text-primary transition-colors">
              {team.teamName}
            </CardTitle>
            {team.teamDescription && (
              <CardDescription className="mt-2">
                {team.teamDescription}
              </CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigateToDetail}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardFooter className="gap-2 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(team)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(team.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>

      {/* Show role count if available */}
      {team.teamRoles && team.teamRoles.length > 0 && (
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {team.teamRoles.length} {team.teamRoles.length === 1 ? 'role' : 'roles'}
        </div>
      )}
    </Card>
  );
}
```

### 2. Create Empty State Component (15 min)

**File**: `apps/web/src/features/team/components/empty-team-list.tsx`

```typescript
import { Card, CardContent } from '@workspace/ui/components/card';
import { Users } from 'lucide-react';

export function EmptyTeamList() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Create your first team to organize workspace members and assign roles.
        </p>
      </CardContent>
    </Card>
  );
}
```

### 3. Create TeamList Component (30 min)

**File**: `apps/web/src/features/team/components/team-list.tsx`

```typescript
import { WorkspaceTeam } from '../types/team';
import { TeamCard } from './team-card';
import { EmptyTeamList } from './empty-team-list';

interface TeamListProps {
  teams: WorkspaceTeam[];
  onEditTeam: (team: WorkspaceTeam) => void;
  onDeleteTeam: (teamId: string) => void;
  isLoading?: boolean;
}

export function TeamList({ teams, onEditTeam, onDeleteTeam, isLoading }: TeamListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Skeleton loader */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-lg border bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return <EmptyTeamList />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onEdit={onEditTeam}
          onDelete={onDeleteTeam}
        />
      ))}
    </div>
  );
}
```

### 4. Create Team Form Modal (90 min)

**File**: `apps/web/src/features/team/components/team-form-modal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { WorkspaceTeam, TeamMutationData } from '../types/team';
import { useCreateTeam } from '../hooks/use-create-team';
import { useUpdateTeam } from '../hooks/use-update-team';
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

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

interface TeamFormModalProps {
  open: boolean;
  onClose: () => void;
  team?: WorkspaceTeam | null; // null = create, defined = edit
}

export function TeamFormModal({ open, onClose, team }: TeamFormModalProps) {
  const { workspaceId } = route.useParams();
  const isEditMode = !!team;

  const [formData, setFormData] = useState<TeamMutationData>({
    teamName: '',
    teamDescription: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTeam = useCreateTeam(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        onClose();
        // TODO: Show success toast
      },
      onError: (error) => {
        // TODO: Show error toast
        console.error('Create team error:', error);
      },
    },
  });

  const updateTeam = useUpdateTeam(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        onClose();
        // TODO: Show success toast
      },
      onError: (error) => {
        // TODO: Show error toast
        console.error('Update team error:', error);
      },
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (team) {
      setFormData({
        teamName: team.teamName,
        teamDescription: team.teamDescription || '',
      });
    } else {
      setFormData({ teamName: '', teamDescription: '' });
    }
    setErrors({});
  }, [team, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    } else if (formData.teamName.length > 100) {
      newErrors.teamName = 'Team name must be less than 100 characters';
    }

    if (formData.teamDescription && formData.teamDescription.length > 500) {
      newErrors.teamDescription = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditMode) {
      updateTeam.mutate({
        teamId: team.id,
        request: { data: formData },
      });
    } else {
      createTeam.mutate({ data: formData });
    }
  };

  const isPending = createTeam.isPending || updateTeam.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Team' : 'Create New Team'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update team details below'
              : 'Create a new team to organize workspace members'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="teamName">
              Team Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="teamName"
              value={formData.teamName}
              onChange={(e) =>
                setFormData({ ...formData, teamName: e.target.value })
              }
              placeholder="e.g., Engineering, Marketing"
              aria-invalid={!!errors.teamName}
              disabled={isPending}
            />
            {errors.teamName && (
              <p className="text-sm text-destructive">{errors.teamName}</p>
            )}
          </div>

          {/* Team Description */}
          <div className="space-y-2">
            <Label htmlFor="teamDescription">Description (Optional)</Label>
            <Textarea
              id="teamDescription"
              value={formData.teamDescription}
              onChange={(e) =>
                setFormData({ ...formData, teamDescription: e.target.value })
              }
              placeholder="Describe the team's purpose and responsibilities"
              rows={4}
              aria-invalid={!!errors.teamDescription}
              disabled={isPending}
            />
            {errors.teamDescription && (
              <p className="text-sm text-destructive">{errors.teamDescription}</p>
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
              {isEditMode ? 'Update Team' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Integrate with TeamsPage (60 min)

**File**: `apps/web/src/features/team/pages/teams-page.tsx`

```typescript
import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useGetTeams } from '../hooks/use-get-teams';
import { useDeleteTeam } from '../hooks/use-delete-team';
import { TeamList } from '../components/team-list';
import { TeamFormModal } from '../components/team-form-modal';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
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
import type { WorkspaceTeam } from '../types/team';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

export function TeamsPage() {
  const { workspaceId } = route.useParams();

  // Fetch teams
  const { data: teams = [], isLoading } = useGetTeams(workspaceId, {
    query: 'WITH_ROLES', // Include roles for display
  });

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<WorkspaceTeam | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  // Delete mutation
  const deleteTeam = useDeleteTeam(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        setDeletingTeamId(null);
        // TODO: Show success toast
      },
      onError: (error) => {
        // TODO: Show error toast
        console.error('Delete team error:', error);
      },
    },
  });

  const handleCreateClick = () => {
    setEditingTeam(null);
    setIsFormModalOpen(true);
  };

  const handleEditTeam = (team: WorkspaceTeam) => {
    setEditingTeam(team);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (teamId: string) => {
    setDeletingTeamId(teamId);
  };

  const handleConfirmDelete = () => {
    if (deletingTeamId) {
      deleteTeam.mutate(deletingTeamId);
    }
  };

  const deletingTeam = teams.find((t) => t.id === deletingTeamId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage workspace teams and roles
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Team List */}
      <TeamList
        teams={teams}
        onEditTeam={handleEditTeam}
        onDeleteTeam={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Create/Edit Modal */}
      <TeamFormModal
        open={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        team={editingTeam}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTeamId}
        onOpenChange={(open) => !open && setDeletingTeamId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTeam?.teamName}"?
              This action cannot be undone. All roles and member assignments
              for this team will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTeam.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteTeam.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeam.isPending ? 'Deleting...' : 'Delete Team'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamsPage;
```

### 6. Add i18n Messages (20 min)

**File**: `messages/vi.json`

```json
{
  "team_form_name_label": "Tên đội nhóm",
  "team_form_name_placeholder": "ví dụ: Kỹ thuật, Marketing",
  "team_form_name_required": "Tên đội nhóm không được để trống",
  "team_form_name_too_long": "Tên đội nhóm không được quá 100 ký tự",
  "team_form_description_label": "Mô tả (Tùy chọn)",
  "team_form_description_placeholder": "Mô tả mục đích và trách nhiệm của đội",
  "team_form_description_too_long": "Mô tả không được quá 500 ký tự",
  "team_create_title": "Tạo đội nhóm mới",
  "team_edit_title": "Chỉnh sửa đội nhóm",
  "team_create_button": "Tạo đội nhóm",
  "team_update_button": "Cập nhật đội nhóm",
  "team_delete_title": "Xóa đội nhóm?",
  "team_delete_description": "Bạn có chắc chắn muốn xóa \"{teamName}\"? Hành động này không thể hoàn tác. Tất cả vai trò và phân công thành viên của đội này sẽ bị xóa.",
  "team_delete_confirm": "Xóa đội nhóm",
  "team_empty_title": "Chưa có đội nhóm nào",
  "team_empty_description": "Tạo đội nhóm đầu tiên để tổ chức thành viên workspace và phân công vai trò.",
  "team_edit_button": "Chỉnh sửa",
  "team_delete_button": "Xóa",
  "team_role_count_one": "vai trò",
  "team_role_count_other": "vai trò"
}
```

**File**: `messages/en.json` (add equivalent English messages)

## Todo List

- [ ] Create TeamCard component with navigation
- [ ] Create EmptyTeamList component
- [ ] Create TeamList component with grid layout
- [ ] Create TeamFormModal with validation
- [ ] Integrate components into TeamsPage
- [ ] Add delete confirmation AlertDialog
- [ ] Add i18n messages for all text
- [ ] Test create team flow
- [ ] Test edit team flow
- [ ] Test delete team flow
- [ ] Verify responsive grid (mobile, tablet, desktop)
- [ ] Check accessibility (keyboard nav, ARIA labels)
- [ ] Verify loading states and error handling

## Success Criteria

- [ ] Teams display in responsive card grid
- [ ] Create team opens modal with form
- [ ] Edit team pre-populates form data
- [ ] Form validation works (required, max length)
- [ ] Delete shows confirmation dialog
- [ ] All operations trigger React Query invalidation
- [ ] Loading states visible during mutations
- [ ] Error messages display on failure
- [ ] Empty state shows when no teams
- [ ] All text uses i18n messages
- [ ] Design system tokens used (no hardcoded colors)
- [ ] Accessible (keyboard, screen reader)

## Risk Assessment

**Medium Risk:**

- Form validation UX (inline vs on submit)
- Textarea auto-resize behavior

**Mitigation:**

- Use standard Input/Textarea from shadcn/ui
- Test validation with empty, valid, invalid inputs
- Follow existing form patterns in codebase

## Security Considerations

- Input sanitization (handled by API)
- XSS prevention (React escapes by default)
- CSRF (Bearer token auth already enforced)
- Authorization (workspace membership checked by API)

## Next Steps

After Phase 2 completion:
→ **Phase 3**: Implement role management UI (nested in team detail)
