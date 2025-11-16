# Workflow Connectors Implementation Plan

**Created**: 2025-11-16 22:20
**Status**: Ready for Implementation
**Duration**: 4-5 days
**Complexity**: Medium-High

## Quick Start

1. **Read**: [SUMMARY.md](./SUMMARY.md) - Executive overview
2. **Review**: Research reports (functional spec, legacy code, architecture)
3. **Execute**: Follow phase files sequentially (01 → 07)
4. **Track**: Update todo lists in each phase as you progress

## Plan Structure

### Core Planning Documents

- **[plan.md](./plan.md)** - Main plan overview, objectives, success criteria
- **[SUMMARY.md](./SUMMARY.md)** - Executive summary, metrics, migration strategy
- **README.md** (this file) - Navigation guide

### Research Reports (Background)

- **[research-functional-spec.md](./research-functional-spec.md)** - Business requirements analysis
  - Core features (F1-F4)
  - Data structures (static + dynamic)
  - API endpoints (POST-based RPC)
  - Connector type specifications
  - Security considerations

- **[research-legacy-implementation.md](./research-legacy-implementation.md)** - Legacy code analysis
  - jQuery/vanilla JS patterns
  - DOM manipulation anti-patterns
  - State management issues
  - Migration challenges
  - Positive patterns to preserve

- **[research-architecture.md](./research-architecture.md)** - Modern React strategy
  - Feature module structure
  - TanStack Router patterns
  - React Query integration
  - Design system compliance
  - Architectural decisions

### Phase Implementation Guides

- **[phase-01-foundation.md](./phase-01-foundation.md)** (6-8h)
  - Types, API layer, shared constants
  - React Query hooks
  - Query key factory
  - Zero dependencies, can start immediately

- **[phase-02-list-select-views.md](./phase-02-list-select-views.md)** (6-8h)
  - List and Select views (read-only)
  - Category filtering, search
  - Loading skeletons, empty states
  - Mobile-responsive grids

- **[phase-03-create-edit-flows.md](./phase-03-create-edit-flows.md)** (8-10h)
  - Create connector dialog
  - Edit basic info dialog
  - Dynamic forms with validation
  - Toast notifications

- **[phase-04-detail-oauth.md](./phase-04-detail-oauth.md)** (6-8h)
  - Detail view with config form
  - OAuth integration
  - OAuth callback route
  - Markdown documentation

- **[phase-05-delete-error-handling.md](./phase-05-delete-error-handling.md)** (4-6h)
  - Delete confirmation
  - Error boundaries
  - Mutation error handling
  - Network error recovery

- **[phase-06-testing-refinement.md](./phase-06-testing-refinement.md)** (6-8h)
  - Unit tests (80%+ coverage)
  - Component tests
  - Integration tests
  - E2E tests (Playwright)

- **[phase-07-documentation.md](./phase-07-documentation.md)** (4-6h)
  - Component documentation
  - Migration guide
  - API usage examples
  - User guide

## Reading Order

### For Implementation

1. **SUMMARY.md** - Get context and overview
2. **plan.md** - Understand objectives and success criteria
3. **research-architecture.md** - Study proposed architecture
4. **phase-01-foundation.md** - Start implementing
5. Continue through phases 02-07 sequentially

### For Review/Approval

1. **SUMMARY.md** - Executive overview
2. **plan.md** - Objectives and phases
3. **research-functional-spec.md** - Business requirements
4. Skim phase files for technical approach

### For Backend Coordination

1. **research-functional-spec.md** - API endpoints section
2. **research-architecture.md** - API integration pattern
3. **phase-04-detail-oauth.md** - OAuth state format needs

## Key Decisions

### Architecture

- **State**: React Query (server) + Zustand (minimal global) + useState (local)
- **Routing**: TanStack Router (file-based)
- **Forms**: TanStack Form (schema validation)
- **UI**: shadcn/ui components only (design system compliance)
- **i18n**: Paraglide.js (existing integration)

### Shared Constants

- Move connector types/configs to `@workspace/beqeek-shared/workflow-connectors`
- Import in app/admin/backend for consistency
- Single source of truth

### API Compatibility

- Keep POST-based RPC (backward compatible)
- Use existing http-client with Bearer tokens
- No API changes required

## Success Criteria (Quick Reference)

**Functional**:

- ✅ All 5 connector types work
- ✅ CRUD with optimistic updates
- ✅ OAuth flow without manual reload
- ✅ Dynamic forms validate correctly
- ✅ Mobile-responsive

**Technical**:

- ✅ Zero TS errors
- ✅ 80%+ test coverage
- ✅ Lighthouse 90+
- ✅ WCAG 2.1 AA

**UX**:

- ✅ Toast notifications (no alerts)
- ✅ Loading skeletons
- ✅ Confirmation dialogs
- ✅ Keyboard navigation

## Critical Dependencies

**Before Phase 04**:

- OAuth state token format documentation (backend team)

**Before Phase 06**:

- Playwright E2E test environment setup

**Before Phase 07**:

- Migration timeline decision (feature flag duration)

## Risks & Mitigation

| Risk                       | Severity | Mitigation                                |
| -------------------------- | -------- | ----------------------------------------- |
| OAuth state format unknown | High     | Get backend docs, test existing connector |
| Dynamic form complexity    | Medium   | Use TanStack Form, schema validation      |
| Active Table integration   | Medium   | Follow encryption-core patterns           |
| Test coverage gaps         | Low      | Start tests in Phase 01 (TDD)             |

## Unresolved Questions

Track in each phase file, escalate blockers to team:

1. OAuth state token format? (Phase 04)
2. Config autosave vs explicit save? (Phase 03)
3. Pagination threshold? (Phase 02)
4. Virtual scrolling trigger? (Phase 02)
5. Storybook stories needed? (Phase 07)

## Contact Points

**For Questions**:

- Architecture decisions → Tech lead
- OAuth integration → Backend team
- Design system → UI/UX team
- Testing strategy → QA lead

## Related Documentation

**External**:

- `/docs/workflow-connectors-functional-spec.md` (business requirements)
- `/docs/html-module/workflow-connectors.blade.php` (legacy code)
- `/docs/design-system.md` (UI standards)
- `/CLAUDE.md` (development rules)

**Internal**:

- All files in this directory

## Progress Tracking

Update after each phase:

- [ ] Phase 01: Foundation (6-8h)
- [ ] Phase 02: List & Select Views (6-8h)
- [ ] Phase 03: Create & Edit Flows (8-10h)
- [ ] Phase 04: Detail View & OAuth (6-8h)
- [ ] Phase 05: Delete & Error Handling (4-6h)
- [ ] Phase 06: Testing & Refinement (6-8h)
- [ ] Phase 07: Documentation (4-6h)

**Total**: 40-50 hours (1 week full-time)

---

**Ready to start?** Begin with [phase-01-foundation.md](./phase-01-foundation.md)
