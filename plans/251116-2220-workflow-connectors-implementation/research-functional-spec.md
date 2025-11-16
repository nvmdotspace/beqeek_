# Research Report: Workflow Connectors Functional Specification

**Date**: 2025-11-16
**Source**: `/docs/workflow-connectors-functional-spec.md`
**Analysis Scope**: Business requirements, data structures, API patterns, user flows

## Executive Summary

Workflow Connectors module enables users to configure third-party service integrations (SMTP, Google Sheets, Zalo OA, Kiotviet, Active Tables) for use in automation workflows. System uses 3-view architecture (Select, List, Detail) with dynamic form rendering based on connector type.

## Core Features

### F1: Create Connector Flow

1. User clicks "Create Connector" from List View
2. System shows Select View with connector catalog (searchable)
3. User selects connector type (e.g., SMTP)
4. Popup requests `name` and `description`
5. API creates `ConnectorInstance`, navigates to Detail View

### F2: List View

- Display all `ConnectorInstance` with name + description
- Tab-based filtering by `connectorType` (All, SMTP, Zalo, etc.) with counts
- Navigate to Detail View on item click
- "Create Connector" button starts F1

### F3: Detail View

- Display connector name
- Dynamic config form based on `connectorType`
- OAuth2 button for OAuth connectors (Google Sheets, Zalo OA)
- "Save" button for config changes only
- "Delete" button (with confirmation)
- "Settings" button (gear icon) opens popup to edit name/description (F4)
- "Back" button returns to List View
- Markdown documentation display

### F4: Edit Basic Info

- Triggered from Detail View via "Settings" button
- Popup to edit `name` and `description`
- "Confirm" button calls PATCH API

## Data Structures

### Connector Types (Client-side Static Data)

```json
{
  "type": "SMTP",
  "name": "SMTP",
  "description": "Kết nối với máy chủ SMTP để gửi email.",
  "logo": "/images/email.png"
}
```

**Available types**: SMTP, GOOGLE_SHEETS, ZALO_OA, KIOTVIET, ACTIVE_TABLE

### Connector Config Definitions (Client-side Static)

```json
{
  "connectorType": "SMTP",
  "oauth": false,
  "configFields": [
    {
      "name": "host",
      "type": "text",
      "label": "SMTP Host",
      "required": true,
      "secret": false
    }
  ]
}
```

**Field types**: text, number, password, checkbox
**Field attributes**: name, type, label, required, secret, readonly

### Connector Instance (Dynamic API Data)

```json
{
  "id": "snowflake-id-1234",
  "name": "Email Marketing của tôi",
  "description": "Dùng để gửi email cho chiến dịch X",
  "connectorType": "SMTP",
  "config": { "host": "smtp.example.com", "port": 587 },
  "documentation": "### Hướng dẫn SMTP\n..."
}
```

## API Endpoints

**Pattern**: `POST /api/workspace/{WORKSPACE_ID}/workflow/{verb}/{resource}`

- **List connectors**: `POST /get/workflow_connectors` → `{ data: [ConnectorInstance] }`
- **Get details**: `POST /get/workflow_connectors/{id}` → `{ data: ConnectorInstance }`
- **Create**: `POST /post/workflow_connectors` → `{ data: { id }, message }`
- **Update**: `POST /patch/workflow_connectors/{id}` → `{ message }`
- **Delete**: `POST /delete/workflow_connectors/{id}` → `{ message }`
- **OAuth2 state**: `POST /get/workflow_connectors/{id}/oauth2_state` → `{ data: { state } }`
- **OAuth2 redirect**: `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state={state}`

**Note**: All endpoints use POST method (RPC-style), even for reads/deletes.

## Connector Type Specifications

### SMTP (No OAuth)

**Fields**: host, port, username, password, from_email, from_name, checkDailyUnique, trackingEmail
**Secrets**: password

### Google Sheets (OAuth)

**Fields**: access_token, expires_in, refresh_token, scope, token_type, created (all readonly)
**OAuth flow**: Redirects to Google for authorization

### Zalo OA (OAuth)

**Fields**: accessToken, refreshToken (both readonly, secret)
**OAuth flow**: Redirects to Zalo for authorization

### Kiotviet (No OAuth)

**Fields**: clientId, clientSecret, retailerCode, accessToken
**Secrets**: clientSecret, accessToken

### Active Table (No OAuth)

**Fields**: tableId, tableKey
**Secrets**: tableKey
**Integration**: Links to existing Active Tables via ID + encryption key

## Key Insights

1. **Static client-side data**: Connector types and config definitions are hardcoded (not from API)
2. **POST-based RPC**: All APIs use POST, including reads (non-RESTful pattern)
3. **Dynamic form rendering**: Config forms generated from `CONNECTOR_CONFIGS` array
4. **OAuth2 state management**: Backend generates state token, frontend redirects to OAuth provider
5. **Dual save operations**: "Save" for config, "Settings" popup for name/description
6. **Active Table integration**: Special connector type for internal table connections

## Security Considerations

1. **Secret fields**: Password/token fields have `secret: true` flag (render as password type)
2. **OAuth tokens**: Stored in config but readonly, managed by backend
3. **Workspace scoping**: All APIs scoped to `WORKSPACE_ID`
4. **Auth tokens**: Bearer token in Authorization header

## UX Patterns

1. **3-view navigation**: Select → List → Detail
2. **Modal dialogs**: Name/description editing in popups
3. **Loading states**: "raptor-ripple" animation placeholders
4. **Search**: Real-time filtering in Select View
5. **Category tabs**: Dynamic tabs with counts in List View
6. **Inline documentation**: Markdown rendered in Detail View

## Unresolved Questions

1. How are connector instances used in workflows? (Not covered in spec)
2. What triggers OAuth token refresh? (Expiration handling not documented)
3. Can connectors be shared across workspaces?
4. What happens to workflows when connector is deleted?
5. Are there rate limits or usage quotas per connector?

## Citations

- `/docs/workflow-connectors-functional-spec.md` (lines 1-272)
- Section 2: Core Features (lines 9-51)
- Section 3: Data Structures (lines 53-231)
- Section 4: API Endpoints (lines 233-272)
