# Workflow Connectors Implementation - Executive Summary

**Plan Created**: 2025-11-16 22:20
**Estimated Duration**: 4-5 days (40-50 hours)
**Complexity**: Medium-High
**Status**: Ready for Implementation

## Overview

Comprehensive plan to migrate Workflow Connectors module from 1138-line legacy Blade template (jQuery/vanilla JS) to modern React/TypeScript architecture using TanStack Router, React Query, shadcn/ui, and design system compliance.

## Implementation Approach

### Architecture Strategy

**From**: Monolithic Blade template with jQuery, global state, string-based DOM manipulation
**To**: Feature-based React module with type-safe routing, server state management, component composition

### Key Improvements

1. **Type Safety**: 100% TypeScript coverage, zero `any` types
2. **State Management**: React Query (server) + Zustand (minimal global) + useState (local)
3. **Component Reusability**: 80%+ shared components via shadcn/ui
4. **Performance**: Code splitting, optimistic updates, debounced search
5. **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
6. **Developer Experience**: Hot reload, type inference, auto-generated routes
7. **User Experience**: Toast notifications, loading skeletons, error boundaries
8. **Maintainability**: Feature-based structure, shared constants, comprehensive tests

## Phase Breakdown

### Phase 01: Foundation (6-8h) - Types, API Layer, Shared Constants

**Deliverables**:

- TypeScript interfaces in `@workspace/beqeek-shared/workflow-connectors`
- React Query hooks for CRUD operations
- Route definitions in `route-paths.ts`
- Query key factory for cache management

**Success Criteria**: Zero TS errors, 100% type coverage, package builds successfully

---

### Phase 02: List & Select Views (6-8h) - Read-Only UI

**Deliverables**:

- Connector list with category tabs and filtering
- Connector type catalog with search
- Loading skeletons and empty states
- Mobile-responsive grid layouts

**Success Criteria**: Views render from API, filters work, mobile-responsive, keyboard accessible

---

### Phase 03: Create & Edit Flows (8-10h) - Dynamic Forms

**Deliverables**:

- Create connector dialog (name, type, description)
- Edit basic info dialog
- Password field with visibility toggle
- Form validation with TanStack Form
- Toast notifications

**Success Criteria**: Can create/edit connectors, validation works, optimistic updates, toast feedback

---

### Phase 04: Detail View & OAuth (6-8h) - Configuration & Integration

**Deliverables**:

- Connector detail page with dynamic config form
- OAuth integration button
- OAuth callback route
- Markdown documentation display
- Save/delete actions

**Success Criteria**: Config form saves, OAuth flow completes, markdown renders, delete works

---

### Phase 05: Delete & Error Handling (4-6h) - Robustness

**Deliverables**:

- Delete confirmation dialog
- Error boundaries
- Mutation error handling
- Network error handling with retry

**Success Criteria**: Errors handled gracefully, offline scenarios work, retry mechanism functional

---

### Phase 06: Testing & Refinement (6-8h) - Quality Assurance

**Deliverables**:

- Unit tests (80%+ coverage)
- Component tests
- Integration tests
- E2E tests (Playwright)
- Performance optimizations

**Success Criteria**: All tests pass, Lighthouse 90+, WCAG AA compliant, no console errors

---

### Phase 07: Documentation (4-6h) - Knowledge Transfer

**Deliverables**:

- Component documentation (JSDoc)
- Migration guide from legacy system
- API usage examples
- User guide and FAQ

**Success Criteria**: All components documented, migration guide complete, API examples provided

## Technology Stack

**Routing**: TanStack Router v1.133+ (file-based, type-safe)
**State**: React Query v5 (server), Zustand 5.x (global), useState (local)
**Forms**: TanStack Form v0.30+
**UI**: shadcn/ui (Button, Dialog, Input, Card, etc.)
**Notifications**: sonner
**Markdown**: react-markdown + rehype-sanitize
**Testing**: Vitest, React Testing Library, Playwright

## File Structure

```
apps/web/src/features/workflow-connectors/
├── api/
│   ├── connector-api.ts           # React Query hooks
│   ├── types.ts                   # API request/response types
│   └── query-keys.ts              # Query key factory
├── components/
│   ├── connector-card.tsx         # Select view grid item
│   ├── connector-list-item.tsx    # List view row
│   ├── connector-config-form.tsx  # Dynamic config form
│   ├── create-connector-dialog.tsx
│   ├── edit-basic-info-dialog.tsx
│   ├── oauth-button.tsx
│   ├── password-field.tsx
│   ├── category-tabs.tsx
│   ├── search-input.tsx
│   └── [...skeletons, empty-states...]
├── hooks/
│   ├── use-connector-types.ts
│   ├── use-connector-config.ts
│   └── use-oauth-callback.ts
├── pages/
│   ├── connector-select-page.tsx
│   ├── connector-list-page.tsx
│   └── connector-detail-page.tsx
└── constants.ts

packages/beqeek-shared/src/workflow-connectors/
├── types.ts                       # Core interfaces
├── constants.ts                   # Connector type constants
├── connector-types.ts             # Type definitions array
├── connector-configs.ts           # Config definitions array
└── index.ts                       # Barrel export

apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/
├── index.tsx                      # List view
├── select.tsx                     # Select view
├── $connectorId.tsx               # Detail view
└── oauth-callback.tsx             # OAuth return handler
```

## Risk Assessment

### High Risk

**OAuth callback handling**: State token format unclear, need backend team input
**Mitigation**: Test with existing connector, document state format with backend team

**Backward compatibility**: POST-based RPC APIs (non-RESTful)
**Mitigation**: Keep POST methods, use existing http-client pattern

### Medium Risk

**Dynamic form validation**: Complex field types (text, number, checkbox, password)
**Mitigation**: Use TanStack Form with schema validation

**Active Table integration**: Encryption key handling
**Mitigation**: Follow existing encryption-core patterns

### Low Risk

**List/Select views**: Standard CRUD operations
**Category filtering**: Simple state management
**i18n**: Paraglide.js already integrated

## Success Metrics

### Functional

- [ ] All 5 connector types work (SMTP, Google Sheets, Zalo OA, Kiotviet, Active Table)
- [ ] CRUD operations functional with optimistic updates
- [ ] OAuth2 flow completes without manual reload
- [ ] Dynamic forms validate correctly
- [ ] Category filtering and search work
- [ ] Mobile-responsive (1-col → 3-col grid)

### Technical

- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] 80%+ test coverage
- [ ] Lighthouse score 90+
- [ ] WCAG 2.1 AA compliant
- [ ] Dark mode support

### User Experience

- [ ] Toast notifications (no alert dialogs)
- [ ] Loading skeletons (no raptor-ripple)
- [ ] Confirmation dialogs on destructive actions
- [ ] Error messages are user-friendly
- [ ] Keyboard navigation works

## Migration Strategy

1. **Parallel Development**: Build new feature alongside legacy
2. **Feature Flag**: Toggle via query param or config (`?useNewConnectors=true`)
3. **Internal Testing**: Test with team before public rollout
4. **Gradual Rollout**: 10% → 50% → 100% of users
5. **Rollback Plan**: Keep legacy Blade template for 1 sprint
6. **Data Compatibility**: No API changes required

## Dependencies

**Blocked By**: None (can start immediately)
**Blocks**: Workflow builder integration (connectors used in workflows)

## Resource Requirements

**Developer Time**: 1 senior frontend developer, full-time for 1 week
**Backend Support**: 2-4 hours for OAuth state format documentation
**QA Time**: 1 day for testing OAuth flows and edge cases

## Post-Implementation

### Monitoring

- Track connector creation rate
- Monitor OAuth success/failure rates
- Log API errors (by endpoint)
- Measure page load times

### Documentation

- Update onboarding docs
- Create video tutorials for OAuth setup
- Add to developer wiki

### Maintenance

- Update connector types when new integrations added
- Keep OAuth provider configs current
- Monitor for breaking changes in third-party APIs

## Related Files

**Plan Files**:

- `/plans/251116-2220-workflow-connectors-implementation/plan.md`
- `/plans/251116-2220-workflow-connectors-implementation/phase-01-foundation.md`
- `/plans/251116-2220-workflow-connectors-implementation/phase-02-list-select-views.md`
- `/plans/251116-2220-workflow-connectors-implementation/phase-03-create-edit-flows.md`
- `/plans/251116-2220-workflow-connectors-implementation/phase-04-detail-oauth.md`
- `/plans/251116-2220-workflow-connectors-implementation/phase-05-delete-error-handling.md`
- `/plans/251116-2220-workflow-connectors-implementation/phase-06-testing-refinement.md`
- `/plans/251116-2220-workflow-connectors-implementation/phase-07-documentation.md`

**Research Files**:

- `/plans/251116-2220-workflow-connectors-implementation/research-functional-spec.md`
- `/plans/251116-2220-workflow-connectors-implementation/research-legacy-implementation.md`
- `/plans/251116-2220-workflow-connectors-implementation/research-architecture.md`

**Source Files**:

- `/docs/workflow-connectors-functional-spec.md` (business requirements)
- `/docs/html-module/workflow-connectors.blade.php` (legacy implementation)
- `/docs/design-system.md` (UI standards)
- `/apps/web/src/shared/api/http-client.ts` (API client)

## Unresolved Questions

1. **OAuth State Format**: What is exact structure of OAuth state token? (Need backend team)
2. **Config Autosave**: Should config autosave on blur or require explicit save? (UX decision)
3. **OAuth Token Expiration**: How long are tokens valid? Should we display expiration? (Backend team)
4. **Pagination**: Do we need pagination for connector list? (Current spec shows no limit)
5. **Virtual Scrolling**: Threshold for enabling virtual scrolling? (100 connectors?)
6. **Storybook**: Should we create Storybook stories for components? (Optional enhancement)
7. **Video Tutorials**: Do we need video walkthroughs for OAuth setup? (Documentation decision)

## Next Steps

1. **Kickoff Meeting**: Review plan with team, assign phase ownership
2. **Backend Coordination**: Get OAuth state format documentation
3. **Phase 01 Start**: Begin foundation work (types, API layer)
4. **Daily Standups**: Track progress, identify blockers
5. **Code Reviews**: Review each phase before merging
6. **Testing**: QA team tests after Phase 04 completion
7. **Launch**: Deploy behind feature flag, monitor metrics

---

**Plan Author**: Claude Code
**Reviewed By**: [Pending]
**Approved By**: [Pending]
**Start Date**: [TBD]
**Target Completion**: [TBD]
