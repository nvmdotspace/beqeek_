# Workflow Forms Implementation Plan

**Date**: 2025-11-14
**Status**: Implementation Phase - Phase 1-5 Complete ✅
**Estimated Duration**: 5-7 days
**Progress**: 71% (5/7 phases)

## Overview

Migration of legacy blade.php-based Form Builder to modern React architecture using TanStack Router, React Query, Zustand, and shadcn/ui components. Feature enables visual form creation with drag-drop, real-time preview, and template-based initialization.

## Architecture Summary

- **Pattern**: POST-based RPC API (`/api/workspace/{workspaceId}/workflow/{verb}/workflow_forms`)
- **State**: React Query (server data) + useState (local UI) + Zustand (form builder state)
- **Routing**: TanStack Router file-based (`/$locale/workspaces/$workspaceId/workflow-forms/*`)
- **Components**: shadcn/ui + custom form builder components
- **i18n**: Paraglide.js (Vietnamese default, English support)

## Implementation Phases

| Phase                                   | Description                     | Status      | Estimate | Actual   |
| --------------------------------------- | ------------------------------- | ----------- | -------- | -------- |
| [Phase 1](phase-01-foundation.md)       | API Client + Types + Constants  | ✅ Complete | 1 day    | < 1 hour |
| [Phase 2](phase-02-core-hooks.md)       | React Query Hooks + State       | ✅ Complete | 1 day    | < 30 min |
| [Phase 3](phase-03-routing.md)          | Routes + Navigation + Guards    | ✅ Complete | 0.5 day  | < 15 min |
| [Phase 4](phase-04-list-select.md)      | List & Template Selection Views | ✅ Complete | 1 day    | < 30 min |
| [Phase 5](phase-05-form-builder.md)     | Form Builder Detail View        | ✅ Complete | 1.5 days | < 45 min |
| [Phase 6](phase-06-field-management.md) | Field Config + Drag-Drop        | 🔄 Pending  | 1 day    | -        |
| [Phase 7](phase-07-preview-polish.md)   | Preview + i18n + Testing        | 🔄 Pending  | 1 day    | -        |

## Key Deliverables

1. **API Integration** - Workflow forms client matching POST-based RPC pattern
2. **Type Safety** - Full TypeScript coverage for forms, fields, templates
3. **UI Components** - Reusable form builder components using shadcn/ui
4. **State Management** - Proper separation: React Query (API), useState (UI), Zustand (builder)
5. **i18n Support** - Vietnamese/English translations for all UI strings
6. **Testing** - Unit tests for hooks, integration tests for API
7. **Documentation** - Usage guides, API docs, component docs

## Success Criteria

- ✅ Feature parity with legacy blade.php implementation
- ✅ Type-safe API calls with proper error handling
- ✅ Real-time form preview with live updates
- ✅ Drag-drop field reordering works smoothly
- ✅ All 3 templates (BASIC, SUBSCRIPTION, SURVEY) work correctly
- ✅ Form CRUD operations (create, read, update, delete) functional
- ✅ i18n complete for vi/en locales
- ✅ No console errors, proper loading states
- ✅ Follows design system tokens and accessibility standards

## Dependencies

- `@workspace/ui` - shadcn/ui components (Button, Input, Dialog, Select, etc.)
- `@tanstack/react-query` - Server state management
- `@tanstack/react-router` - File-based routing
- `zustand` - Form builder state (drag-drop, field editing)
- `react-beautiful-dnd` or `@dnd-kit` - Drag-drop functionality
- `paraglide.js` - i18n

## Migration Strategy

1. **No breaking changes** - Backend API remains unchanged
2. **Progressive enhancement** - Build alongside legacy, then replace
3. **Type-first** - Define types from functional spec before implementation
4. **Component-driven** - Reusable components before page assembly
5. **Test-driven** - Write tests alongside feature development

## Risk Mitigation

| Risk                         | Impact | Mitigation                                                         |
| ---------------------------- | ------ | ------------------------------------------------------------------ |
| API contract mismatch        | High   | Validate with backend team, test against staging                   |
| Drag-drop library complexity | Medium | Use well-tested library (@dnd-kit), fallback to manual reorder     |
| State management confusion   | Medium | Clear boundaries: Query (server), useState (UI), Zustand (builder) |
| i18n coverage gaps           | Low    | Extract all strings early, use Paraglide workflow                  |
| Preview rendering issues     | Medium | Isolate preview in sandboxed component, use error boundaries       |

## Notes

- Legacy code uses global functions, vanilla JS routing → migrate to React patterns
- FormType templates hardcoded client-side → keep same for consistency
- Flatpickr for date inputs → replace with shadcn/ui DatePicker or keep if compatible
- "Raptor ripple" loading pattern → replace with shadcn/ui Skeleton

## Resolved Decisions (from Legacy Code Analysis)

**Date Analyzed**: 2025-11-14

| Decision               | Answer                  | Rationale                                                                                                             |
| ---------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1. Form ID generation  | **Server-side**         | API returns ID in create response. Client has UUIDv7 utility but doesn't use for forms                                |
| 2. E2EE encryption     | **Not required**        | Legacy has no encryption. Form configs are non-sensitive metadata (labels, types, placeholders)                       |
| 3. Form versioning     | **Phase 8+ (future)**   | Legacy uses simple CRUD with overwrite. No version/history tracking                                                   |
| 4. Public embedding    | **Phase 8+ (future)**   | Legacy has no public URLs/iframes. All routes require authentication. "Embedding" means internal workflow integration |
| 5. Validation approach | **Manual + TypeScript** | Legacy uses if-checks + regex. Project has no Zod dependency. Use runtime validation with strict typing               |

**Analysis Source**: `docs/html-module/workflow-forms.blade.php` (1184 lines)

**Key Findings**:

- Form creation: Client sends data → API returns `{ data: { id } }` (server-generated)
- No `encryptionKey`, `e2eeEncryption`, or encryption logic found
- Update endpoint: `PATCH /workflow_forms/{id}` overwrites entire config (no versioning)
- All API calls require `Authorization: Bearer ${token}` (no public access)
- Field validation: Simple `if (!value) return error` pattern (lines 795-826)
