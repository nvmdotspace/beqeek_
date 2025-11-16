# Workflow Connectors Phase 3: Create/Edit Flows

**Status:** PENDING
**Priority:** HIGH
**Created:** 2025-11-16
**Estimated:** 3-4 days

## Overview

Phase 3 implements connector creation/edit flows after foundation (Phase 1) and list/select views (Phase 2) completion. Enables users to create, configure, and manage connector instances with dynamic forms, OAuth flows, and full CRUD operations.

## Context

**Foundation (Phase 1 - COMPLETE):**

- API layer with React Query hooks
- Shared types/constants in @workspace/beqeek-shared
- Query key management and cache invalidation

**List & Select Views (Phase 2 - COMPLETE):**

- ConnectorListPage with category filtering
- ConnectorSelectPage with connector type catalog
- Reusable components (cards, tabs, search, empty states)

**Phase 3 Scope:**

- Create connector dialog from select page
- Connector detail page with dynamic config forms
- Edit basic info (name/description) dialog
- OAuth2 flow integration
- Delete confirmation
- Markdown documentation viewer

## Key Technical Decisions

1. **Form Management:** React Hook Form + Zod for validation
2. **Dynamic Forms:** Generate inputs from CONNECTOR_CONFIGS
3. **Routing:** TanStack Router with DETAIL route
4. **State:** React Query mutations for all CRUD operations
5. **UI Components:** @workspace/ui Dialog, Input, Button, Textarea
6. **OAuth Flow:** API-driven state token + external redirect
7. **Markdown:** react-markdown for documentation rendering

## Deliverables

1. Create connector dialog component
2. Connector detail page with dynamic config form
3. Edit info dialog component
4. OAuth button and callback handling
5. Delete confirmation dialog
6. Documentation viewer component
7. Route files for detail and OAuth callback
8. Form validation schemas with Zod

## Success Criteria

- ✅ Users can create connectors with name/description
- ✅ Dynamic config forms render based on connectorType
- ✅ OAuth connectors show OAuth button and handle flow
- ✅ Config changes persist via API
- ✅ Name/description editable via settings dialog
- ✅ Delete requires confirmation and invalidates cache
- ✅ Documentation displays when available
- ✅ All forms validate with proper error messages
- ✅ Navigation flows work correctly

## Related Files

**Phase Documentation:**

- `phase-01-create-edit-flows.md` - Detailed implementation guide

**Existing Code:**

- `apps/web/src/features/workflow-connectors/api/connector-api.ts` - API hooks
- `apps/web/src/features/workflow-connectors/pages/connector-select-page.tsx` - Select page (entry point)
- `packages/beqeek-shared/src/workflow-connectors/connector-configs.ts` - Config schemas

**New Code:**

- `apps/web/src/features/workflow-connectors/pages/connector-detail-page.tsx`
- `apps/web/src/features/workflow-connectors/components/create-connector-dialog.tsx`
- `apps/web/src/features/workflow-connectors/components/edit-info-dialog.tsx`
- `apps/web/src/features/workflow-connectors/components/connector-config-form.tsx`
- `apps/web/src/features/workflow-connectors/components/oauth-button.tsx`
- `apps/web/src/features/workflow-connectors/components/delete-confirmation-dialog.tsx`
- `apps/web/src/features/workflow-connectors/components/markdown-viewer.tsx`
- `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId.tsx`
- `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback.tsx`

## Next Steps

1. Review detailed phase file: `phase-01-create-edit-flows.md`
2. Implement create dialog (F1)
3. Implement detail page with dynamic forms (F3)
4. Add edit dialog (F4)
5. Integrate OAuth flow
6. Test end-to-end flows
7. Update connector-select-page to trigger dialog
