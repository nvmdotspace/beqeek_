/**
 * EncryptionKeyModal Component
 *
 * Modal for entering and validating encryption keys for E2EE tables
 * - Validates key format (32 characters)
 * - Validates key against server's encryptionAuthKey
 * - Provides clear security warnings
 * - Saves validated key to localStorage
 */

import { useState } from 'react';
import { Key, Check, AlertTriangle } from 'lucide-react';
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
import { Alert, AlertTitle, AlertDescription } from '@workspace/ui/components/alert';
import { Text } from '@workspace/ui/components/typography';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { isValidEncryptionKey, validateEncryptionKey } from '@workspace/active-tables-core';
import type { ActiveTable } from '../types';

export interface EncryptionKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: ActiveTable;
  workspaceId: string;
  onKeySaved: (key: string) => void;
}

export function EncryptionKeyModal({ isOpen, onClose, table, workspaceId, onKeySaved }: EncryptionKeyModalProps) {
  const [keyInput, setKeyInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleKeyInput = (value: string) => {
    setKeyInput(value);
    setValidationError(null);
  };

  const handleSaveKey = async () => {
    // Validate length
    if (!isValidEncryptionKey(keyInput)) {
      setValidationError('Encryption key must be exactly 32 characters');
      return;
    }

    // Validate against authKey
    const authKey = table.config.encryptionAuthKey;
    if (!validateEncryptionKey(keyInput, authKey)) {
      setValidationError('Invalid encryption key. The key does not match this table.');
      return;
    }

    setIsSaving(true);
    try {
      // Call parent handler
      await onKeySaved(keyInput);

      // Close modal
      setKeyInput('');
      onClose();
    } catch (error) {
      console.error('Failed to save encryption key:', error);
      setValidationError('Failed to save encryption key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setKeyInput('');
    setValidationError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <Inline space="space-050" align="center">
              <Key className="h-5 w-5" />
              Enter Encryption Key
            </Inline>
          </DialogTitle>
          <DialogDescription>
            This table uses end-to-end encryption. Enter your 32-character encryption key to access encrypted data.
          </DialogDescription>
        </DialogHeader>

        <Stack space="space-100">
          {/* Table Info */}
          <Box padding="space-075" borderRadius="lg" backgroundColor="muted">
            <Stack space="space-050">
              <Inline justify="between">
                <Text size="small" color="muted">
                  Table:
                </Text>
                <Text size="small" className="font-medium">
                  {table.name}
                </Text>
              </Inline>
              <Inline justify="between">
                <Text size="small" color="muted">
                  Table ID:
                </Text>
                <Text size="small" className="font-mono text-xs">
                  {table.id}
                </Text>
              </Inline>
              <Inline justify="between">
                <Text size="small" color="muted">
                  Workspace:
                </Text>
                <Text size="small" className="font-mono text-xs">
                  {workspaceId}
                </Text>
              </Inline>
            </Stack>
          </Box>

          {/* Key Input */}
          <Stack space="space-050">
            <Label htmlFor="encryption-key">Encryption Key</Label>
            <Input
              id="encryption-key"
              type="text"
              placeholder="Enter 32-character encryption key"
              maxLength={32}
              value={keyInput}
              onChange={(e) => handleKeyInput(e.target.value)}
              className={validationError ? 'border-destructive' : ''}
              autoComplete="off"
              autoFocus
            />
            <Inline justify="between">
              <Text
                size="small"
                className={keyInput.length === 32 ? 'text-success' : ''}
                color={keyInput.length === 32 ? undefined : 'muted'}
              >
                {keyInput.length}/32 characters
              </Text>
              {validationError && (
                <Text size="small" className="text-destructive">
                  {validationError}
                </Text>
              )}
            </Inline>
          </Stack>

          {/* Security Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Security Notice</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1 mt-2 text-sm">
                <li>Keep your encryption key safe and secure</li>
                <li>Loss of key means permanent loss of data access</li>
                <li>Never share your key with anyone</li>
                <li>The key is stored locally in your browser</li>
              </ul>
            </AlertDescription>
          </Alert>
        </Stack>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveKey} disabled={keyInput.length !== 32 || isSaving}>
            <Inline space="space-050" align="center">
              <Check className="h-4 w-4" />
              {isSaving ? 'Validating...' : 'Validate & Save Key'}
            </Inline>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
