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
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
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
        <Stack space="space-300">
          {/* Warning */}
          <Box
            padding="space-100"
            border="default"
            borderRadius="lg"
            className="border-2 border-destructive bg-destructive/5"
          >
            <Inline space="space-075" align="start">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <Stack space="space-050" className="flex-1">
                <Heading level={4} className="text-destructive">
                  {m.settings_dangerZone_warningTitle()}
                </Heading>
                <Text size="small" color="muted">
                  {m.settings_dangerZone_warningDescription()}
                </Text>
              </Stack>
            </Inline>
          </Box>

          {/* Delete Table */}
          <Box padding="space-300" border="default" borderRadius="lg" className="border-2 border-destructive">
            <Stack space="space-100">
              <Stack space="space-050">
                <Heading level={3} className="text-destructive">
                  <Inline space="space-050" align="center">
                    <Trash2 className="h-5 w-5" />
                    {m.settings_dangerZone_deleteTitle()}
                  </Inline>
                </Heading>
                <Text size="small" color="muted">
                  {m.settings_dangerZone_deleteDescription()}
                </Text>
              </Stack>

              <Box padding="space-100" borderRadius="md" backgroundColor="muted">
                <Stack space="space-037">
                  <p className="text-sm font-medium">{m.settings_dangerZone_deleteListTitle()}</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>{m.settings_dangerZone_deleteItem1()}</li>
                    <li>{m.settings_dangerZone_deleteItem2()}</li>
                    <li>{m.settings_dangerZone_deleteItem3()}</li>
                    <li>{m.settings_dangerZone_deleteItem4()}</li>
                    <li>{m.settings_dangerZone_deleteItem5()}</li>
                  </ul>
                </Stack>
              </Box>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="w-full"
              >
                <Inline space="space-050" align="center">
                  <Trash2 className="h-5 w-5" />
                  {isDeleting ? m.settings_dangerZone_deleting() : m.settings_dangerZone_deleteButton()}
                </Inline>
              </Button>
            </Stack>
          </Box>

          {/* Additional Info */}
          <Box padding="space-100" border="default" borderRadius="lg" className="border-info/20 bg-info-subtle">
            <Stack space="space-050">
              <p className="text-sm font-medium text-info">{m.settings_dangerZone_beforeDeleteTitle()}</p>
              <ul className="space-y-1 text-xs text-info-subtle-foreground">
                <li>• {m.settings_dangerZone_beforeDeleteTip1()}</li>
                <li>• {m.settings_dangerZone_beforeDeleteTip2()}</li>
                <li>• {m.settings_dangerZone_beforeDeleteTip3()}</li>
                <li>• {m.settings_dangerZone_beforeDeleteTip4()}</li>
              </ul>
            </Stack>
          </Box>
        </Stack>
      </SettingsSection>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              <Inline space="space-050" align="center">
                <AlertTriangle className="h-5 w-5" />
                {m.settings_dangerZone_confirmTitle()}
              </Inline>
            </DialogTitle>
            <DialogDescription>{m.settings_dangerZone_confirmDescription()}</DialogDescription>
          </DialogHeader>

          <Box className="py-4">
            <Stack space="space-100">
              <Box
                padding="space-100"
                border="default"
                borderRadius="lg"
                className="border-2 border-destructive bg-destructive/5"
              >
                <Stack space="space-050">
                  <p className="text-sm font-medium text-destructive">{m.settings_dangerZone_confirmAboutTo()}</p>
                  <p className="text-base font-bold">{tableName}</p>
                </Stack>
              </Box>

              <Stack space="space-050">
                <Label htmlFor="confirm-text">{m.settings_dangerZone_confirmTypePrompt({ tableName })}</Label>
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={m.settings_dangerZone_confirmPlaceholder()}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">{m.settings_dangerZone_confirmHelp()}</p>
              </Stack>

              <Box
                padding="space-075"
                border="default"
                borderRadius="md"
                className="bg-warning-subtle border-warning/20"
              >
                <p className="text-xs text-warning-subtle-foreground">
                  <strong>{m.settings_dangerZone_confirmFinalWarningLabel()}</strong>{' '}
                  {m.settings_dangerZone_confirmFinalWarningText()}
                </p>
              </Box>
            </Stack>
          </Box>

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
