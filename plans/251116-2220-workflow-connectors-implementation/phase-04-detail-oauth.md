# Phase 04: Detail View & OAuth Integration

**Duration**: 6-8 hours
**Dependencies**: Phase 03 complete
**Risk Level**: Medium-High (OAuth callback handling)

## Context

Implement detail view with full config form, OAuth integration, and documentation display. Handle OAuth state generation, redirect, callback, and token storage. Render Markdown documentation using marked.js or react-markdown.

## Overview

Build the most complex view: connector configuration form with dynamic fields, OAuth button (for Google Sheets, Zalo OA), password visibility toggles, save/delete actions, and embedded documentation. Add OAuth callback route for proper return handling.

## Key Insights

1. **OAuth callback route**: Dedicated route handles OAuth return (no manual reload)
2. **State token decoding**: Backend embeds connectorId in state (need to document format)
3. **Readonly OAuth fields**: Tokens displayed but not editable
4. **Markdown rendering**: Use react-markdown for security (sanitizes HTML)
5. **Optimistic save**: Update form state immediately, rollback on error

## Requirements

### Functional Requirements

- [ ] Display connector name, ID (copyable)
- [ ] Render dynamic config form based on type
- [ ] OAuth button for oauth-enabled connectors
- [ ] Save config changes
- [ ] Delete connector (with confirmation)
- [ ] Edit basic info (name/description) via settings button
- [ ] Display markdown documentation
- [ ] OAuth callback route handles redirect
- [ ] Navigate back to list view

### Non-Functional Requirements

- [ ] Form autosaves on blur (optional UX enhancement)
- [ ] Confirmation dialog on delete
- [ ] Copy-to-clipboard for connector ID
- [ ] Markdown sanitization (prevent XSS)
- [ ] Loading states during save/OAuth

## Implementation Steps

### Step 1: Detail View Route (1h)

**File**: `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { ConnectorDetailSkeleton } from '@/features/workflow-connectors/components/connector-detail-skeleton';

const ConnectorDetailPageLazy = lazy(() =>
  import('@/features/workflow-connectors/pages/connector-detail-page').then(m => ({
    default: m.ConnectorDetailPage
  }))
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId')({
  component: ConnectorDetailRoute
});

function ConnectorDetailRoute() {
  return (
    <Suspense fallback={<ConnectorDetailSkeleton />}>
      <ConnectorDetailPageLazy />
    </Suspense>
  );
}
```

### Step 2: OAuth Callback Route (1.5h)

**File**: `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback.tsx`

```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/route-paths';
import * as m from '@/paraglide/messages';

export const Route = createFileRoute(
  '/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback'
)({
  component: OAuthCallbackPage
});

function OAuthCallbackPage() {
  const { workspaceId, locale } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      toast.error(errorDescription || m.workflowConnectors_oauthFailed());
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.LIST,
        params: { locale, workspaceId }
      });
      return;
    }

    if (state) {
      // Backend encodes connectorId in state - extract it
      // Format: base64({ connectorId, timestamp, nonce })
      try {
        const decoded = JSON.parse(atob(state));
        const connectorId = decoded.connectorId;

        toast.success(m.workflowConnectors_oauthSuccess());
        navigate({
          to: ROUTES.WORKFLOW_CONNECTORS.DETAIL,
          params: { locale, workspaceId, connectorId }
        });
      } catch (err) {
        toast.error('Invalid OAuth state');
        navigate({
          to: ROUTES.WORKFLOW_CONNECTORS.LIST,
          params: { locale, workspaceId }
        });
      }
    } else {
      toast.error('Missing OAuth state');
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.LIST,
        params: { locale, workspaceId }
      });
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 size-16 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{m.workflowConnectors_processingOAuth()}</p>
      </div>
    </div>
  );
}
```

### Step 3: Detail Page Component (3-4h)

**File**: `apps/web/src/features/workflow-connectors/pages/connector-detail-page.tsx`

Main component that:

- Fetches connector details
- Renders header (name, back button, delete/settings/save buttons)
- Renders OAuth button if oauth-enabled type
- Renders dynamic config form
- Renders markdown documentation
- Handles save/delete mutations

### Step 4: OAuth Button Component (1.5h)

**File**: `apps/web/src/features/workflow-connectors/components/oauth-button.tsx`

```typescript
import { Button } from '@workspace/ui/components/button';
import { useOAuthState } from '../api/connector-api';
import { CONNECTOR_TYPES } from '@workspace/beqeek-shared/workflow-connectors';
import { toast } from 'sonner';
import * as m from '@/paraglide/messages';

interface OAuthButtonProps {
  connectorType: string;
  connectorId: string;
  workspaceId: string;
}

export function OAuthButton({ connectorType, connectorId, workspaceId }: OAuthButtonProps) {
  const { refetch, isFetching } = useOAuthState(workspaceId, connectorId);
  const connectorInfo = CONNECTOR_TYPES.find(c => c.type === connectorType);

  const handleOAuthClick = async () => {
    try {
      const { data } = await refetch();
      if (data?.state) {
        const oauthUrl = `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state=${data.state}`;
        window.location.href = oauthUrl;
      } else {
        toast.error(m.workflowConnectors_oauthStateFailed());
      }
    } catch (error) {
      toast.error(error.message || m.workflowConnectors_oauthFailed());
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {connectorInfo?.logo && (
        <img
          src={connectorInfo.logo}
          alt={connectorInfo.name}
          className="h-24 w-24 object-contain"
        />
      )}
      <Button onClick={handleOAuthClick} disabled={isFetching} size="lg">
        {isFetching
          ? m.workflowConnectors_connecting()
          : m.workflowConnectors_connectWith({ provider: connectorInfo?.name || connectorType })}
      </Button>
    </div>
  );
}
```

### Step 5: Config Form Component (2-3h)

Dynamic form that renders fields based on CONNECTOR_CONFIGS, handles checkbox/text/number/password types, validation, readonly fields for OAuth tokens.

### Step 6: Documentation Display (0.5h)

Use react-markdown with security plugins (remark-gfm, rehype-sanitize).

## Todo List

- [ ] Create detail view route
- [ ] Create OAuth callback route
- [ ] Implement ConnectorDetailPage
- [ ] Create OAuthButton component
- [ ] Create ConnectorConfigForm component
- [ ] Create MarkdownDisplay component
- [ ] Add copy-to-clipboard for connector ID
- [ ] Add delete confirmation dialog
- [ ] Test OAuth flow end-to-end
- [ ] Test config save with validation
- [ ] Test documentation rendering
- [ ] Add i18n messages (oauth._, detail._)

## Success Criteria

- [ ] Detail page displays connector data
- [ ] Config form saves changes
- [ ] OAuth button redirects to provider
- [ ] OAuth callback returns to detail page
- [ ] Markdown documentation renders correctly
- [ ] Delete confirmation prevents accidental deletion
- [ ] Can copy connector ID to clipboard
- [ ] Settings button opens edit dialog

## Risk Assessment

**High Risk**: OAuth state token format unknown (need backend documentation)
**Mitigation**: Test with existing working connector, log state format

**Medium Risk**: Markdown XSS if not sanitized
**Mitigation**: Use react-markdown with rehype-sanitize

## Security Considerations

- Sanitize markdown to prevent XSS
- OAuth state token validated by backend
- Delete requires user confirmation

## Next Steps

**Phase 05**: Delete operations and comprehensive error handling

## Unresolved Questions

1. What is exact format of OAuth state token? (Need backend team input)
2. Should config autosave on blur or require explicit save?
3. How long are OAuth tokens valid? (Display expiration?)
