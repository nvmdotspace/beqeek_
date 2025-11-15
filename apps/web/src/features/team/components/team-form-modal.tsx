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
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
      newErrors.teamName = m.team_form_name_required();
    } else if (formData.teamName.length > 100) {
      newErrors.teamName = m.team_form_name_too_long();
    }

    if (formData.teamDescription && formData.teamDescription.length > 500) {
      newErrors.teamDescription = m.team_form_description_too_long();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? m.team_edit_title() : m.team_create_title()}</DialogTitle>
          <DialogDescription>{isEditMode ? m.team_edit_description() : m.team_create_description()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="teamName">
              {m.team_form_name_label()} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="teamName"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              placeholder={m.team_form_name_placeholder()}
              aria-invalid={!!errors.teamName}
              disabled={isPending}
              className="border border-input rounded-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
            />
            {errors.teamName && <p className="text-sm text-destructive">{errors.teamName}</p>}
          </div>

          {/* Team Description */}
          <div className="space-y-2">
            <Label htmlFor="teamDescription">{m.team_form_description_label()}</Label>
            <Textarea
              id="teamDescription"
              value={formData.teamDescription}
              onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })}
              placeholder={m.team_form_description_placeholder()}
              rows={4}
              aria-invalid={!!errors.teamDescription}
              disabled={isPending}
              className="border border-input rounded-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
            />
            {errors.teamDescription && <p className="text-sm text-destructive">{errors.teamDescription}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {m.common_cancel()}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? m.team_update_button() : m.team_create_button()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
