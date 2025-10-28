import { useState } from 'react';
import { AlertTriangle, Lock, Info } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Switch } from '@workspace/ui/components/switch';

/**
 * Props for EncryptionKeyDialog component
 */
export interface EncryptionKeyDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Table name for display */
  tableName?: string;
  /** Server's encryption auth key for validation */
  encryptionAuthKey?: string;
  /** Callback when valid key is submitted */
  onKeySubmit: (key: string, rememberKey: boolean) => void;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * EncryptionKeyDialog component
 *
 * Modal dialog that prompts user for encryption key when accessing E2EE-enabled tables.
 *
 * Features:
 * - Input validation (64-char hex format)
 * - Server-side key validation against encryptionAuthKey
 * - Remember key option to persist in localStorage
 * - Warning message about key backup/loss
 * - Error state display
 * - Accessibility support with ARIA labels
 *
 * @example
 * ```tsx
 * <EncryptionKeyDialog
 *   open={needsKey}
 *   onOpenChange={setNeedsKey}
 *   tableName={table.name}
 *   encryptionAuthKey={table.config.encryptionAuthKey}
 *   onKeySubmit={handleKeySubmit}
 *   error={keyError}
 * />
 * ```
 */
export function EncryptionKeyDialog({
  open,
  onOpenChange,
  tableName,
  onKeySubmit,
  isSubmitting = false,
  error = null,
}: EncryptionKeyDialogProps) {
  const [keyInput, setKeyInput] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Validate key format (64 hex characters)
   */
  const validateKeyFormat = (key: string): boolean => {
    const hexPattern = /^[a-fA-F0-9]{64}$/;
    return hexPattern.test(key);
  };

  /**
   * Handle key input change with real-time validation
   */
  const handleKeyChange = (value: string) => {
    setKeyInput(value);
    setValidationError(null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate key format
    if (!validateKeyFormat(keyInput)) {
      setValidationError('Invalid key format. Key must be 64 hexadecimal characters (0-9, a-f).');
      return;
    }

    // Clear validation error and submit
    setValidationError(null);
    onKeySubmit(keyInput, rememberKey);
  };

  /**
   * Handle dialog close
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      // Reset state when closing
      if (!newOpen) {
        setKeyInput('');
        setValidationError(null);
      }
    }
  };

  const displayError = validationError || error;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="encryption-key-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" aria-hidden="true" />
            Encryption Key Required
          </DialogTitle>
          <DialogDescription id="encryption-key-description">
            {tableName
              ? `Enter the encryption key to access "${tableName}"`
              : 'Enter the encryption key to access this encrypted table'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Key Input */}
          <div className="space-y-2">
            <Label htmlFor="encryption-key">
              Encryption Key *
            </Label>
            <Input
              id="encryption-key"
              type="password"
              value={keyInput}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="Enter 64-character hexadecimal key"
              disabled={isSubmitting}
              aria-invalid={!!displayError}
              aria-describedby={displayError ? "key-error" : undefined}
              autoComplete="off"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Format: 64 hexadecimal characters (0-9, a-f)
            </p>

            {/* Validation/Error Messages */}
            {displayError && (
              <p
                id="key-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {displayError}
              </p>
            )}
          </div>

          {/* Remember Key Option */}
          <div className="flex items-center space-x-2">
            <Switch
              id="remember-key"
              checked={rememberKey}
              onCheckedChange={setRememberKey}
              disabled={isSubmitting}
              aria-label="Remember encryption key in browser"
            />
            <Label
              htmlFor="remember-key"
              className="text-sm font-normal cursor-pointer"
            >
              Remember this key in my browser
            </Label>
          </div>

          {/* Security Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Important Security Notice</AlertTitle>
            <AlertDescription className="space-y-2">
              <p className="text-sm">
                Keep your encryption key safe and backed up. If you lose this key, you will
                permanently lose access to your encrypted data.
              </p>
            </AlertDescription>
          </Alert>

          {/* Info Notice */}
          <Alert>
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-sm">
              Your encryption key is never sent to the server. All encryption and
              decryption happens locally in your browser.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !keyInput}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Validating...' : 'Unlock Table'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
