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
import { Heading, Text } from '@workspace/ui/components/typography';
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
          <Heading level={3} className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            Encryption Status
          </Heading>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="secondary" className="flex w-fit items-center gap-2">
            <Shield className="h-4 w-4" />
            Server-side Encryption
          </Badge>
          <Text size="small" color="muted">
            The table <span className="font-medium">{table.name}</span> uses server-side encryption. No client-side
            encryption key is required.
          </Text>
        </CardContent>
      </Card>
    );
  }

  // E2EE enabled, no key or unknown status
  if (keyValidationStatus === 'unknown') {
    return (
      <Card className="border-warning">
        <CardHeader>
          <Heading level={3} className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Encryption Key Required
          </Heading>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="outline" className="flex w-fit items-center gap-2 border-warning text-warning">
            <Key className="h-4 w-4" />
            No Key Loaded
          </Badge>
          <Text size="small" color="muted">
            The table <span className="font-medium">{table.name}</span> uses end-to-end encryption. Enter your
            encryption key to view and manage encrypted records.
          </Text>
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
          <Heading level={3} className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-destructive" />
            Invalid Encryption Key
          </Heading>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="destructive" className="flex w-fit items-center gap-2">
            <ShieldX className="h-4 w-4" />
            Key Validation Failed
          </Badge>
          <Text size="small" color="muted">
            The stored encryption key is invalid for <span className="font-medium">{table.name}</span>. Please enter the
            correct encryption key.
          </Text>
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
    <Card className="border-success">
      <CardHeader>
        <Heading level={3} className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-success" />
          Encryption Active
        </Heading>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="outline" className="flex w-fit items-center gap-2 border-success text-success">
          <ShieldCheck className="h-4 w-4" />
          Key Loaded & Valid
        </Badge>
        <Text size="small" color="muted">
          Your encryption key for <span className="font-medium">{table.name}</span> is loaded and validated. You can now
          view and manage encrypted records securely.
        </Text>
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
