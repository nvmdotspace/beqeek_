# Workflow Forms Implementation Plan

**Created**: 2025-11-14 23:05
**Status**: Planning Complete
**Estimated Duration**: 5-7 days

## Executive Summary

Comprehensive migration plan for Workflow Forms feature from legacy blade.php implementation to modern React architecture. Maintains 100% feature parity while improving code quality, type safety, and user experience.

## Project Structure

```
plans/251114-2305-workflow-forms-implementation/
├── README.md                             # This file - overview and index
├── plan.md                               # High-level plan with phase tracking
├── DECISIONS.md                          # ⭐ Resolved questions from legacy analysis
├── phase-01-foundation.md                # API client, types, constants
├── phase-02-core-hooks.md                # React Query hooks
├── phase-03-routing.md                   # TanStack Router file-based routes
├── phase-04-list-select.md               # List and template selection views
├── phase-05-form-builder.md              # Form builder detail view
├── phase-06-field-management.md          # Field CRUD and drag-drop
└── phase-07-preview-polish.md            # i18n, testing, accessibility
```

## ⭐ Important: Resolved Decisions

**See [DECISIONS.md](DECISIONS.md)** for analysis of 5 key questions resolved from legacy code:

1. **Form ID generation**: Server-side (API returns ID)
2. **E2EE encryption**: Not required (config is non-sensitive metadata)
3. **Form versioning**: Phase 8+ future enhancement
4. **Public embedding**: Phase 8+ future enhancement
5. **Validation approach**: Manual + TypeScript (no Zod)

## Quick Reference

### Key Files to Create

```
apps/web/src/features/workflow-forms/
├── types.ts                              # TypeScript interfaces
├── constants.ts                          # Form types, templates
├── api/
│   └── workflow-forms-api.ts             # API client
├── hooks/
│   ├── index.ts
│   ├── use-workflow-forms.ts             # List query
│   ├── use-workflow-form.ts              # Detail query
│   ├── use-create-workflow-form.ts       # Create mutation
│   ├── use-update-workflow-form.ts       # Update mutation
│   └── use-delete-workflow-form.ts       # Delete mutation
├── stores/
│   └── form-builder-store.ts             # Zustand store
├── pages/
│   ├── workflow-forms-list.tsx
│   ├── workflow-forms-select.tsx
│   └── workflow-form-detail.tsx
├── components/
│   ├── form-list-item.tsx
│   ├── form-template-card.tsx
│   ├── create-form-dialog.tsx
│   ├── form-builder-layout.tsx
│   ├── config-panel.tsx
│   ├── preview-panel.tsx
│   ├── form-preview.tsx
│   ├── field-list.tsx
│   ├── field-list-item.tsx
│   ├── field-config-dialog.tsx
│   ├── field-options-editor.tsx
│   ├── form-settings-dialog.tsx
│   ├── form-list-skeleton.tsx
│   └── empty-state.tsx
└── utils/
    └── navigation.ts

apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-forms/
├── index.tsx                             # List view route
├── select.tsx                            # Template selection route
└── $formId.tsx                           # Detail view route

messages/
├── vi/workflow-forms.json                # Vietnamese translations
└── en/workflow-forms.json                # English translations
```

### Implementation Checklist

**Phase 1: Foundation** (1 day)

- [ ] Create feature directory structure
- [ ] Define TypeScript types
- [ ] Create constants (form types, templates)
- [ ] Implement API client
- [ ] Add routes to route-paths.ts
- [ ] Write unit tests for API client

**Phase 2: Core Hooks** (1 day)

- [ ] Create query hooks (list, detail)
- [ ] Create mutation hooks (create, update, delete)
- [ ] Implement cache invalidation
- [ ] Write unit tests for hooks

**Phase 3: Routing** (0.5 day)

- [ ] Create route files
- [ ] Add auth guards
- [ ] Create placeholder pages
- [ ] Verify route generation

**Phase 4: List & Select** (1 day)

- [ ] Implement List view page
- [ ] Implement Template selection page
- [ ] Create form list item component
- [ ] Create template card component
- [ ] Create form dialog component
- [ ] Add search/filter functionality

**Phase 5: Form Builder** (1.5 days)

- [ ] Create Zustand store
- [ ] Implement detail page
- [ ] Create builder layout
- [ ] Create config panel
- [ ] Create preview panel
- [ ] Implement save/delete actions

**Phase 6: Field Management** (1 day)

- [ ] Install @dnd-kit
- [ ] Implement field list with drag-drop
- [ ] Create field config dialog
- [ ] Create options editor
- [ ] Add field validation
- [ ] Test CRUD operations

**Phase 7: Polish** (1 day)

- [ ] Add i18n translations (vi, en)
- [ ] Enhance preview rendering
- [ ] Add error boundaries
- [ ] Implement toast notifications
- [ ] Add ARIA labels
- [ ] Write integration tests
- [ ] Test keyboard navigation
- [ ] Verify accessibility

## Dependencies

### NPM Packages to Install

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Existing Dependencies (Already in project)

- `@tanstack/react-query` - Server state
- `@tanstack/react-router` - Routing
- `zustand` - Global state
- `@workspace/ui` - shadcn/ui components
- `paraglide.js` - i18n

## API Endpoints

Base: `/api/workspace/{workspaceId}/workflow/{verb}/workflow_forms`

- **List**: `POST /api/workspace/{workspaceId}/workflow/get/workflow_forms`
- **Detail**: `POST /api/workspace/{workspaceId}/workflow/get/workflow_forms/{formId}`
- **Create**: `POST /api/workspace/{workspaceId}/workflow/post/workflow_forms`
- **Update**: `POST /api/workspace/{workspaceId}/workflow/patch/workflow_forms/{formId}`
- **Delete**: `POST /api/workspace/{workspaceId}/workflow/delete/workflow_forms/{formId}`

## Routes

- List: `/$locale/workspaces/$workspaceId/workflow-forms`
- Select: `/$locale/workspaces/$workspaceId/workflow-forms/select`
- Detail: `/$locale/workspaces/$workspaceId/workflow-forms/$formId`

## Form Templates

1. **BASIC** - Text + Email fields
2. **SUBSCRIPTION** - Text + Email + Select (source)
3. **SURVEY** - Text + Email + Select (rating) + Textarea (feedback) + Date + Datetime

## Field Types

- `text` - Single-line text input
- `email` - Email input with validation
- `number` - Numeric input
- `textarea` - Multi-line text (max 1500 chars)
- `select` - Dropdown with options
- `checkbox` - Boolean checkbox
- `date` - Date picker
- `datetime-local` - Date + time picker

## Success Metrics

- ✅ Feature parity with legacy implementation
- ✅ Type-safe API calls (zero `any` types)
- ✅ Real-time preview updates
- ✅ Drag-drop field reordering
- ✅ All 3 templates functional
- ✅ CRUD operations working
- ✅ i18n complete (vi/en)
- ✅ No console errors
- ✅ Design system compliance
- ✅ Unit test coverage >80%
- ✅ Accessibility (WCAG 2.1 AA)

## Migration Strategy

1. **Build alongside legacy** - No breaking changes to backend
2. **Type-first development** - Define types before implementation
3. **Component-driven** - Reusable components before page assembly
4. **Progressive testing** - Test each phase before moving forward
5. **Feature flag** - Deploy behind feature flag for gradual rollout

## Known Risks & Mitigations

| Risk                     | Impact | Mitigation                                                         |
| ------------------------ | ------ | ------------------------------------------------------------------ |
| API contract mismatch    | High   | Validate with backend team, test against staging                   |
| Drag-drop library issues | Medium | Use @dnd-kit, fallback to react-beautiful-dnd                      |
| State sync complexity    | Medium | Clear boundaries: Query (server), useState (UI), Zustand (builder) |
| i18n coverage gaps       | Low    | Extract all strings early, use Paraglide workflow                  |
| Preview rendering bugs   | Medium | Isolated component, error boundaries                               |

## Unresolved Questions

1. **Form ID Generation**: Client-side (UUIDv7) or server-side (snowflake)?
   - _Recommendation_: Server-side for consistency with Active Tables

2. **E2EE Requirement**: Workflow forms encrypted like Active Tables?
   - _Recommendation_: No - forms are workspace-scoped, not user-sensitive

3. **Form Versioning**: History/versions needed?
   - _Recommendation_: Not in v1, add later if requested

4. **Public Embedding**: Immediate need for public form URLs?
   - _Recommendation_: Future phase, focus on authenticated use first

5. **Validation Schema**: Use Zod for field validation?
   - _Recommendation_: Yes - Zod for create/update payload validation

## Getting Started

1. Read [plan.md](plan.md) for overview
2. Start with [phase-01-foundation.md](phase-01-foundation.md)
3. Follow phases sequentially
4. Update plan.md status as you progress
5. Document any deviations or discoveries

## Support & References

- [Functional Spec](/Users/macos/Workspace/buildinpublic/beqeek/docs/workflow-forms-functional-spec.md)
- [Legacy Implementation](/Users/macos/Workspace/buildinpublic/beqeek/docs/html-module/workflow-forms.blade.php)
- [Project README](/Users/macos/Workspace/buildinpublic/beqeek/README.md)
- [CLAUDE.md](/Users/macos/Workspace/buildinpublic/beqeek/CLAUDE.md)
- [Design System](/Users/macos/Workspace/buildinpublic/beqeek/docs/design-system.md)
- [Code Standards](/Users/macos/Workspace/buildinpublic/beqeek/docs/code-standards.md)

---

**Ready to implement?** Start with Phase 1: Foundation
