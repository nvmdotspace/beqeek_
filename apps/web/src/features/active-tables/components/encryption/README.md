# Encryption UI Components

Components for managing encryption keys and displaying encryption status in Active Tables with E2EE.

## Components

### EncryptionKeyDialog

Modal dialog that prompts user for encryption key when accessing E2EE-enabled tables.

**Features:**
- Input validation (64-char hex format)
- Server-side key validation against encryptionAuthKey
- Remember key option to persist in localStorage
- Warning message about key backup/loss
- Error state display
- Accessibility support with ARIA labels

**Usage:**
```tsx
import { EncryptionKeyDialog } from '@/features/active-tables/components/encryption';
import { useTableEncryption } from '@/features/active-tables/hooks/use-table-encryption';

function TablePage() {
  const {
    isE2EEEnabled,
    isKeyLoaded,
    saveKey,
    encryptionAuthKey
  } = useTableEncryption({ table, workspaceId });

  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const handleKeySubmit = async (key: string, rememberKey: boolean) => {
    try {
      if (rememberKey) {
        saveKey(key); // Saves to localStorage and validates against server auth key
      }
      setShowKeyDialog(false);
      setKeyError(null);
    } catch (error) {
      setKeyError(error instanceof Error ? error.message : 'Invalid encryption key');
    }
  };

  // Show dialog if encryption required but key not loaded
  useEffect(() => {
    if (isE2EEEnabled && !isKeyLoaded) {
      setShowKeyDialog(true);
    }
  }, [isE2EEEnabled, isKeyLoaded]);

  return (
    <>
      <EncryptionKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        tableName={table?.name}
        encryptionAuthKey={encryptionAuthKey}
        onKeySubmit={handleKeySubmit}
        error={keyError}
      />
      {/* Table content */}
    </>
  );
}
```

### EncryptionStatus

Visual indicator showing encryption status of an Active Table.

**Status Variants:**
- `encrypted`: E2EE enabled and key loaded (green badge with lock icon)
- `key-required`: E2EE enabled but key missing (yellow/warning badge)
- `not-encrypted`: E2EE disabled (gray badge with open lock)

**Features:**
- Visual status badge with color coding
- Icon representation for quick recognition
- Tooltip with detailed information
- Optional interactive mode (clickable to manage key)
- Accessibility support with ARIA labels

**Usage:**
```tsx
import { EncryptionStatus, useEncryptionStatus } from '@/features/active-tables/components/encryption';
import { useTableEncryption } from '@/features/active-tables/hooks/use-table-encryption';

// As status badge
function TableHeader() {
  const { isE2EEEnabled, isKeyLoaded } = useTableEncryption({ table, workspaceId });
  const status = useEncryptionStatus(isE2EEEnabled, isKeyLoaded);

  return (
    <div className="flex items-center gap-2">
      <h1>{table.name}</h1>
      <EncryptionStatus
        status={status}
        isE2EEEnabled={isE2EEEnabled}
        isKeyLoaded={isKeyLoaded}
      />
    </div>
  );
}

// As interactive button
function TableToolbar() {
  const { isE2EEEnabled, isKeyLoaded } = useTableEncryption({ table, workspaceId });
  const status = useEncryptionStatus(isE2EEEnabled, isKeyLoaded);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  return (
    <>
      <EncryptionStatus
        status={status}
        isE2EEEnabled={isE2EEEnabled}
        isKeyLoaded={isKeyLoaded}
        onManageKey={() => setShowKeyDialog(true)}
        interactive
      />
      <EncryptionKeyDialog {...keyDialogProps} />
    </>
  );
}
```

## Complete Integration Example

```tsx
import { useState, useEffect } from 'react';
import {
  EncryptionKeyDialog,
  EncryptionStatus,
  useEncryptionStatus
} from '@/features/active-tables/components/encryption';
import { useTableEncryption } from '@/features/active-tables/hooks/use-table-encryption';

function ActiveTableRecordsPage({ tableId, workspaceId }) {
  const { data: table } = useTableQuery(tableId);

  const {
    isE2EEEnabled,
    isKeyLoaded,
    saveKey,
    removeKey,
    encryptionAuthKey,
    error: encryptionError
  } = useTableEncryption({ table, workspaceId });

  const status = useEncryptionStatus(isE2EEEnabled, isKeyLoaded);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [keySubmitError, setKeySubmitError] = useState<string | null>(null);

  // Auto-show dialog if key required
  useEffect(() => {
    if (isE2EEEnabled && !isKeyLoaded) {
      setShowKeyDialog(true);
    }
  }, [isE2EEEnabled, isKeyLoaded]);

  const handleKeySubmit = async (key: string, rememberKey: boolean) => {
    try {
      if (rememberKey) {
        saveKey(key); // Validates and saves to localStorage
      }
      setShowKeyDialog(false);
      setKeySubmitError(null);
    } catch (error) {
      setKeySubmitError(
        error instanceof Error
          ? error.message
          : 'Invalid encryption key'
      );
    }
  };

  const handleManageKey = () => {
    setShowKeyDialog(true);
  };

  // Show loading state while checking for encryption key
  if (isE2EEEnabled && !isKeyLoaded && !showKeyDialog) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Header with encryption status */}
      <div className="flex items-center justify-between">
        <h1>{table?.name}</h1>
        <EncryptionStatus
          status={status}
          isE2EEEnabled={isE2EEEnabled}
          isKeyLoaded={isKeyLoaded}
          onManageKey={handleManageKey}
          interactive
        />
      </div>

      {/* Encryption key dialog */}
      <EncryptionKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        tableName={table?.name}
        encryptionAuthKey={encryptionAuthKey}
        onKeySubmit={handleKeySubmit}
        error={keySubmitError || encryptionError}
      />

      {/* Table records content */}
      {isKeyLoaded && (
        <RecordsTable table={table} />
      )}
    </div>
  );
}
```

## Encryption Flow

1. User navigates to E2EE-enabled table
2. `useTableEncryption` hook checks for encryption key in localStorage
3. If key not found, `EncryptionKeyDialog` is shown automatically
4. User enters encryption key (64 hex chars)
5. Key is validated against server's `encryptionAuthKey` (SHA-256 hash)
6. If valid and "remember" is checked, key is saved to localStorage
7. `EncryptionStatus` badge updates to show "Encrypted" status
8. Records are decrypted using the loaded key

## Security Notes

- Encryption keys are NEVER sent to the server
- Keys are stored in localStorage with workspace+table-specific keys
- Server only stores SHA-256 hash of the key for validation
- All encryption/decryption happens client-side
- Users are warned about backing up their keys
