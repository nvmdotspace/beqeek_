# Package Details

## @workspace/ui

Component library with TailwindCSS v4 and Radix UI primitives.

```tsx
// Import global styles (in main.tsx)
import '@workspace/ui/globals.css';

// Import components
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils'; // Tailwind class merger
```

Exports via `package.json` exports field:

- `@workspace/ui/globals.css` → styles
- `@workspace/ui/components/*` → individual components
- `@workspace/ui/lib/*` → utilities
- `@workspace/ui/hooks/*` → hooks

## @workspace/active-tables-core

Package containing Active Tables models, types, validators, React components (Quill editor), and Zustand stores.

- Depends on `@workspace/encryption-core` and `@workspace/beqeek-shared`
- Peer dependencies: `react`, `react-dom`, `@tanstack/react-table` (must be provided by consumer)

## @workspace/encryption-core

Client-side E2EE implementation using crypto-js.

- Keys stored locally, NEVER transmitted to server
- Handles AES-256, OPE, HMAC-SHA256 encryption

## @workspace/beqeek-shared

TypeScript-only shared constants, types, and validators for Active Tables.

- Field type constants and groups
- Action type constants (record, comment, custom)
- Permission constants and arrays for UI dropdowns
- Layout constants (record list, record detail, comments position)
- Table type templates (35 pre-configured templates)
- Type guards and validators

## Quick Reference: When to Use Which Package

**@workspace/beqeek-shared** - Use for:

- ✅ Action type constants (ACTION*TYPE*\*)
- ✅ Permission constants (PERMISSION\__, _\_PERMISSIONS arrays)
- ✅ Field type constants (FIELD*TYPE*\*)
- ✅ Layout constants (RECORD*LIST_LAYOUT*_, RECORD*DETAIL_LAYOUT*_)
- ✅ Table type templates (TABLE_CONFIGS)
- ✅ Type definitions (TableConfig, PermissionConfig, etc.)

**@workspace/active-tables-core** - Use for:

- ✅ React components (FieldRenderer, KanbanBoard, GanttChart)
- ✅ React hooks (usePermissions, useEncryption, useInlineEdit)
- ✅ Zustand stores (useViewStore, useFilterStore, useSelectionStore)
- ✅ Utilities (recordDecryptor, fieldValidation, permissionChecker)

**@workspace/encryption-core** - Use for:

- ✅ Encryption utilities (AES256, OPE, HMAC)
- ✅ Key generation (generateEncryptionKey)
- ✅ Table data encryption/decryption
