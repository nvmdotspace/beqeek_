# Research Report: React/TypeScript Architecture Strategy

**Date**: 2025-11-16
**Analysis Scope**: Modern patterns, state management, routing, API integration, design system compliance

## Executive Summary

Transition from 1138-line Blade template to feature-based React architecture using TanStack Router, React Query, shadcn/ui. Leverage existing patterns from Active Tables feature for consistency. Achieve 80%+ code reuse through shared components and hooks.

## Recommended Architecture

### Feature Module Structure

```
apps/web/src/features/workflow-connectors/
├── api/
│   ├── connector-api.ts           # React Query hooks
│   └── types.ts                   # API request/response types
├── components/
│   ├── connector-card.tsx         # Select view grid item
│   ├── connector-list-item.tsx    # List view row
│   ├── connector-config-form.tsx  # Dynamic config form
│   ├── connector-basic-info-dialog.tsx  # Name/description edit
│   ├── oauth-button.tsx           # OAuth initiation
│   └── password-field.tsx         # Secret field with toggle
├── hooks/
│   ├── use-connector-types.ts     # Static type definitions
│   ├── use-connector-config.ts    # Dynamic form config
│   └── use-oauth-callback.ts      # OAuth return handling
├── pages/
│   ├── connector-select-page.tsx  # Select view
│   ├── connector-list-page.tsx    # List view
│   └── connector-detail-page.tsx  # Detail view
├── stores/
│   └── connector-filter-store.ts  # Category filter state (Zustand)
└── constants.ts                   # Connector types, configs
```

### Routing Structure (TanStack Router)

```
apps/web/src/routes/$locale/workspaces/$workspaceId/
├── workflow-connectors/
│   ├── index.tsx                  # List view
│   ├── select.tsx                 # Select view
│   └── $connectorId.tsx           # Detail view
```

**Route paths**:

- List: `/{locale}/workspaces/{workspaceId}/workflow-connectors`
- Select: `/{locale}/workspaces/{workspaceId}/workflow-connectors/select`
- Detail: `/{locale}/workspaces/{workspaceId}/workflow-connectors/{connectorId}`

**Add to route-paths.ts**:

```typescript
ROUTES.WORKFLOW_CONNECTORS = {
  LIST: '/$locale/workspaces/$workspaceId/workflow-connectors',
  SELECT: '/$locale/workspaces/$workspaceId/workflow-connectors/select',
  DETAIL: '/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId',
};
```

### State Management Strategy

**Server State (React Query)**:

- Connector list (with workspace scope)
- Connector details
- OAuth state generation
- CRUD mutations

**Global State (Zustand - Minimal)**:

- Active category filter (persist across navigation)
- Search query (select view)

**Local State (useState)**:

- Form inputs (name, description, config fields)
- Dialog open/close
- Password visibility toggles
- Loading states (component-level)

**Anti-pattern avoided**: No connector data in Zustand (use React Query cache)

### API Integration Pattern

**Use existing http-client**:

```typescript
// apps/web/src/features/workflow-connectors/api/connector-api.ts
import { apiRequest } from '@/shared/api/http-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const connectorKeys = {
  all: (workspaceId: string) => ['workflow-connectors', workspaceId] as const,
  detail: (workspaceId: string, id: string) => ['workflow-connectors', workspaceId, id] as const,
  oauthState: (workspaceId: string, id: string) => ['workflow-connectors', workspaceId, id, 'oauth'] as const,
};

// Hooks
export const useConnectors = (workspaceId: string) => {
  return useQuery({
    queryKey: connectorKeys.all(workspaceId),
    queryFn: async () => {
      const res = await apiRequest<{ data: ConnectorInstance[] }>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors`,
        data: {},
      });
      return res.data;
    },
  });
};

export const useConnectorDetail = (workspaceId: string, connectorId: string) => {
  return useQuery({
    queryKey: connectorKeys.detail(workspaceId, connectorId),
    queryFn: async () => {
      const res = await apiRequest<{ data: ConnectorInstance }>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors/${connectorId}`,
        data: {},
      });
      return res.data;
    },
    enabled: !!connectorId,
  });
};

export const useCreateConnector = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateConnectorInput) => {
      const res = await apiRequest<{ data: { id: string }; message: string }>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/post/workflow_connectors`,
        data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.all(workspaceId) });
    },
  });
};

export const useUpdateConnector = (workspaceId: string, connectorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateConnectorInput) => {
      const res = await apiRequest<{ message: string }>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/patch/workflow_connectors/${connectorId}`,
        data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: connectorKeys.detail(workspaceId, connectorId) });
    },
  });
};

export const useDeleteConnector = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connectorId: string) => {
      const res = await apiRequest<{ message: string }>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/delete/workflow_connectors/${connectorId}`,
        data: {},
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.all(workspaceId) });
    },
  });
};

export const useOAuthState = (workspaceId: string, connectorId: string) => {
  return useQuery({
    queryKey: connectorKeys.oauthState(workspaceId, connectorId),
    queryFn: async () => {
      const res = await apiRequest<{ data: { state: string } }>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors/${connectorId}/oauth2_state`,
        data: {},
      });
      return res.data;
    },
    enabled: false, // Manual trigger only
  });
};
```

**Benefits**:

- Automatic request retry
- Token refresh handling
- Centralized error handling
- Request/response interceptors
- Type-safe responses

### Dynamic Form Pattern

**Config-driven form generation**:

```typescript
// hooks/use-connector-config.ts
import { CONNECTOR_CONFIGS } from '../constants';

export const useConnectorConfig = (connectorType: string) => {
  const config = CONNECTOR_CONFIGS.find(c => c.connectorType === connectorType);
  return config || { configFields: [], oauth: false };
};

// components/connector-config-form.tsx
import { useForm } from '@tanstack/react-form';
import { Input } from '@workspace/ui/components/input';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { PasswordField } from './password-field';

export function ConnectorConfigForm({ connectorType, initialData, onSubmit }) {
  const config = useConnectorConfig(connectorType);
  const form = useForm({
    defaultValues: initialData || {},
    onSubmit: async (values) => {
      await onSubmit(values);
    }
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      {config.configFields.map(field => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          {field.type === 'checkbox' ? (
            <Checkbox
              id={field.name}
              {...form.getFieldProps(field.name)}
            />
          ) : field.secret ? (
            <PasswordField
              id={field.name}
              {...form.getFieldProps(field.name)}
              readOnly={field.readonly}
            />
          ) : (
            <Input
              id={field.name}
              type={field.type}
              {...form.getFieldProps(field.name)}
              readOnly={field.readonly}
            />
          )}
        </div>
      ))}
      <Button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

### Design System Compliance

**Input fields** (MANDATORY):

```tsx
<Input
  className={cn(
    'border border-input bg-background text-foreground',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
  )}
/>
```

**Buttons**:

```tsx
<Button variant="default" size="default">Create Connector</Button>
<Button variant="destructive" size="default">Delete</Button>
<Button variant="outline" size="default">Cancel</Button>
<Button variant="ghost" size="icon" aria-label="Settings">
  <Settings className="size-4" />
</Button>
```

**Cards**:

```tsx
<Card>
  <CardHeader>
    <CardTitle>SMTP Connector</CardTitle>
    <CardDescription>Email service configuration</CardDescription>
  </CardHeader>
  <CardContent>{/* Form */}</CardContent>
  <CardFooter>{/* Actions */}</CardFooter>
</Card>
```

**Dialogs**:

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Connector</DialogTitle>
      <DialogDescription>Update name and description</DialogDescription>
    </DialogHeader>
    {/* Form */}
  </DialogContent>
</Dialog>
```

**Loading states**:

```tsx
// Suspense boundaries
<Suspense fallback={<ConnectorListSkeleton />}>
  <ConnectorListContent />
</Suspense>;

// Skeleton components
export function ConnectorListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Typography**:

```tsx
import { Heading, Text } from '@workspace/ui/components/typography';

<Heading level={1}>Workflow Connectors</Heading>
<Heading level={2}>SMTP Configuration</Heading>
<Text size="large" weight="medium">Connector Details</Text>
<Text size="small" color="muted">Helper text</Text>
```

### OAuth Flow Enhancement

**Add OAuth callback route**:

```typescript
// routes/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback')({
  component: OAuthCallbackPage
});

function OAuthCallbackPage() {
  const { workspaceId, locale } = Route.useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      toast.error('OAuth authentication failed');
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.LIST,
        params: { locale, workspaceId }
      });
      return;
    }

    if (state) {
      // Extract connectorId from state token (backend encodes this)
      const connectorId = decodeStateToken(state);
      toast.success('Connected successfully');
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.DETAIL,
        params: { locale, workspaceId, connectorId }
      });
    }
  }, [state, error]);

  return <div>Processing OAuth response...</div>;
}
```

**OAuth button component**:

```typescript
export function OAuthButton({ connectorType, connectorId, workspaceId }) {
  const { refetch } = useOAuthState(workspaceId, connectorId);
  const connectorInfo = CONNECTOR_TYPES.find(c => c.type === connectorType);

  const handleOAuth = async () => {
    try {
      const { data } = await refetch();
      if (data?.state) {
        const oauthUrl = `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state=${data.state}`;
        window.location.href = oauthUrl;
      }
    } catch (err) {
      toast.error('Failed to initiate OAuth');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img src={connectorInfo?.logo} alt={connectorType} className="h-24 w-24" />
      <Button onClick={handleOAuth} variant="default" size="lg">
        Đăng nhập {connectorInfo?.name}
      </Button>
    </div>
  );
}
```

### Shared Constants Package

**Move to @workspace/beqeek-shared**:

```typescript
// packages/beqeek-shared/src/workflow-connectors/types.ts
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

export interface ConnectorTypeDefinition {
  type: ConnectorType;
  name: string;
  description: string;
  logo: string;
}

export interface ConfigFieldDefinition {
  name: string;
  type: 'text' | 'number' | 'password' | 'checkbox';
  label: string;
  required: boolean;
  secret: boolean;
  readonly?: boolean;
}

export interface ConnectorConfigDefinition {
  connectorType: ConnectorType;
  oauth: boolean;
  configFields: ConfigFieldDefinition[];
}

// packages/beqeek-shared/src/workflow-connectors/configs.ts
export const CONNECTOR_TYPES: ConnectorTypeDefinition[] = [
  {
    type: CONNECTOR_TYPE_SMTP,
    name: 'SMTP',
    description: 'Kết nối với máy chủ SMTP để gửi email.',
    logo: '/images/email.png',
  },
  // ... rest
];

export const CONNECTOR_CONFIGS: ConnectorConfigDefinition[] = [
  {
    connectorType: CONNECTOR_TYPE_SMTP,
    oauth: false,
    configFields: [
      { name: 'host', type: 'text', label: 'SMTP Host', required: true, secret: false },
      // ... rest
    ],
  },
  // ... rest
];
```

### Internationalization

**Add messages**:

```json
// messages/vi.json
{
  "workflowConnectors.title": "Quản lý Connector",
  "workflowConnectors.create": "Tạo Connector mới",
  "workflowConnectors.delete": "Xóa",
  "workflowConnectors.save": "Lưu",
  "workflowConnectors.cancel": "Hủy",
  "workflowConnectors.name": "Tên Connector",
  "workflowConnectors.description": "Mô tả",
  "workflowConnectors.type": "Loại Connector",
  "workflowConnectors.selectType": "Chọn loại connector",
  "workflowConnectors.search": "Tìm kiếm connector...",
  "workflowConnectors.noResults": "Không tìm thấy connector nào.",
  "workflowConnectors.deleteConfirm": "Bạn có chắc chắn muốn xóa connector này?",
  "workflowConnectors.created": "Connector đã được tạo",
  "workflowConnectors.updated": "Connector đã được cập nhật",
  "workflowConnectors.deleted": "Connector đã được xóa"
}

// messages/en.json
{
  "workflowConnectors.title": "Manage Connectors",
  "workflowConnectors.create": "Create New Connector",
  // ... translations
}
```

**Usage**:

```typescript
import * as m from '@/paraglide/messages';

<Heading level={1}>{m.workflowConnectors_title()}</Heading>
<Button>{m.workflowConnectors_create()}</Button>
```

## Key Architectural Decisions

1. **Feature-based structure**: All connector code in single feature directory
2. **React Query for server state**: No manual caching, automatic refetch
3. **TanStack Router**: File-based routing with type-safe params
4. **Minimal Zustand**: Only for UI state (category filter, search)
5. **TanStack Form**: Replace manual validation with schema-based forms
6. **shadcn/ui components**: Consistent with design system
7. **Shared constants**: Move to @workspace/beqeek-shared for reusability
8. **OAuth callback route**: Proper handling instead of manual reload
9. **Suspense boundaries**: Replace raptor-ripple with proper loading states
10. **Toast notifications**: Replace alert() with sonner toasts

## Performance Optimizations

1. **Code splitting**: Lazy load connector detail page
2. **Virtual scrolling**: If connector list > 100 items
3. **Debounced search**: 300ms delay on search input
4. **Optimistic updates**: Update UI before API response
5. **Stale-while-revalidate**: Show cached data while refetching

## Testing Strategy

1. **Unit tests**: API hooks, form validation, utility functions
2. **Component tests**: ConnectorCard, ConfigForm, PasswordField
3. **Integration tests**: Create/edit/delete flows
4. **E2E tests**: Full OAuth flow, multi-step connector creation

## Migration Path

**Phase 1**: Core types and API layer
**Phase 2**: List and Select views (read-only)
**Phase 3**: Create and Edit flows
**Phase 4**: OAuth integration
**Phase 5**: Delete and error handling
**Phase 6**: Testing and refinement
**Phase 7**: Documentation and migration guide

## Unresolved Questions

1. Should connector types/configs come from API in future? (Currently hardcoded)
2. How to handle OAuth token refresh/expiration? (Not in spec)
3. Should we use TanStack Form or React Hook Form? (Both viable)
4. Virtual scrolling threshold? (100 items?)
5. Should we keep POST-based RPC or migrate to RESTful? (Backward compat decision)

## Citations

- `/apps/web/src/shared/api/http-client.ts` (lines 1-126)
- `/CLAUDE.md` - State management philosophy, routing patterns
- `/docs/design-system.md` - Input styling, component usage
- TanStack Router docs - File-based routing
- React Query docs - Server state management
