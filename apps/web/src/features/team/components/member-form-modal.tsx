import { useState, useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useLookupUsername } from '../hooks/use-username-lookup';
import { useInviteUser } from '../hooks/use-invite-user';
import { useCreateWorkspaceUser } from '../hooks/use-create-workspace-user';
import { useGetTeams } from '../hooks/use-get-teams';
import { useGetRoles } from '../hooks/use-get-roles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM_DETAIL);

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  preselectedTeamId?: string;
}

export function MemberFormModal({ open, onClose, preselectedTeamId }: MemberFormModalProps) {
  const { workspaceId } = route.useParams();

  // Form state
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(preselectedTeamId || '');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounce username input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username]);

  // Username lookup
  const {
    data: lookupResult,
    isLoading: isLookingUp,
    isFetching: isFetchingLookup,
  } = useLookupUsername(debouncedUsername, {
    enabled: debouncedUsername.trim().length >= 2,
  });

  // Validate that lookupResult matches current debouncedUsername to avoid race conditions
  const userExists = Boolean(
    lookupResult && lookupResult.username?.toLowerCase() === debouncedUsername.trim().toLowerCase(),
  );
  const showPasswordField = !userExists; // Always show for new users, hide after lookup confirms existing user

  // Fetch teams
  const { data: teams = [] } = useGetTeams(workspaceId, { query: 'WITH_ROLES' });

  // Fetch roles for selected team
  const { data: roles = [] } = useGetRoles(workspaceId, selectedTeamId, { query: 'FULL' });

  // Mutations
  const inviteUser = useInviteUser(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        handleClose();
      },
      onError: (error) => {
        console.error('Invite user error:', error);
        setErrors({ submit: m.member_form_invite_error() });
      },
    },
  });

  const createUser = useCreateWorkspaceUser(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        handleClose();
      },
      onError: (error) => {
        console.error('Create user error:', error);
        setErrors({ submit: m.member_form_create_error() });
      },
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setUsername('');
      setPassword('');
      setEmail('');
      setFullName('');
      setSelectedTeamId(preselectedTeamId || '');
      setSelectedRoleId('');
      setErrors({});
    }
  }, [open, preselectedTeamId]);

  // Reset role when team changes
  useEffect(() => {
    setSelectedRoleId('');
  }, [selectedTeamId]);

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setFullName('');
    setSelectedTeamId('');
    setSelectedRoleId('');
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = m.member_form_username_required();
    } else if (username.trim().length < 2) {
      newErrors.username = m.member_form_username_too_short();
    }

    if (showPasswordField && !password.trim()) {
      newErrors.password = m.member_form_password_required();
    } else if (showPasswordField && password.length < 6) {
      newErrors.password = m.member_form_password_too_short();
    }

    if (!selectedTeamId) {
      newErrors.teamId = m.member_form_team_required();
    }

    if (!selectedRoleId) {
      newErrors.roleId = m.member_form_role_required();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (userExists && lookupResult) {
      // Invite existing user - requires userId from lookup
      inviteUser.mutate({
        workspaceId,
        workspaceTeamId: selectedTeamId,
        workspaceTeamRoleId: selectedRoleId,
        userId: lookupResult.id,
      });
    } else {
      // Create new user
      createUser.mutate({
        workspaceId,
        workspaceTeamId: selectedTeamId,
        workspaceTeamRoleId: selectedRoleId,
        username: username.trim(),
        password: password.trim(),
        email: email.trim() || undefined,
        fullName: fullName.trim() || undefined,
      });
    }
  };

  const isPending = inviteUser.isPending || createUser.isPending;
  const isLookingUpUsername = isLookingUp || isFetchingLookup;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{m.member_form_title()}</DialogTitle>
          <DialogDescription>{m.member_form_description()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              {m.member_form_username_label()}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={m.member_form_username_placeholder()}
                disabled={isPending}
                aria-invalid={!!errors.username}
                className={errors.username ? 'border-destructive' : ''}
              />
              {debouncedUsername.trim().length >= 2 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isLookingUpUsername || isFetchingLookup || username !== debouncedUsername ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : userExists ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              )}
            </div>
            {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
            {debouncedUsername.trim().length >= 2 && !isLookingUpUsername && username === debouncedUsername && (
              <p className="text-sm text-muted-foreground">
                {userExists ? m.member_form_user_exists() : m.member_form_user_new()}
              </p>
            )}
          </div>

          {/* Password (conditional) */}
          {showPasswordField && (
            <div className="space-y-2">
              <Label htmlFor="password">
                {m.member_form_password_label()}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={m.member_form_password_placeholder()}
                disabled={isPending}
                aria-invalid={!!errors.password}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
          )}

          {/* Email (optional for new users) */}
          {showPasswordField && (
            <div className="space-y-2">
              <Label htmlFor="email">{m.member_form_email_label()}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={m.member_form_email_placeholder()}
                disabled={isPending}
              />
            </div>
          )}

          {/* Full Name (optional for new users) */}
          {showPasswordField && (
            <div className="space-y-2">
              <Label htmlFor="fullName">{m.member_form_fullname_label()}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={m.member_form_fullname_placeholder()}
                disabled={isPending}
              />
            </div>
          )}

          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team">
              {m.member_form_team_label()}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
              disabled={isPending || !!preselectedTeamId}
            >
              <SelectTrigger aria-invalid={!!errors.teamId} className={errors.teamId ? 'border-destructive' : ''}>
                <SelectValue placeholder={m.member_form_team_placeholder()}>
                  {selectedTeamId && teams.find((t) => t.id === selectedTeamId)?.teamName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamId && <p className="text-sm text-destructive">{errors.teamId}</p>}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">
              {m.member_form_role_label()}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isPending || !selectedTeamId || roles.length === 0}
            >
              <SelectTrigger aria-invalid={!!errors.roleId} className={errors.roleId ? 'border-destructive' : ''}>
                <SelectValue placeholder={m.member_form_role_placeholder()}>
                  {selectedRoleId &&
                    (() => {
                      const role = roles.find((r) => r.id === selectedRoleId);
                      return role ? `${role.roleName}${role.isDefault ? ` (${m.role_badge_default()})` : ''}` : null;
                    })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.roleName}
                    {role.isDefault && ` (${m.role_badge_default()})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-sm text-destructive">{errors.roleId}</p>}
            {selectedTeamId && roles.length === 0 && (
              <p className="text-sm text-muted-foreground">{m.member_form_no_roles()}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              {m.common_cancel()}
            </Button>
            <Button type="submit" disabled={isPending || isLookingUpUsername}>
              {isPending
                ? userExists
                  ? m.member_form_inviting()
                  : m.member_form_creating()
                : userExists
                  ? m.member_form_invite_button()
                  : m.member_form_create_button()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
