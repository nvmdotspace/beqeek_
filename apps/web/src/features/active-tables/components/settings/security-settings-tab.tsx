import { ShieldCheck, ShieldOff, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';

import type { ActiveTable } from '../../types';
import { useTableEncryption } from '../../hooks/use-table-encryption';

export interface SecuritySettingsTabProps {
  table: ActiveTable;
  workspaceId: string;
}

/**
 * Security Settings Tab
 *
 * Displays and manages encryption settings:
 * - Encryption status
 * - Encryption key (masked by default)
 * - Encryption auth key
 * - Security warnings and best practices
 */
export const SecuritySettingsTab = ({ table, workspaceId }: SecuritySettingsTabProps) => {
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAuthKey, setCopiedAuthKey] = useState(false);

  const { isE2EEEnabled, encryptionKey, encryptionAuthKey, isKeyLoaded } = useTableEncryption(
    workspaceId,
    table.id,
    table.config,
  );

  const handleCopyKey = async (value: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encryption Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isE2EEEnabled ? (
              <>
                <ShieldCheck className="h-5 w-5 text-green-600" />
                End-to-End Encryption Enabled
              </>
            ) : (
              <>
                <ShieldOff className="h-5 w-5 text-muted-foreground" />
                End-to-End Encryption Disabled
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isE2EEEnabled
              ? 'This table uses client-side encryption to protect sensitive data'
              : 'This table does not use encryption. Data is stored in plain text.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isE2EEEnabled ? 'default' : 'secondary'} className="text-sm">
              {isE2EEEnabled ? 'Encrypted' : 'Not Encrypted'}
            </Badge>
            {isE2EEEnabled && isKeyLoaded && (
              <Badge variant="outline" className="text-sm">
                Key Loaded
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Encryption Key (if enabled) */}
      {isE2EEEnabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Khóa mã hóa (Encryption Key)</CardTitle>
              <CardDescription>32-character encryption key used for client-side encryption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="encryption-key">Encryption Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="encryption-key"
                      type={showKey ? 'text' : 'password'}
                      value={encryptionKey || table.config.encryptionKey || '••••••••••••••••'}
                      readOnly
                      className="pr-10 font-mono text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-0 top-0 h-full"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyKey(encryptionKey || table.config.encryptionKey || '', setCopiedKey)}
                    disabled={!encryptionKey && !table.config.encryptionKey}
                    className="shrink-0"
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isKeyLoaded ? 'Key loaded from local storage' : 'Key not loaded - enter key to decrypt data'}
                </p>
              </div>

              {/* Encryption Auth Key */}
              <div className="space-y-2">
                <Label htmlFor="encryption-auth-key">Encryption Auth Key (SHA-256 Hash)</Label>
                <div className="flex gap-2">
                  <Input
                    id="encryption-auth-key"
                    value={encryptionAuthKey || 'Not configured'}
                    readOnly
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyKey(encryptionAuthKey || '', setCopiedAuthKey)}
                    disabled={!encryptionAuthKey}
                    className="shrink-0"
                  >
                    {copiedAuthKey ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  SHA-256 hash used to validate encryption key without exposing it
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Warnings */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Security Information</AlertTitle>
            <AlertDescription className="space-y-2 text-sm">
              <p className="font-semibold">Keep your encryption key safe and backed up!</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Your encryption key is <strong>never sent to the server</strong>
                </li>
                <li>
                  All encryption and decryption happens <strong>locally in your browser</strong>
                </li>
                <li>
                  If you lose this key, you will <strong>permanently lose access</strong> to your encrypted data
                </li>
                <li>Store this key in a secure password manager</li>
                <li>Do not share this key with anyone you don't trust</li>
              </ul>
            </AlertDescription>
          </Alert>
        </>
      )}

      {/* No Encryption Warning */}
      {!isE2EEEnabled && (
        <Alert>
          <AlertTitle>No Encryption Configured</AlertTitle>
          <AlertDescription className="text-sm">
            This table does not use end-to-end encryption. Data is stored in plain text on the server. To enable
            encryption, you need to update the table configuration through the table management interface.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
