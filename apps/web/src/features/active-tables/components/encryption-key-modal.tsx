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
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Enter Encryption Key
          </DialogTitle>
          <DialogDescription>
            This table uses end-to-end encryption. Enter your 32-character encryption key to access encrypted data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Table Info */}
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Table:</span>
              <span className="font-medium">{table.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Table ID:</span>
              <span className="font-mono text-xs">{table.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Workspace:</span>
              <span className="font-mono text-xs">{workspaceId}</span>
            </div>
          </div>

          {/* Key Input */}
          <div className="space-y-2">
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
            <div className="flex justify-between text-xs">
              <span className={keyInput.length === 32 ? 'text-success' : 'text-muted-foreground'}>
                {keyInput.length}/32 characters
              </span>
              {validationError && <span className="text-destructive">{validationError}</span>}
            </div>
          </div>

          {/* Security Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Security Notice</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1 text-sm mt-2">
                <li>Keep your encryption key safe and secure</li>
                <li>Loss of key means permanent loss of data access</li>
                <li>Never share your key with anyone</li>
                <li>The key is stored locally in your browser</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveKey} disabled={keyInput.length !== 32 || isSaving}>
            <Check className="mr-2 h-4 w-4" />
            {isSaving ? 'Validating...' : 'Validate & Save Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
