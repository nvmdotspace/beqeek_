# Phase 01: Foundation - Types, API Layer, Shared Constants

**Duration**: 6-8 hours
**Dependencies**: None
**Risk Level**: Low

## Context

Establish type-safe foundation for Workflow Connectors feature. Move hardcoded connector types and configs to shared package for reusability across app/admin/backend. Create React Query API layer with proper error handling and cache invalidation.

## Overview

Build the invisible infrastructure that all views depend on: TypeScript types, API hooks with React Query, shared constants in @workspace/beqeek-shared, and route definitions. No UI components yet—pure data layer.

## Key Insights

1. **Shared constants reduce duplication**: 5 connector types + configs used in multiple places (select view, forms, validation)
2. **React Query eliminates manual caching**: Automatic refetch, optimistic updates, stale-while-revalidate
3. **Type-safe API layer**: Catch errors at compile time, not runtime
4. **POST-based RPC preserved**: Keep backward compatibility with existing backend (non-RESTful but intentional)

## Requirements

### Functional Requirements

- [ ] Define all TypeScript interfaces for connector types, configs, instances
- [ ] Export connector type constants (SMTP, GOOGLE_SHEETS, etc.)
- [ ] Create React Query hooks for all CRUD operations
- [ ] Add route definitions to route-paths.ts
- [ ] Set up query key factory for cache management

### Non-Functional Requirements

- [ ] Zero TypeScript errors
- [ ] 100% type coverage (no `any`)
- [ ] JSDoc comments on all public APIs
- [ ] Exported from @workspace/beqeek-shared via package.json exports

## Architecture

### Package Structure

```
packages/beqeek-shared/src/workflow-connectors/
├── index.ts                  # Barrel export
├── types.ts                  # Core interfaces
├── constants.ts              # Connector type constants
├── connector-types.ts        # Type definitions array
└── connector-configs.ts      # Config definitions array
```

### Feature Structure

```
apps/web/src/features/workflow-connectors/
├── api/
│   ├── connector-api.ts      # React Query hooks
│   ├── types.ts              # API-specific types
│   └── query-keys.ts         # Query key factory
└── constants.ts              # Re-export from shared package
```

## Implementation Steps

### Step 1: Shared Package Types (2h)

**File**: `packages/beqeek-shared/src/workflow-connectors/types.ts`

```typescript
// Connector type constants
export const CONNECTOR_TYPE_SMTP = 'SMTP';
export const CONNECTOR_TYPE_GOOGLE_SHEETS = 'GOOGLE_SHEETS';
export const CONNECTOR_TYPE_ZALO_OA = 'ZALO_OA';
export const CONNECTOR_TYPE_KIOTVIET = 'KIOTVIET';
export const CONNECTOR_TYPE_ACTIVE_TABLE = 'ACTIVE_TABLE';

export type ConnectorType =
  | typeof CONNECTOR_TYPE_SMTP
  | typeof CONNECTOR_TYPE_GOOGLE_SHEETS
  | typeof CONNECTOR_TYPE_ZALO_OA
  | typeof CONNECTOR_TYPE_KIOTVIET
  | typeof CONNECTOR_TYPE_ACTIVE_TABLE;

// Connector type definition
export interface ConnectorTypeDefinition {
  type: ConnectorType;
  name: string;
  description: string;
  logo: string;
}

// Config field types
export type ConfigFieldType = 'text' | 'number' | 'password' | 'checkbox';

export interface ConfigFieldDefinition {
  name: string;
  type: ConfigFieldType;
  label: string;
  required: boolean;
  secret: boolean;
  readonly?: boolean;
}

// Connector config definition
export interface ConnectorConfigDefinition {
  connectorType: ConnectorType;
  oauth: boolean;
  configFields: ConfigFieldDefinition[];
}

// Connector instance (from API)
export interface ConnectorInstance {
  id: string;
  name: string;
  description: string;
  connectorType: ConnectorType;
  config: Record<string, unknown>;
  documentation?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API request/response types
export interface CreateConnectorInput {
  name: string;
  description: string;
  connectorType: ConnectorType;
}

export interface UpdateConnectorInput {
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
}
```

### Step 2: Connector Type Definitions (1h)

**File**: `packages/beqeek-shared/src/workflow-connectors/connector-types.ts`

```typescript
import {
  CONNECTOR_TYPE_SMTP,
  CONNECTOR_TYPE_GOOGLE_SHEETS,
  CONNECTOR_TYPE_ZALO_OA,
  CONNECTOR_TYPE_KIOTVIET,
  CONNECTOR_TYPE_ACTIVE_TABLE,
  type ConnectorTypeDefinition,
} from './types';

export const CONNECTOR_TYPES: ConnectorTypeDefinition[] = [
  {
    type: CONNECTOR_TYPE_SMTP,
    name: 'SMTP',
    description: 'Kết nối với máy chủ SMTP để gửi email.',
    logo: '/images/email.png',
  },
  {
    type: CONNECTOR_TYPE_GOOGLE_SHEETS,
    name: 'Google Sheet',
    description: 'Kết nối với Google Sheet để truy cập dữ liệu người dùng và dịch vụ.',
    logo: 'https://a.mktgcdn.com/p/-PwOQsJ3DFhmP-ysVNuotfaRuvS5CJnvkxe-xSGj8ZQ/4267x4267.png',
  },
  {
    type: CONNECTOR_TYPE_ZALO_OA,
    name: 'Zalo OA',
    description: 'Kết nối với Zalo Official Account để gửi tin nhắn và quản lý khách hàng.',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMDg68zSJU2TpKyMFJwkWpuGsXF_FTMJguqA&s',
  },
  {
    type: CONNECTOR_TYPE_KIOTVIET,
    name: 'Kiotviet',
    description: 'Kết nối với Kiotviet để quản lý bán hàng và kho.',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn9GcSu9JZqHuRPU5YePaTYEB8OuU-ejDAPlYH8UQ&s',
  },
  {
    type: CONNECTOR_TYPE_ACTIVE_TABLE,
    name: 'Bảng',
    description: 'Kết nối với bảng để quản lý dữ liệu',
    logo: '',
  },
];
```

### Step 3: Connector Config Definitions (1.5h)

**File**: `packages/beqeek-shared/src/workflow-connectors/connector-configs.ts`

```typescript
import {
  CONNECTOR_TYPE_SMTP,
  CONNECTOR_TYPE_GOOGLE_SHEETS,
  CONNECTOR_TYPE_ZALO_OA,
  CONNECTOR_TYPE_KIOTVIET,
  CONNECTOR_TYPE_ACTIVE_TABLE,
  type ConnectorConfigDefinition,
} from './types';

export const CONNECTOR_CONFIGS: ConnectorConfigDefinition[] = [
  {
    connectorType: CONNECTOR_TYPE_SMTP,
    oauth: false,
    configFields: [
      { name: 'host', type: 'text', label: 'SMTP Host', required: true, secret: false },
      { name: 'port', type: 'number', label: 'SMTP Port', required: true, secret: false },
      { name: 'username', type: 'text', label: 'Username', required: true, secret: false },
      { name: 'password', type: 'password', label: 'Password', required: true, secret: true },
      { name: 'from_email', type: 'text', label: 'From Email', required: true, secret: false },
      { name: 'from_name', type: 'text', label: 'From Name', required: false, secret: false },
      { name: 'checkDailyUnique', type: 'checkbox', label: 'Check Daily Unique', required: false, secret: false },
      { name: 'trackingEmail', type: 'checkbox', label: 'Tracking Email', required: false, secret: false },
    ],
  },
  {
    connectorType: CONNECTOR_TYPE_GOOGLE_SHEETS,
    oauth: true,
    configFields: [
      { name: 'access_token', type: 'text', label: 'access_token', required: false, readonly: true, secret: false },
      { name: 'expires_in', type: 'text', label: 'expires_in', required: false, readonly: true, secret: false },
      { name: 'refresh_token', type: 'text', label: 'refresh_token', required: false, readonly: true, secret: false },
      { name: 'scope', type: 'text', label: 'scope', required: false, readonly: true, secret: false },
      { name: 'token_type', type: 'text', label: 'token_type', required: false, readonly: true, secret: false },
      { name: 'created', type: 'text', label: 'created', required: false, readonly: true, secret: false },
    ],
  },
  {
    connectorType: CONNECTOR_TYPE_ZALO_OA,
    oauth: true,
    configFields: [
      { name: 'accessToken', type: 'text', label: 'Access Token', required: false, readonly: true, secret: true },
      { name: 'refreshToken', type: 'text', label: 'Refresh Token', required: false, readonly: true, secret: true },
    ],
  },
  {
    connectorType: CONNECTOR_TYPE_KIOTVIET,
    oauth: false,
    configFields: [
      { name: 'clientId', type: 'text', label: 'Client ID', required: true, secret: false },
      { name: 'clientSecret', type: 'password', label: 'Client Secret', required: true, secret: true },
      { name: 'retailerCode', type: 'text', label: 'Retailer Code', required: true, secret: false },
      { name: 'accessToken', type: 'text', label: 'Mã truy cập API (access token)', required: false, secret: true },
    ],
  },
  {
    connectorType: CONNECTOR_TYPE_ACTIVE_TABLE,
    oauth: false,
    configFields: [
      { name: 'tableId', type: 'text', label: 'Table ID', required: true, secret: false },
      { name: 'tableKey', type: 'password', label: 'Table Encryption Key', required: true, secret: true },
    ],
  },
];
```

### Step 4: Barrel Export (0.5h)

**File**: `packages/beqeek-shared/src/workflow-connectors/index.ts`

```typescript
// Types
export type {
  ConnectorType,
  ConnectorTypeDefinition,
  ConfigFieldType,
  ConfigFieldDefinition,
  ConnectorConfigDefinition,
  ConnectorInstance,
  CreateConnectorInput,
  UpdateConnectorInput,
} from './types';

// Constants
export {
  CONNECTOR_TYPE_SMTP,
  CONNECTOR_TYPE_GOOGLE_SHEETS,
  CONNECTOR_TYPE_ZALO_OA,
  CONNECTOR_TYPE_KIOTVIET,
  CONNECTOR_TYPE_ACTIVE_TABLE,
} from './types';

// Data
export { CONNECTOR_TYPES } from './connector-types';
export { CONNECTOR_CONFIGS } from './connector-configs';
```

**Update**: `packages/beqeek-shared/package.json`

```json
{
  "exports": {
    "./workflow-connectors": {
      "types": "./src/workflow-connectors/index.ts",
      "default": "./src/workflow-connectors/index.ts"
    }
  }
}
```

### Step 5: React Query API Layer (2.5h)

**File**: `apps/web/src/features/workflow-connectors/api/query-keys.ts`

```typescript
export const connectorKeys = {
  all: (workspaceId: string) => ['workflow-connectors', workspaceId] as const,
  lists: (workspaceId: string) => [...connectorKeys.all(workspaceId), 'list'] as const,
  list: (workspaceId: string, filters?: Record<string, unknown>) =>
    [...connectorKeys.lists(workspaceId), filters] as const,
  details: (workspaceId: string) => [...connectorKeys.all(workspaceId), 'detail'] as const,
  detail: (workspaceId: string, connectorId: string) => [...connectorKeys.details(workspaceId), connectorId] as const,
  oauthState: (workspaceId: string, connectorId: string) =>
    [...connectorKeys.detail(workspaceId, connectorId), 'oauth'] as const,
};
```

**File**: `apps/web/src/features/workflow-connectors/api/types.ts`

```typescript
export interface ConnectorListResponse {
  data: ConnectorInstance[];
}

export interface ConnectorDetailResponse {
  data: ConnectorInstance;
}

export interface CreateConnectorResponse {
  data: { id: string };
  message: string;
}

export interface UpdateConnectorResponse {
  message: string;
}

export interface DeleteConnectorResponse {
  message: string;
}

export interface OAuthStateResponse {
  data: { state: string };
}
```

**File**: `apps/web/src/features/workflow-connectors/api/connector-api.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/http-client';
import type {
  ConnectorInstance,
  CreateConnectorInput,
  UpdateConnectorInput,
} from '@workspace/beqeek-shared/workflow-connectors';
import type {
  ConnectorListResponse,
  ConnectorDetailResponse,
  CreateConnectorResponse,
  UpdateConnectorResponse,
  DeleteConnectorResponse,
  OAuthStateResponse,
} from './types';
import { connectorKeys } from './query-keys';

// List connectors
export const useConnectors = (workspaceId: string) => {
  return useQuery({
    queryKey: connectorKeys.lists(workspaceId),
    queryFn: async () => {
      const response = await apiRequest<ConnectorListResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors`,
        data: {},
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get connector details
export const useConnectorDetail = (workspaceId: string, connectorId: string, enabled = true) => {
  return useQuery({
    queryKey: connectorKeys.detail(workspaceId, connectorId),
    queryFn: async () => {
      const response = await apiRequest<ConnectorDetailResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors/${connectorId}`,
        data: {},
      });
      return response.data;
    },
    enabled: enabled && !!connectorId,
    staleTime: 1000 * 60 * 5,
  });
};

// Create connector
export const useCreateConnector = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateConnectorInput) => {
      const response = await apiRequest<CreateConnectorResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/post/workflow_connectors`,
        data: input,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.lists(workspaceId) });
    },
  });
};

// Update connector
export const useUpdateConnector = (workspaceId: string, connectorId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateConnectorInput) => {
      const response = await apiRequest<UpdateConnectorResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/patch/workflow_connectors/${connectorId}`,
        data: input,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.lists(workspaceId) });
      queryClient.invalidateQueries({ queryKey: connectorKeys.detail(workspaceId, connectorId) });
    },
  });
};

// Delete connector
export const useDeleteConnector = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectorId: string) => {
      const response = await apiRequest<DeleteConnectorResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/delete/workflow_connectors/${connectorId}`,
        data: {},
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.lists(workspaceId) });
    },
  });
};

// Get OAuth state (manual trigger only)
export const useOAuthState = (workspaceId: string, connectorId: string) => {
  return useQuery({
    queryKey: connectorKeys.oauthState(workspaceId, connectorId),
    queryFn: async () => {
      const response = await apiRequest<OAuthStateResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors/${connectorId}/oauth2_state`,
        data: {},
      });
      return response.data;
    },
    enabled: false, // Manual refetch only
  });
};
```

### Step 6: Route Definitions (0.5h)

**File**: `apps/web/src/shared/route-paths.ts` (update)

```typescript
export const ROUTES = {
  // ... existing routes
  WORKFLOW_CONNECTORS: {
    LIST: '/$locale/workspaces/$workspaceId/workflow-connectors',
    SELECT: '/$locale/workspaces/$workspaceId/workflow-connectors/select',
    DETAIL: '/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId',
    OAUTH_CALLBACK: '/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback',
  },
} as const;
```

## Todo List

- [ ] Create `packages/beqeek-shared/src/workflow-connectors/` directory
- [ ] Implement types.ts with all interfaces
- [ ] Implement connector-types.ts with CONNECTOR_TYPES array
- [ ] Implement connector-configs.ts with CONNECTOR_CONFIGS array
- [ ] Create barrel export in index.ts
- [ ] Update package.json exports
- [ ] Run `pnpm build` in packages/beqeek-shared
- [ ] Create feature directory `apps/web/src/features/workflow-connectors/api/`
- [ ] Implement query-keys.ts
- [ ] Implement types.ts (API types)
- [ ] Implement connector-api.ts (React Query hooks)
- [ ] Update route-paths.ts with WORKFLOW_CONNECTORS routes
- [ ] Run `pnpm --filter @workspace/beqeek-shared build`
- [ ] Run `pnpm --filter web check-types` (zero errors)
- [ ] Verify imports work: `import { CONNECTOR_TYPES } from '@workspace/beqeek-shared/workflow-connectors';`

## Success Criteria

- [ ] All TypeScript types compile without errors
- [ ] @workspace/beqeek-shared builds successfully
- [ ] React Query hooks have correct return types
- [ ] Query keys factory generates unique, hierarchical keys
- [ ] JSDoc comments on all exported types and functions
- [ ] No `any` types (100% type coverage)
- [ ] Can import from `@workspace/beqeek-shared/workflow-connectors`
- [ ] Route constants accessible from `ROUTES.WORKFLOW_CONNECTORS`

## Risk Assessment

**Low Risk**: All code is pure TypeScript definitions, no runtime dependencies

**Mitigation**:

- Use existing http-client pattern from Active Tables
- Follow React Query best practices from TanStack docs
- Validate package.json exports with `pnpm build`

## Security Considerations

- API requests automatically include Bearer token via http-client
- Workspace ID scoped to prevent cross-workspace access
- No secret fields exposed in types (stored in config object)

## Next Steps

**Phase 02**: Implement List and Select views using these types and API hooks

## Unresolved Questions

1. Should `documentation` field be required on ConnectorInstance?
2. Should we add createdAt/updatedAt to API responses?
3. Do we need pagination for connector list? (Current spec shows no limit)
