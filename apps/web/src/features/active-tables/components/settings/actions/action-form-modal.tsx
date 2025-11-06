/**
 * Action Form Modal
 *
 * Modal form for adding/editing custom actions
 */

import { useState, useEffect } from 'react';
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
import { generateUUIDv7 } from '@workspace/beqeek-shared';
import type { Action } from './actions-settings-section';

export interface ActionFormModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Close callback */
  onClose: () => void;

  /** Submit callback */
  onSubmit: (action: Action) => void;

  /** Action being edited (null for new action) */
  editingAction: Action | null;
}

const AVAILABLE_ICONS = ['play_arrow', 'send', 'check_circle', 'notifications', 'star', 'email', 'phone', 'settings'];

/**
 * Action Form Modal Component
 */
export function ActionFormModal({ open, onClose, editingAction, onSubmit }: ActionFormModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>('play_arrow');
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Reset form when modal opens/closes or editing action changes
  useEffect(() => {
    if (open && editingAction) {
      setName(editingAction.name);
      setIcon(editingAction.icon);
      setErrors({});
    } else if (open && !editingAction) {
      setName('');
      setIcon('play_arrow');
      setErrors({});
    }
  }, [open, editingAction]);

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Action name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const action: Action = {
      name: name.trim(),
      type: 'custom',
      icon: icon as Action['icon'],
      actionId: editingAction?.actionId || generateUUIDv7(),
    };

    onSubmit(action);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingAction ? 'Edit Custom Action' : 'Add Custom Action'}</DialogTitle>
            <DialogDescription>
              Create a custom action for your workflow. The action ID will be used to trigger business logic on the
              backend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Action Name */}
            <div className="space-y-2">
              <Label htmlFor="action-name">
                Action Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="action-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Send Email Notification"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'action-name-error' : undefined}
              />
              {errors.name && (
                <p id="action-name-error" className="text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <Label htmlFor="action-icon">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      {iconName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select an icon from Material Icons library</p>
            </div>

            {/* Action ID (read-only for editing) */}
            {editingAction && (
              <div className="space-y-2">
                <Label htmlFor="action-id">Action ID (Read-only)</Label>
                <Input id="action-id" value={editingAction.actionId} disabled />
                <p className="text-xs text-muted-foreground">
                  This ID is used to identify the action in API calls and backend logic
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">{editingAction ? 'Update Action' : 'Add Action'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
