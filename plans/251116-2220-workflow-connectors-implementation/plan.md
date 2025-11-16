# Workflow Connectors Implementation Plan

**Created**: 2025-11-16 22:20
**Status**: Planning
**Estimated Duration**: 4-5 days
**Complexity**: Medium-High

## Overview

Migrate Workflow Connectors module from 1138-line Blade template (jQuery/vanilla JS) to modern React/TypeScript feature using TanStack Router, React Query, shadcn/ui. Implement 3-view architecture (Select, List, Detail) with dynamic config forms, OAuth2 integration, and design system compliance.

## Objectives

1. **Feature parity**: Replicate all legacy functionality (5 connector types, CRUD, OAuth)
2. **Modern architecture**: TanStack Router + React Query + Zustand (minimal)
3. **Type safety**: Full TypeScript coverage with no `any` types
4. **Design system**: Use shadcn/ui, design tokens, WCAG 2.1 AA accessibility
5. **Performance**: Code splitting, optimistic updates, 80%+ reusable components
6. **Maintainability**: Feature-based structure, shared constants, comprehensive tests

## Phases

**Phase 01**: Foundation - Types, API Layer, Shared Constants (6-8h)
**Phase 02**: List & Select Views (Read-Only UI) (6-8h)
**Phase 03**: Create & Edit Flows (Dynamic Forms) (8-10h)
**Phase 04**: Detail View & OAuth Integration (6-8h)
**Phase 05**: Delete Operations & Error Handling (4-6h)
**Phase 06**: Testing, Refinement, Loading States (6-8h)
**Phase 07**: Documentation & Migration Guide (4-6h)

## Success Criteria

- [ ] All 5 connector types functional (SMTP, Google Sheets, Zalo OA, Kiotviet, Active Table)
- [ ] CRUD operations with optimistic updates
- [ ] OAuth2 flow with proper callback handling
- [ ] Dynamic config forms with validation
- [ ] Category filtering and search
- [ ] Toast notifications (no alert dialogs)
- [ ] Loading skeletons (no raptor-ripple)
- [ ] Mobile-responsive (design system compliance)
- [ ] Dark mode support (design tokens)
- [ ] i18n support (Vietnamese, English)
- [ ] Unit tests (80%+ coverage)
- [ ] E2E tests for critical flows
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors

## Dependencies

- TanStack Router v1.133+ (file-based routing)
- TanStack Query v5 (server state)
- TanStack Form v0.30+ (dynamic forms)
- shadcn/ui components (Button, Input, Dialog, Card, etc.)
- Zustand 5.x (minimal global state)
- sonner (toast notifications)
- @workspace/beqeek-shared (shared constants)

## Risk Assessment

**High Risk**:

- OAuth callback handling (backend state token decoding unclear)
- Backward compatibility with POST-based RPC APIs

**Medium Risk**:

- Dynamic form validation (complex field types)
- Active Table connector integration (encryption key handling)

**Low Risk**:

- List/Select view rendering
- Category filtering
- i18n message translation

## Migration Strategy

1. **Parallel implementation**: Build new feature alongside legacy
2. **Feature flag**: Toggle between old/new via query param or config
3. **Incremental rollout**: Test with internal users first
4. **Rollback plan**: Keep legacy Blade template for 1 sprint
5. **Data compatibility**: No API changes, use existing endpoints

## Related Files

- Functional spec: `/docs/workflow-connectors-functional-spec.md`
- Legacy code: `/docs/html-module/workflow-connectors.blade.php`
- Design system: `/docs/design-system.md`
- API client: `/apps/web/src/shared/api/http-client.ts`
- Route paths: `/apps/web/src/shared/route-paths.ts`

## Phase Files

- [Phase 01: Foundation](./phase-01-foundation.md)
- [Phase 02: List & Select Views](./phase-02-list-select-views.md)
- [Phase 03: Create & Edit Flows](./phase-03-create-edit-flows.md)
- [Phase 04: Detail View & OAuth](./phase-04-detail-oauth.md)
- [Phase 05: Delete & Error Handling](./phase-05-delete-error-handling.md)
- [Phase 06: Testing & Refinement](./phase-06-testing-refinement.md)
- [Phase 07: Documentation](./phase-07-documentation.md)
