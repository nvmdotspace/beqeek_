# Phase 01: Create/Edit Flows Implementation

**Date:** 2025-11-16
**Priority:** HIGH
**Status:** PENDING
**Estimated Time:** 3-4 days

## Context Links

- **Functional Spec:** `/Users/macos/Workspace/buildinpublic/beqeek/docs/workflow-connectors-functional-spec.md`
- **API Layer:** `apps/web/src/features/workflow-connectors/api/connector-api.ts`
- **Config Schemas:** `packages/beqeek-shared/src/workflow-connectors/connector-configs.ts`
- **Select Page:** `apps/web/src/features/workflow-connectors/pages/connector-select-page.tsx`
- **Route Constants:** `apps/web/src/shared/route-paths.ts`

## Overview

Implement connector creation, detail view with dynamic config forms, edit dialogs, OAuth flow, and delete functionality. Builds on completed Phase 1 (API) and Phase 2 (List/Select views).

## Key Insights

1. **Dynamic Form Generation:** CONNECTOR_CONFIGS provides schema for rendering forms (text, number, password, checkbox types)
2. **OAuth vs Manual:** oauth=true connectors show OAuth button instead of manual token fields
3. **Readonly Fields:** OAuth tokens are readonly after authentication
4. **Two-Step Create:** Select type → Fill name/description → Navigate to detail page → Configure
5. **API Pattern:** All endpoints use POST with RPC-style paths (`/workflow/{verb}/workflow_connectors`)
6. **State Management:** React Query handles all server state, local useState for dialog visibility
7. **Validation:** Zod schemas generated from CONNECTOR_CONFIGS required/secret fields
8. **OAuth Flow:** GET state token → Redirect to external URL → Callback route → Refresh detail page

## Requirements

### F1: Create Connector Flow

**User Flow:**

1. From ConnectorSelectPage, click connector card
2. Dialog appears requesting name + description
3. User fills and submits
4. API creates ConnectorInstance
5. Navigate to ROUTES.WORKFLOW_CONNECTORS.DETAIL with new connectorId

**Components:**

- CreateConnectorDialog (controlled dialog with form)
- Uses useCreateConnector mutation
- Form validation: name (required, min 3), description (optional)
- Auto-navigate on success

**Integration:**

- Update connector-select-page.tsx handleCardClick to open dialog
- Pass selected connectorType to dialog
- Dialog handles create + navigation

### F3: Connector Detail Page

**Layout:**

- Header: Back button + Connector name + Settings icon + Delete button
- Body: Two-column layout
  - Left: Dynamic config form based on connectorType
  - Right: Documentation markdown viewer
- Footer: Save button (config only)

**Dynamic Config Form:**

- Read CONNECTOR_CONFIGS for selected connectorType
- Render fields based on configFields array
- Field types: text → Input, number → Input[type=number], password → Input[type=password], checkbox → Checkbox
- Show readonly badge for readonly fields
- OAuth connectors: Show OAuth button at top, readonly fields below
- Non-OAuth: Show editable fields with Save button

**OAuth Flow:**

- Button: "Connect with [Service Name]"
- On click: useOAuthState refetch → Get state token
- Redirect: `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state={state}`
- After OAuth: Redirect to callback route
- Callback route: Extract state from URL → Redirect back to detail page
- Detail page: Auto-refetch to show updated tokens

**Save Flow:**

- Collect all config field values
- Call useUpdateConnector with { config: {...} }
- Show success toast
- Invalidate queries

**Components:**

- ConnectorDetailPage (main page)
- ConnectorConfigForm (dynamic form)
- OAuthButton (OAuth flow trigger)
- MarkdownViewer (documentation display)

### F4: Edit Basic Info

**Trigger:** Settings icon in detail page header
**Dialog:** EditInfoDialog

- Form fields: name (required), description (optional)
- Pre-fill with current values
- useUpdateConnector mutation with { name, description }
- Close dialog on success
- Invalidate detail query to refresh header

### Additional Features

**Delete Connector:**

- Delete button in header
- DeleteConfirmationDialog with warning message
- useDeleteConnector mutation
- Navigate to ROUTES.WORKFLOW_CONNECTORS.LIST on success

**Documentation Viewer:**

- Component: MarkdownViewer
- Props: markdown string from connector.documentation
- Library: react-markdown
- Styling: Prose classes from Tailwind Typography
- Empty state if no documentation

## Architecture Decisions

### Form Management

**React Hook Form + Zod:**

```tsx
// Dynamic schema generation
const configSchema = z.object(
  Object.fromEntries(
    configFields
      .filter((f) => f.required && !f.readonly)
      .map((f) => [f.name, f.type === 'checkbox' ? z.boolean() : z.string().min(1)]),
  ),
);
```

**Benefits:**

- Type-safe form handling
- Automatic validation
- Error message display
- Dirty state tracking

### Dynamic Form Rendering

**Pattern:**

```tsx
function ConnectorConfigForm({ connectorType, initialValues, onSave }) {
  const config = CONNECTOR_CONFIGS.find((c) => c.connectorType === connectorType);

  return (
    <form>
      {config.configFields.map((field) => (
        <FormField key={field.name} field={field} />
      ))}
    </form>
  );
}
```

**Field Component Mapping:**

- text → Input with border-input focus-visible:ring-ring
- number → Input type="number"
- password → Input type="password" with eye toggle
- checkbox → Checkbox with Label
- readonly → Input disabled with readonly badge

### OAuth Flow Architecture

**State Management:**

1. User clicks OAuth button
2. Trigger useOAuthState refetch (enabled: false by default)
3. API returns { state: "uuid-token" }
4. Construct OAuth URL: `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state={state}`
5. window.location.href = oauthUrl (full page redirect)
6. External service authenticates user
7. Redirects to callback route with state param
8. Callback route extracts state, redirects to detail page
9. Detail page refetches connector data (now has tokens in config)

**Callback Route:**

```tsx
// oauth-callback.tsx
export const Route = createFileRoute(ROUTES.WORKFLOW_CONNECTORS.OAUTH_CALLBACK)({
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const connectorId = searchParams.get('connector_id'); // Assume API includes this

  useEffect(() => {
    // Redirect back to detail page
    navigate({
      to: ROUTES.WORKFLOW_CONNECTORS.DETAIL,
      params: { locale, workspaceId, connectorId },
    });
  }, []);

  return <div>Processing OAuth callback...</div>;
}
```

### State Management Strategy

**Server State (React Query):**

- Connector list (useConnectors)
- Connector detail (useConnectorDetail)
- OAuth state token (useOAuthState - manual refetch)

**Local State (useState):**

- Dialog visibility (createDialogOpen, editDialogOpen, deleteDialogOpen)
- Form values (managed by React Hook Form)
- UI toggles (show password, expand documentation)

**No Zustand Needed:**

- All state is either server-driven or ephemeral UI state
- No global preferences or cross-feature state

## Related Code Files

**Existing:**

- `apps/web/src/features/workflow-connectors/api/connector-api.ts` - All API hooks
- `apps/web/src/features/workflow-connectors/api/types.ts` - API response types
- `apps/web/src/features/workflow-connectors/api/query-keys.ts` - Query key factory
- `packages/beqeek-shared/src/workflow-connectors/types.ts` - Core types
- `packages/beqeek-shared/src/workflow-connectors/connector-configs.ts` - Config schemas
- `packages/beqeek-shared/src/workflow-connectors/connector-types.ts` - Type definitions
- `apps/web/src/shared/route-paths.ts` - Route constants (DETAIL, OAUTH_CALLBACK)

**New (To Create):**

**Pages:**

- `apps/web/src/features/workflow-connectors/pages/connector-detail-page.tsx`

**Components:**

- `apps/web/src/features/workflow-connectors/components/create-connector-dialog.tsx`
- `apps/web/src/features/workflow-connectors/components/edit-info-dialog.tsx`
- `apps/web/src/features/workflow-connectors/components/connector-config-form.tsx`
- `apps/web/src/features/workflow-connectors/components/oauth-button.tsx`
- `apps/web/src/features/workflow-connectors/components/delete-confirmation-dialog.tsx`
- `apps/web/src/features/workflow-connectors/components/markdown-viewer.tsx`
- `apps/web/src/features/workflow-connectors/components/config-field.tsx` (atomic field renderer)

**Routes:**

- `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId.tsx`
- `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback.tsx`

**Utilities (Optional):**

- `apps/web/src/features/workflow-connectors/utils/form-schema-builder.ts` (Zod schema generator)
- `apps/web/src/features/workflow-connectors/utils/oauth-url-builder.ts` (OAuth URL constructor)

## Implementation Steps

### Step 1: Create Connector Dialog (F1)

**Files:** `create-connector-dialog.tsx`

**Implementation:**

1. Create Dialog component from @workspace/ui
2. Form with name (Input, required, min 3 chars) and description (Textarea, optional)
3. React Hook Form + Zod validation schema
4. Props: open, onOpenChange, connectorType, onSuccess
5. useCreateConnector mutation
6. Loading state on submit button
7. Error toast on API failure
8. Call onSuccess(connectorId) after create
9. Close dialog on success

**Validation Schema:**

```tsx
const createSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});
```

**Integration:**

- Update `connector-select-page.tsx`:
  - Add state: `const [createDialogOpen, setCreateDialogOpen] = useState(false)`
  - Add state: `const [selectedType, setSelectedType] = useState<ConnectorType | null>(null)`
  - Update handleCardClick: `setSelectedType(type); setCreateDialogOpen(true);`
  - Add CreateConnectorDialog component with navigate on success

### Step 2: Detail Page Route

**Files:** `$connectorId.tsx` (route file)

**Implementation:**

1. Create route file with createFileRoute(ROUTES.WORKFLOW_CONNECTORS.DETAIL)
2. Lazy import ConnectorDetailPage
3. Export Route constant with component and beforeLoad auth guard
4. Suspense wrapper with loading state

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const ConnectorDetailPageLazy = lazy(() =>
  import('@/features/workflow-connectors/pages/connector-detail-page').then((m) => ({
    default: m.ConnectorDetailPage,
  })),
);

export const Route = createFileRoute(ROUTES.WORKFLOW_CONNECTORS.DETAIL)({
  component: ConnectorDetailComponent,
  beforeLoad: () => {
    if (!getIsAuthenticated()) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
});

function ConnectorDetailComponent() {
  return (
    <Suspense fallback={<div>Loading connector...</div>}>
      <ConnectorDetailPageLazy />
    </Suspense>
  );
}
```

### Step 3: Connector Detail Page Structure

**Files:** `connector-detail-page.tsx`

**Implementation:**

1. Use getRouteApi(ROUTES.WORKFLOW_CONNECTORS.DETAIL) for params
2. Extract workspaceId, connectorId, locale from useParams()
3. useConnectorDetail(workspaceId, connectorId) query
4. Find config definition from CONNECTOR_CONFIGS
5. Layout:
   - Header with back button, name, settings icon, delete button
   - Two-column grid (lg:grid-cols-2)
   - Left: ConnectorConfigForm
   - Right: MarkdownViewer (if documentation exists)
6. State: editDialogOpen, deleteDialogOpen
7. Handle loading/error states

**Component Structure:**

```tsx
export function ConnectorDetailPage() {
  const { workspaceId, connectorId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const { data: connector, isLoading } = useConnectorDetail(workspaceId, connectorId);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) return <LoadingState />;
  if (!connector) return <ErrorState />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <Heading level={1}>{connector.name}</Heading>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ConnectorConfigForm
          connectorType={connector.connectorType}
          initialValues={connector.config}
          workspaceId={workspaceId}
          connectorId={connectorId}
        />
        {connector.documentation && <MarkdownViewer markdown={connector.documentation} />}
      </div>

      {/* Dialogs */}
      <EditInfoDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        connector={connector}
        workspaceId={workspaceId}
        connectorId={connectorId}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        connectorName={connector.name}
        workspaceId={workspaceId}
        connectorId={connectorId}
        onSuccess={() => navigate({ to: ROUTES.WORKFLOW_CONNECTORS.LIST, params: { locale, workspaceId } })}
      />
    </div>
  );
}
```

### Step 4: Dynamic Config Form

**Files:** `connector-config-form.tsx`, `config-field.tsx`

**Implementation:**

**connector-config-form.tsx:**

1. Find CONNECTOR_CONFIGS entry for connectorType
2. Check if oauth connector
3. If oauth: Show OAuthButton at top + readonly fields below
4. If not oauth: Show editable fields + Save button
5. React Hook Form with dynamic Zod schema
6. useUpdateConnector mutation
7. Success toast on save
8. Dirty state tracking (disable Save if pristine)

**config-field.tsx:**

1. Accept props: field (ConfigFieldDefinition), control, name
2. Switch on field.type to render appropriate input
3. Use FormField, FormItem, FormLabel, FormControl, FormMessage from @workspace/ui
4. Apply input styling standards (border-input, focus-visible:ring-ring)
5. Show readonly badge if field.readonly
6. Password field: Add eye icon toggle for visibility

**Zod Schema Builder:**

```tsx
function buildConfigSchema(configFields: ConfigFieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  configFields.forEach((field) => {
    if (field.readonly) return; // Skip readonly fields

    let fieldSchema: z.ZodTypeAny;

    if (field.type === 'checkbox') {
      fieldSchema = z.boolean();
    } else if (field.type === 'number') {
      fieldSchema = z.coerce.number();
    } else {
      fieldSchema = z.string();
    }

    if (field.required) {
      fieldSchema = fieldSchema.min(1, `${field.label} is required`);
    } else {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  });

  return z.object(shape);
}
```

### Step 5: OAuth Button Component

**Files:** `oauth-button.tsx`

**Implementation:**

1. Props: workspaceId, connectorId, connectorType
2. Get service name from CONNECTOR_TYPES
3. useOAuthState hook (enabled: false)
4. On click handler:
   - Trigger refetch()
   - Get state from response.data.state
   - Build OAuth URL: `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state=${state}`
   - window.location.href = oauthUrl
5. Loading state while fetching state token
6. Error handling with toast

```tsx
export function OAuthButton({ workspaceId, connectorId, connectorType }: Props) {
  const { data, refetch, isLoading } = useOAuthState(workspaceId, connectorId);
  const connectorTypeDef = CONNECTOR_TYPES.find((t) => t.type === connectorType);

  const handleOAuthClick = async () => {
    try {
      const {
        data: { state },
      } = await refetch();
      const oauthUrl = `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state=${state}`;
      window.location.href = oauthUrl;
    } catch (error) {
      toast.error('Failed to start OAuth flow');
    }
  };

  return (
    <Button onClick={handleOAuthClick} disabled={isLoading}>
      {isLoading ? 'Preparing...' : `Connect with ${connectorTypeDef?.name}`}
    </Button>
  );
}
```

### Step 6: Edit Info Dialog (F4)

**Files:** `edit-info-dialog.tsx`

**Implementation:**

1. Dialog component with form
2. Fields: name (required), description (optional)
3. Pre-fill with connector.name and connector.description
4. React Hook Form + Zod validation
5. useUpdateConnector mutation
6. Close dialog on success
7. Success toast

**Validation Schema:**

```tsx
const editInfoSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});
```

### Step 7: Delete Confirmation Dialog

**Files:** `delete-confirmation-dialog.tsx`

**Implementation:**

1. AlertDialog component (destructive variant)
2. Props: open, onOpenChange, connectorName, workspaceId, connectorId, onSuccess
3. Show warning message with connector name
4. useDeleteConnector mutation
5. Loading state on Delete button
6. Call onSuccess() after delete
7. Error handling with toast

**Dialog Content:**

```tsx
<AlertDialogDescription>
  Are you sure you want to delete "{connectorName}"? This action cannot be undone. All workflows using this connector
  may be affected.
</AlertDialogDescription>
```

### Step 8: Markdown Viewer

**Files:** `markdown-viewer.tsx`

**Implementation:**

1. Install: `pnpm add react-markdown`
2. Component accepts markdown string prop
3. Render with ReactMarkdown component
4. Apply prose classes from Tailwind Typography
5. Card wrapper with border and padding
6. Empty state if no markdown

```tsx
export function MarkdownViewer({ markdown }: { markdown?: string }) {
  if (!markdown) {
    return (
      <Card className="p-6">
        <Text color="muted">No documentation available</Text>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </Card>
  );
}
```

### Step 9: OAuth Callback Route

**Files:** `oauth-callback.tsx` (route file)

**Implementation:**

1. Create route file for ROUTES.WORKFLOW_CONNECTORS.OAUTH_CALLBACK
2. Extract state from URL search params
3. Parse state to get connectorId (or store in localStorage before redirect)
4. Auto-redirect back to detail page
5. Detail page will auto-refetch and show updated tokens

**Alternative Approach (if state doesn't include connectorId):**

- Before OAuth redirect, store connectorId in localStorage
- In callback route, retrieve from localStorage
- Clear localStorage after redirect

```tsx
export const Route = createFileRoute(ROUTES.WORKFLOW_CONNECTORS.OAUTH_CALLBACK)({
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  useEffect(() => {
    // Get connectorId from localStorage (set before OAuth redirect)
    const connectorId = localStorage.getItem('oauth-connector-id');
    localStorage.removeItem('oauth-connector-id');

    if (connectorId) {
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.DETAIL,
        params: { locale, workspaceId, connectorId },
      });
    } else {
      // Fallback to list page if no connectorId
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.LIST,
        params: { locale, workspaceId },
      });
    }
  }, [navigate, workspaceId, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <Text>Completing OAuth authentication...</Text>
      </div>
    </div>
  );
}
```

### Step 10: Integration & Testing

**Tasks:**

1. Update connector-select-page to use CreateConnectorDialog
2. Test create flow: Select type → Fill dialog → Navigate to detail
3. Test detail page loading with useConnectorDetail
4. Test dynamic form rendering for each connector type
5. Test OAuth flow for GOOGLE_SHEETS, ZALO_OA
6. Test manual config for SMTP, KIOTVIET, ACTIVE_TABLE
7. Test edit info dialog
8. Test delete confirmation
9. Test navigation flows (back buttons, redirects)
10. Test error states (API failures, validation errors)
11. Test form validation for all field types
12. Test markdown rendering with sample documentation

**Edge Cases:**

- OAuth callback without connectorId
- API failure during create
- Concurrent edits (optimistic updates?)
- Missing required config fields
- Invalid config field values
- Long connector names/descriptions
- Empty documentation
- Network errors during OAuth redirect

## Todo List

- [ ] Install dependencies: react-markdown, @tailwindcss/typography
- [ ] Create create-connector-dialog.tsx component
- [ ] Update connector-select-page.tsx to use dialog
- [ ] Create detail page route file ($connectorId.tsx)
- [ ] Create connector-detail-page.tsx
- [ ] Create connector-config-form.tsx with dynamic rendering
- [ ] Create config-field.tsx for atomic field rendering
- [ ] Build Zod schema generator utility
- [ ] Create oauth-button.tsx component
- [ ] Create edit-info-dialog.tsx component
- [ ] Create delete-confirmation-dialog.tsx component
- [ ] Create markdown-viewer.tsx component
- [ ] Create oauth-callback.tsx route
- [ ] Implement localStorage pattern for OAuth connectorId
- [ ] Add loading states to all mutations
- [ ] Add error handling with toasts
- [ ] Add form validation error messages
- [ ] Test create flow end-to-end
- [ ] Test detail page for all connector types
- [ ] Test OAuth flow (GOOGLE_SHEETS, ZALO_OA)
- [ ] Test edit info flow
- [ ] Test delete flow
- [ ] Test navigation flows
- [ ] Test edge cases and error states
- [ ] Add TypeScript strict mode compliance
- [ ] Add accessibility features (ARIA labels, keyboard nav)
- [ ] Add mobile responsive design
- [ ] Code review and refactoring
- [ ] Update documentation

## Success Criteria

✅ **F1: Create Connector Flow**

- Dialog appears when selecting connector type
- Form validates name (min 3 chars) and optional description
- API creates ConnectorInstance successfully
- Navigation redirects to detail page with new ID
- List page updates after creation (cache invalidation)

✅ **F3: Detail Page**

- Page loads connector data from API
- Header shows name, back button, settings, delete
- Dynamic config form renders based on connectorType
- OAuth connectors show OAuth button + readonly fields
- Non-OAuth connectors show editable fields + Save button
- Save button updates config via API
- Documentation viewer displays markdown
- Loading and error states handled gracefully

✅ **F4: Edit Info**

- Settings icon opens edit dialog
- Dialog pre-fills current name/description
- Form validates and updates via API
- Dialog closes on success
- Detail page header refreshes with new name

✅ **OAuth Flow**

- OAuth button triggers state token fetch
- Redirects to external OAuth URL
- Callback route handles return
- Detail page shows updated tokens
- Tokens are readonly in form

✅ **Delete Flow**

- Delete button shows confirmation dialog
- Dialog warns about consequences
- Delete mutation succeeds
- Navigation redirects to list page
- List page updates (cache invalidation)

✅ **General**

- All forms use React Hook Form + Zod
- Input styling follows design system standards
- All mutations show loading states
- Error handling with user-friendly toasts
- Navigation flows work correctly
- TypeScript types are correct
- Accessibility features included
- Mobile responsive

## Risk Assessment

### High Risk

1. **OAuth Flow Complexity**
   - Risk: State token not including connectorId
   - Mitigation: Use localStorage pattern or URL params
   - Fallback: Redirect to list page if ID missing

2. **Dynamic Form Validation**
   - Risk: Zod schema generation bugs for edge cases
   - Mitigation: Unit tests for schema builder
   - Fallback: Manual schema per connector type

### Medium Risk

1. **API Response Shape**
   - Risk: Documentation field might be null/undefined
   - Mitigation: Optional chaining and default values
   - Validation: TypeScript types from API layer

2. **Race Conditions**
   - Risk: Concurrent updates to same connector
   - Mitigation: React Query automatic refetch on focus
   - Note: No optimistic updates needed for now

### Low Risk

1. **Markdown Rendering**
   - Risk: Malicious markdown input
   - Mitigation: react-markdown sanitizes by default
   - Note: Documentation comes from backend, trusted source

2. **Form State Management**
   - Risk: Form not resetting after save
   - Mitigation: React Hook Form reset() after mutation
   - Testing: Verify dirty state tracking

## Security Considerations

1. **Secret Fields**
   - Never log password/token fields
   - Use type="password" for secret inputs
   - Consider masking display in readonly fields

2. **OAuth State Token**
   - Token is one-time use (verified by backend)
   - No need to validate on frontend
   - Stored temporarily in localStorage, cleared after use

3. **API Mutations**
   - All mutations use POST (backend pattern)
   - workspaceId scopes all operations
   - Auth guards on all routes

4. **Input Validation**
   - Client-side validation with Zod
   - Server-side validation assumed (backend responsibility)
   - Sanitize markdown rendering (react-markdown default)

5. **CSRF Protection**
   - Not needed for OAuth flow (external redirect)
   - API client handles auth tokens
   - No cookies involved

## Next Steps

**Phase 4 (Future):**

- Connector testing page (test SMTP, API connections)
- Connector usage analytics (which workflows use which connectors)
- Connector templates (pre-filled configs for common services)
- Connector duplication feature
- Bulk operations (delete multiple connectors)
- Advanced search/filtering in list view
- Connector health monitoring
- Audit logs for connector changes

**Immediate Next Actions:**

1. Review this plan with team
2. Set up development branch: `feature/workflow-connectors-phase-3`
3. Install dependencies (react-markdown, etc.)
4. Start with Step 1 (Create Dialog)
5. Proceed sequentially through implementation steps
6. Test after each major component
7. Integration testing after all components complete
8. Code review before merge
9. Update main documentation
10. Deploy to staging for QA testing
