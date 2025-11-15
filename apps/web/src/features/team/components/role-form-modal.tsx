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
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
        roleDescription: role.roleDescription || '',
      });
    } else {
      setFormData({ roleName: '', roleDescription: '' });
    }
    setErrors({});
  }, [role, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roleName.trim()) {
      newErrors.roleName = m.role_form_name_required();
    } else if (formData.roleName.length > 100) {
      newErrors.roleName = m.role_form_name_too_long();
    }

    if (formData.roleDescription && formData.roleDescription.length > 500) {
      newErrors.roleDescription = m.role_form_description_too_long();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Only send fillable fields (roleName and roleDescription)
    const payload: RoleMutationData = {
      roleName: formData.roleName,
      roleDescription: formData.roleDescription,
    };

    if (isEditMode) {
      updateRole.mutate({
        roleId: role.id,
        request: {
          constraints: { workspaceTeamId: teamId },
          data: payload,
        },
      });
    } else {
      createRole.mutate({
        constraints: { workspaceTeamId: teamId },
        data: payload,
      });
    }
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? m.role_edit_title() : m.role_create_title()}</DialogTitle>
          <DialogDescription>{isEditMode ? m.role_edit_description() : m.role_create_description()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="roleName">
              {m.role_form_name_label()} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roleName"
              value={formData.roleName}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              placeholder={m.role_form_name_placeholder()}
              aria-invalid={!!errors.roleName}
              disabled={isPending}
              className="border border-input rounded-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
            />
            {errors.roleName && <p className="text-sm text-destructive">{errors.roleName}</p>}
          </div>

          {/* Role Description */}
          <div className="space-y-2">
            <Label htmlFor="roleDescription">{m.role_form_description_label()}</Label>
            <Textarea
              id="roleDescription"
              value={formData.roleDescription}
              onChange={(e) => setFormData({ ...formData, roleDescription: e.target.value })}
              placeholder={m.role_form_description_placeholder()}
              rows={4}
              aria-invalid={!!errors.roleDescription}
              disabled={isPending}
              className="border border-input rounded-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
            />
            {errors.roleDescription && <p className="text-sm text-destructive">{errors.roleDescription}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {m.common_cancel()}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? m.role_update_button() : m.role_create_button_submit()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
