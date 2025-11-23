/**
 * EncryptionKeyPrompt - Modal prompting user for encryption key
 */

import { useState } from 'react';
import { AlertTriangle, Key, Eye, EyeOff } from 'lucide-react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Box } from '@workspace/ui/components/primitives/box';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertTitle, AlertDescription } from '@workspace/ui/components/alert';

interface EncryptionKeyPromptProps {
  tableId: string;
  tableName: string;
  onKeySubmit: (key: string) => Promise<boolean>;
}

export function EncryptionKeyPrompt({ tableId, tableName, onKeySubmit }: EncryptionKeyPromptProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (key.length !== 32) {
      setError('Encryption key must be exactly 32 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onKeySubmit(key);
      if (!success) {
        setError('Invalid encryption key. Please check and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate key');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Box padding="space-600" className="bg-card border border-border rounded-lg max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <Stack space="space-400">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Key className="size-6 text-warning" />
              </div>
              <div>
                <Heading level={2} className="text-lg">
                  Encryption Key Required
                </Heading>
                <Text size="small" className="text-muted-foreground">
                  {tableName}
                </Text>
              </div>
            </div>

            {/* Description */}
            <Text>
              This table uses end-to-end encryption. Enter your encryption key to view and edit record details.
            </Text>

            {/* Input */}
            <Stack space="space-200">
              <Label htmlFor="encryption-key">Encryption Key</Label>
              <div className="relative">
                <Input
                  id="encryption-key"
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="32-character encryption key"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'key-error' : undefined}
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <Text size="small" className="text-muted-foreground">
                {key.length}/32 characters
              </Text>
              {error && (
                <Text id="key-error" size="small" className="text-destructive" role="alert">
                  {error}
                </Text>
              )}
            </Stack>

            {/* Warning Alert */}
            <Alert variant="warning">
              <AlertTriangle className="size-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Keep your encryption key safe. If lost, you cannot recover encrypted data.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button type="submit" disabled={key.length !== 32 || isSubmitting} className="w-full">
              {isSubmitting ? 'Validating...' : 'Unlock Record'}
            </Button>
          </Stack>
        </form>
      </Box>
    </div>
  );
}
