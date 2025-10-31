/**
 * EncryptionStatusCard Component
 *
 * Displays encryption status and key management UI
 * Shows 4 different states:
 * 1. Server-side encryption only (E2EE disabled)
 * 2. E2EE enabled, no key loaded
 * 3. E2EE enabled, key loaded & valid
 * 4. E2EE enabled, key invalid
 */

import { Shield, ShieldCheck, ShieldX, AlertTriangle, Key, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import type { ActiveTable } from '../types';
import type { UseTableEncryptionReturn } from '../hooks/use-table-encryption';

export interface EncryptionStatusCardProps {
  table: ActiveTable;
  encryption: UseTableEncryptionReturn;
  onEnterKey: () => void;
}

export function EncryptionStatusCard({ table, encryption, onEnterKey }: EncryptionStatusCardProps) {
  const { isE2EEEnabled, keyValidationStatus, clearKey } = encryption;

  // Server-side encryption only
  if (!isE2EEEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            Encryption Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="secondary" className="flex w-fit items-center gap-2">
            <Shield className="h-4 w-4" />
            Server-side Encryption
          </Badge>
          <p className="text-sm text-muted-foreground">
            This table uses server-side encryption. No client-side encryption key is required.
          </p>
        </CardContent>
      </Card>
    );
  }

  // E2EE enabled, no key or unknown status
  if (keyValidationStatus === 'unknown') {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Encryption Key Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="outline" className="flex w-fit items-center gap-2 border-yellow-500 text-yellow-700">
            <Key className="h-4 w-4" />
            No Key Loaded
          </Badge>
          <p className="text-sm text-muted-foreground">
            This table uses end-to-end encryption. You need to enter your encryption key to view and manage encrypted
            records.
          </p>
          <Button onClick={onEnterKey} className="w-full sm:w-auto">
            <Key className="mr-2 h-4 w-4" />
            Enter Encryption Key
          </Button>
        </CardContent>
      </Card>
    );
  }

  // E2EE enabled, invalid key
  if (keyValidationStatus === 'invalid') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-destructive" />
            Invalid Encryption Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="destructive" className="flex w-fit items-center gap-2">
            <ShieldX className="h-4 w-4" />
            Key Validation Failed
          </Badge>
          <p className="text-sm text-muted-foreground">
            The stored encryption key is invalid or does not match this table. Please enter the correct encryption key.
          </p>
          <div className="flex gap-2">
            <Button onClick={onEnterKey} className="flex-1 sm:flex-none">
              <Key className="mr-2 h-4 w-4" />
              Re-enter Key
            </Button>
            <Button variant="ghost" onClick={clearKey} className="flex-1 sm:flex-none">
              <X className="mr-2 h-4 w-4" />
              Clear Key
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // E2EE enabled, valid key
  return (
    <Card className="border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Encryption Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="outline" className="flex w-fit items-center gap-2 border-green-500 text-green-700">
          <ShieldCheck className="h-4 w-4" />
          Key Loaded & Valid
        </Badge>
        <p className="text-sm text-muted-foreground">
          Your encryption key is loaded and validated. You can now view and manage encrypted records securely.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEnterKey} size="sm">
            <Key className="mr-2 h-3.5 w-3.5" />
            Change Key
          </Button>
          <Button variant="ghost" onClick={clearKey} size="sm">
            <X className="mr-2 h-3.5 w-3.5" />
            Clear Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
