/**
 * Danger Zone Section
 *
 * Handles irreversible and dangerous actions like table deletion
 */

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Heading, Text } from '@workspace/ui/components/typography';
import { SettingsSection } from '../settings-layout';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface DangerZoneSectionProps {
  /** Table name for confirmation */
  tableName: string;

  /** Callback when delete is confirmed */
  onDelete: () => void;

  /** Whether delete is in progress */
  isDeleting?: boolean;
}

/**
 * Danger Zone Section
 */
export function DangerZoneSection({ tableName, onDelete, isDeleting = false }: DangerZoneSectionProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
    setConfirmText('');
  };

  const handleConfirmDelete = () => {
    if (confirmText === tableName) {
      onDelete();
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmText('');
  };

  const isConfirmValid = confirmText === tableName;

  return (
    <>
      <SettingsSection
        title={m.settings_dangerZone_title()}
        description={m.settings_dangerZone_description()}
        className="border-destructive"
      >
        <div className="space-y-6">
          {/* Warning */}
          <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <Heading level={4} className="text-destructive">
                  {m.settings_dangerZone_warningTitle()}
                </Heading>
                <Text size="small" color="muted" className="mt-2">
                  {m.settings_dangerZone_warningDescription()}
                </Text>
              </div>
            </div>
          </div>

          {/* Delete Table */}
          <div className="rounded-lg border-2 border-destructive p-6 space-y-4">
            <div>
              <Heading level={3} className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                {m.settings_dangerZone_deleteTitle()}
              </Heading>
              <Text size="small" color="muted" className="mt-2">
                {m.settings_dangerZone_deleteDescription()}
              </Text>
            </div>

            <div className="rounded-md bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">{m.settings_dangerZone_deleteListTitle()}</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>{m.settings_dangerZone_deleteItem1()}</li>
                <li>{m.settings_dangerZone_deleteItem2()}</li>
                <li>{m.settings_dangerZone_deleteItem3()}</li>
                <li>{m.settings_dangerZone_deleteItem4()}</li>
                <li>{m.settings_dangerZone_deleteItem5()}</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="w-full"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              {isDeleting ? m.settings_dangerZone_deleting() : m.settings_dangerZone_deleteButton()}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg border border-info/20 bg-info-subtle p-4">
            <p className="text-sm font-medium text-info">{m.settings_dangerZone_beforeDeleteTitle()}</p>
            <ul className="mt-2 space-y-1 text-xs text-info-subtle-foreground">
              <li>• {m.settings_dangerZone_beforeDeleteTip1()}</li>
              <li>• {m.settings_dangerZone_beforeDeleteTip2()}</li>
              <li>• {m.settings_dangerZone_beforeDeleteTip3()}</li>
              <li>• {m.settings_dangerZone_beforeDeleteTip4()}</li>
            </ul>
          </div>
        </div>
      </SettingsSection>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {m.settings_dangerZone_confirmTitle()}
            </DialogTitle>
            <DialogDescription>{m.settings_dangerZone_confirmDescription()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">{m.settings_dangerZone_confirmAboutTo()}</p>
              <p className="mt-2 text-base font-bold">{tableName}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-text">{m.settings_dangerZone_confirmTypePrompt({ tableName })}</Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={m.settings_dangerZone_confirmPlaceholder()}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">{m.settings_dangerZone_confirmHelp()}</p>
            </div>

            <div className="rounded-md bg-warning-subtle border border-warning/20 p-3">
              <p className="text-xs text-warning-subtle-foreground">
                <strong>{m.settings_dangerZone_confirmFinalWarningLabel()}</strong>{' '}
                {m.settings_dangerZone_confirmFinalWarningText()}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isDeleting}>
              {m.common_cancel()}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!isConfirmValid || isDeleting}
            >
              {isDeleting ? m.settings_dangerZone_deleting() : m.settings_dangerZone_confirmButton()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
