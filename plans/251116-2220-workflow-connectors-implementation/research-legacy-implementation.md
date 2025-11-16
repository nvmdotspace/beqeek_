# Research Report: Legacy HTML/JavaScript Implementation

**Date**: 2025-11-16
**Source**: `/docs/html-module/workflow-connectors.blade.php`
**Analysis Scope**: jQuery/vanilla JS patterns, DOM manipulation, state management, architecture

## Executive Summary

Legacy implementation is a single-file Blade template (1138 lines) with vanilla JavaScript classes for routing, API calls, and view rendering. Uses manual DOM manipulation, inline styles, and global functions. No build process, component reusability, or type safety.

## Technical Architecture

### Class Structure

1. **Auth**: Token management with auto-refresh (24h interval)
2. **CommonUtils**: UUID generation, API calls, message display, navigation, popup management
3. **ConnectorAPI**: CRUD operations wrapper around CommonUtils.apiCall
4. **SelectView**: Connector type catalog rendering with search
5. **ListView**: Connector list with category tabs and filtering
6. **DetailView**: Connector configuration form with OAuth integration

### Routing System

**Client-side router** with history API:

```javascript
const ROUTES = [
  { path: '/workspace/{id}/workflow-connectors/select', viewId: 'select-view', render: SelectView.render },
  { path: '/workspace/{id}/workflow-connectors', viewId: 'list-view', render: ListView.render },
  { path: '/workspace/{id}/workflow-connectors/{connectorId}', viewId: 'detail-view', render: DetailView.render },
];
```

**Pattern**: RegExp matching, manual view toggling, async render functions

### State Management

**Global state**:

- `SelectView.connectors` - not used (SelectView is stateless)
- `ListView.connectors` - fetched connector list
- `ListView.activeCategory` - selected tab filter
- `DetailView.currentConnector` - active connector data
- `DetailView.connectorFormMode` - 'create' or 'edit'
- `DetailView.selectedConnectorType` - type for new connector
- `DetailView.currentAction` - popup action type

**Problems**:

- No reactivity (manual DOM updates)
- Scattered state across classes
- No single source of truth

### API Integration

**Auth flow**:

1. Check localStorage for `access_token`
2. If last refresh > 24h, call refresh endpoint
3. Store new tokens in localStorage
4. Add Bearer token to all requests

**API wrapper** (CommonUtils.apiCall):

- Hardcoded `API_BASE_URL` + `API_PREFIX`
- All requests use POST method
- Manual error handling with try/catch
- No response caching
- No optimistic updates

**Example**:

```javascript
const response = await CommonUtils.apiCall(
  `${API_PREFIX}/get/workflow_connectors`,
  {},
  true, // isGetAction flag (but still POST method)
);
```

### DOM Manipulation Patterns

**Manual string concatenation**:

```javascript
grid.innerHTML = connectorTypes
  .map(
    (c) => `
  <div class="connector-card" onclick="openConnectorForm('create', '${c.type}')">
    <img src="${c.logo}" alt="${c.name}">
    <span>${c.name}</span>
  </div>
`,
  )
  .join('');
```

**Problems**:

- XSS vulnerabilities (no sanitization)
- Performance issues (full innerHTML replacement)
- No virtual DOM diffing
- Event handlers recreated on each render

### Loading States

**Custom "raptor-ripple" animation**:

```javascript
CommonUtils.showRaptorRippleByElementById('connector-list', '<div>Loading...</div>');
// ... async operation
CommonUtils.hideRaptorRippleByElementById('connector-list', '<div>Data</div>');
```

**Pattern**: Manual class toggling, innerHTML replacement

### OAuth2 Flow

1. User clicks "Đăng nhập {provider}" button
2. Frontend calls `POST /get/workflow_connectors/{id}/oauth2_state`
3. Backend returns `state` token
4. Frontend redirects to `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state={state}`
5. OAuth provider redirects back with tokens
6. Backend updates connector config
7. User manually reloads page to see tokens

**Problems**:

- No callback handling
- Manual page reload required
- No error handling for OAuth failures

### Form Handling

**Dynamic field generation**:

```javascript
configDef.configFields.forEach((field) => {
  configHtml += `
    <div class="input-wrapper">
      <label>${field.label}${field.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>
      <input type="${field.secret ? 'password' : field.type}" id="config-${field.name}" value="${value}">
    </div>
  `;
});
```

**Validation**:

- Manual required field checks
- Manual type validation (isNaN for numbers)
- No form library
- Alert-based error messages

**Data collection**:

```javascript
for (const field of configDef.configFields) {
  const input = document.getElementById(`config-${field.name}`);
  const value = input.value;
  if (field.required && !value) {
    alert(`Trường ${field.label} là bắt buộc.`);
    return;
  }
  connectorData.config[field.name] = value;
}
```

### Password Visibility Toggle

**Manual implementation**:

```javascript
togglePassword(fieldId) {
  const input = document.getElementById(fieldId);
  const toggleIcon = input.nextElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    toggleIcon.textContent = 'visibility_off';
  } else {
    input.type = 'password';
    toggleIcon.textContent = 'visibility';
  }
}
```

### Global Function Bindings

**Pollutes global namespace**:

```javascript
window.navigateToSelect = CommonUtils.navigateToSelect;
window.openConnectorForm = DetailView.openConnectorForm.bind(DetailView);
window.deleteConnector = DetailView.deleteConnector.bind(DetailView);
// ... 11 more global bindings
```

**Problem**: Required for onclick handlers in innerHTML strings

### Hardcoded Configuration

**Connector types** (lines 134-207):

- 5 active types (SMTP, GOOGLE_SHEETS, ZALO_OA, KIOTVIET, ACTIVE_TABLE)
- 8 commented-out types
- Logo URLs hardcoded (mix of local paths and external CDNs)

**Connector configs** (lines 210-318):

- 5 active configs
- 6 commented-out configs
- Field definitions duplicated from spec

### Styling

**Inline styles**:

```html
<div style="padding: 8px; background: #f9f9f9;">
  <img src="${logo}" style="width: 150px;" />
</div>
```

**CSS classes**: Defined elsewhere (not in file)
**No design tokens**: Hardcoded colors (#ef4444, #f9f9f9)

## Key Insights

1. **Monolithic file**: All logic in single 1138-line file
2. **No separation of concerns**: HTML, JS, state, API in one place
3. **Manual reactivity**: Full innerHTML replacement on state change
4. **Global pollution**: 11+ window-bound functions for event handlers
5. **No type safety**: Vanilla JS, no TypeScript
6. **No build step**: Direct browser execution
7. **Hardcoded data**: Connector types/configs not from API
8. **POST-only APIs**: RPC-style, non-RESTful
9. **Alert-based UX**: Native alert() for errors/confirmations
10. **Markdown rendering**: Uses marked.js library (CDN)

## Migration Challenges

1. **State management**: Convert global class state to React Query + Zustand
2. **Routing**: Map custom router to TanStack Router file structure
3. **DOM manipulation**: Replace innerHTML with React components
4. **Event handlers**: Convert onclick strings to React event props
5. **Loading states**: Replace raptor-ripple with Suspense/loading components
6. **Form validation**: Integrate TanStack Form or React Hook Form
7. **OAuth flow**: Add callback route, handle OAuth errors
8. **Global functions**: Eliminate window bindings
9. **Hardcoded data**: Move to shared constants package
10. **Styling**: Convert inline styles to TailwindCSS design tokens

## Anti-Patterns Identified

❌ **Global state in classes**: Should use React hooks/stores
❌ **String-based DOM**: Should use JSX components
❌ **Manual validation**: Should use form library with schema
❌ **Alert dialogs**: Should use toast/modal components
❌ **Hardcoded colors**: Should use design tokens
❌ **POST for reads**: Should use GET (or keep for backward compat)
❌ **No error boundaries**: Should wrap views in ErrorBoundary
❌ **No loading skeletons**: Should use Skeleton components
❌ **Tight coupling**: API, state, view logic intertwined
❌ **No tests**: Impossible to unit test

## Positive Patterns (To Preserve)

✅ **Class organization**: Clear separation of SelectView, ListView, DetailView
✅ **Dynamic forms**: Config-driven field generation
✅ **Category filtering**: Tab-based connector type filtering
✅ **Search functionality**: Real-time search in Select View
✅ **OAuth state flow**: Secure state token pattern
✅ **Password toggle**: User-friendly secret field visibility
✅ **Loading feedback**: Visual loading indicators (improve implementation)
✅ **Markdown docs**: Embedded documentation display

## Citations

- `/docs/html-module/workflow-connectors.blade.php` (lines 1-1138)
- Routing system (lines 115-131)
- Class definitions (lines 320-1063)
- Connector types (lines 134-207)
- API calls (lines 382-405, 519-572)
- Form rendering (lines 718-748, 957-990)
- OAuth flow (lines 804-824)
