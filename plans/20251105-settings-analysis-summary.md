# Active Table Settings - Analysis Summary

**Date**: 2025-11-05
**Full Plan**: `/plans/20251105-active-table-settings-rebuild-plan.md`

---

## Critical Discoveries

### 1. Single PATCH Endpoint Architecture

**MOST IMPORTANT**: The system uses **ONE PATCH endpoint** for ALL configuration updates:

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
```

This means:

- NO individual endpoints for fields, actions, permissions, etc.
- ALL changes accumulate in client-side state
- ONE batch save when user clicks "Save"
- Existing hook `use-update-table-config.ts` already implements this correctly

### 2. Settings Scope (10 Major Sections)

1. **General Config** - Table ID, encryption, limits, search fields
2. **Fields Config** - 26+ field types, CRUD, validation, E2EE
3. **Actions Config** - 8 default actions + custom actions
4. **List View Config** - 2 layouts (generic-table, head-column)
5. **Quick Filters** - Filters for SELECT, CHECKBOX, REFERENCE fields
6. **Detail Config** - 2 layouts (head-detail, two-column-detail)
7. **Kanban Config** - Multiple screens, status field validation
8. **Gantt Config** - (Documentation incomplete, needs review)
9. **Permissions Config** - Team/role matrix with complex rules
10. **Danger Zone** - Table deletion with confirmation

### 3. Field Types Supported (26+ Types)

**Text**: SHORT_TEXT, TEXT, RICH_TEXT, EMAIL, URL
**Date/Time**: YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, DATE, DATETIME, TIME
**Numeric**: INTEGER, NUMERIC
**Selection**: CHECKBOX_YES_NO, CHECKBOX_ONE, CHECKBOX_LIST, SELECT_ONE, SELECT_LIST
**Reference**: SELECT_ONE_RECORD, SELECT_LIST_RECORD, FIRST_REFERENCE_RECORD
**User**: SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER

### 4. E2EE Implementation

**Critical Security Pattern**:

- 32-char encryption key stored in localStorage (NEVER sent to server)
- `encryptionAuthKey` (triple SHA256 hash) stored on server for verification
- Encryption types:
  - AES-256-CBC for text fields
  - OPE (Order-Preserving Encryption) for numbers/dates
  - HMAC-SHA256 for selects

**Existing hook already handles this correctly**:

```typescript
config: {
  ...config,
  encryptionKey: config.e2eeEncryption ? '' : config.encryptionKey || '',
  encryptionAuthKey: config.encryptionAuthKey || '',
}
```

### 5. Default Actions Pattern

The system auto-generates 8 default actions:

1. `create` - Create records
2. `access` - View records
3. `update` - Edit records
4. `delete` - Delete records
5. `comment_create` - Add comments
6. `comment_access` - View comments
7. `comment_update` - Edit comments
8. `comment_delete` - Delete comments

**Implementation Note**: Custom actions (type: 'custom') are user-created and editable. Default actions (type: 'default') are system-managed and read-only in UI.

### 6. Permissions Complexity

**Matrix Structure**: Team × Role × Actions

**Permission Types by Action**:

- **Create**: `not_allowed`, `allowed`
- **Access/Update/Delete**: 20+ options including time-based (2h, 12h, 24h, 48h, 72h), self-created, team-based
- **Comments**: Separate permissions for create/access/update/delete

**API Calls Required**:

```
POST /api/workspace/{wId}/workspace/get/p/teams
POST /api/workspace/{wId}/workspace/get/p/team_roles
```

### 7. Validation Requirements

**Critical Validations**:

- Field names must be unique (no duplicates)
- At least one hashed keyword field required
- Table limit: 1-100,000 records
- Kanban status field: only `SELECT_ONE` or `SELECT_ONE_WORKSPACE_USER`
- FIRST_REFERENCE_RECORD must specify `referenceField`
- Field deletion: check dependencies (kanban, gantt, filters, etc.)

**Existing hook has comprehensive validation**:

- ✅ Field name uniqueness
- ✅ Kanban status field validation
- ✅ Gantt field dependencies
- ✅ Quick filter field existence

---

## State Management Strategy

**React Query (Server State)**:

- Table data fetching
- Single mutation for updates
- Cache invalidation
- Optimistic updates with rollback

**Local State (useState - Per Section)**:

- Form inputs during editing
- Modal open/close
- Field being edited (index)
- Temporary configurations

**NO Global State Needed**:

- Settings are route-specific
- React Query cache provides cross-component access

---

## Component Architecture

```
ActiveTableSettingsPage
│
├── SettingsHeader (Save/Cancel, Unsaved indicator)
│
├── SettingsTabs
│   ├── GeneralTab
│   ├── FieldsTab (Most complex)
│   ├── ActionsTab
│   ├── ViewsTab (List + Detail + Kanban + Gantt)
│   ├── FiltersTab
│   ├── PermissionsTab (Second most complex)
│   └── DangerZoneTab
│
└── UnsavedChangesPrompt
```

---

## Implementation Complexity Ranking

| Section       | Complexity    | Reason                                            |
| ------------- | ------------- | ------------------------------------------------- |
| Fields        | **Very High** | 26+ types, options editor, reference config, E2EE |
| Permissions   | **Very High** | Matrix structure, async data, complex rules       |
| Kanban        | **Medium**    | Multiple screens, validation, UUID generation     |
| Actions       | **Medium**    | Default actions init, custom CRUD                 |
| List View     | **Medium**    | 2 layouts, dynamic forms                          |
| Detail View   | **Medium**    | 2 layouts, comments position                      |
| General       | **Medium**    | E2EE key handling, validation                     |
| Quick Filters | **Low**       | Simple CRUD, field filtering                      |
| Danger Zone   | **Low**       | Confirmation modal, API call                      |

---

## Key Technical Decisions

### 1. Form Library

**Decision**: Controlled components with useState (NO react-hook-form)

**Rationale**:

- BA code uses simple controlled components
- Less abstraction, more control
- Simpler for complex nested forms (fields options, permissions matrix)

### 2. Multi-Select Component

**Decision**: react-select

**Rationale**:

- Already referenced in BA code
- Well-maintained, feature-rich
- Can be styled to match design system

### 3. Validation Approach

**Decision**: Manual validation utilities + existing hook validation

**Rationale**:

- Existing `validateTableConfig` in hook is comprehensive
- Client-side validation for UX, server-side for security
- Custom validation logic needed for domain rules

### 4. UUID Generation

**Decision**: Implement UUID v7 utility

**Rationale**:

- BA code uses UUID v7 for time-ordered IDs
- Needed for actions, filters, kanban screens
- Simple implementation (timestamp + random)

### 5. Permissions Data Fetching

**Decision**: Separate React Query hooks for teams/roles

**Rationale**:

- Different API endpoints
- Teams fetched first, then roles per team
- Can be cached independently

---

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Lazy load sections (already done for page)
2. **Virtualization**: Use `@tanstack/react-virtual` for:
   - Long fields list (100+ fields possible)
   - Permissions matrix (many team-role combinations)
3. **Memoization**:
   - Filtered fields for kanban/filters
   - Permission options per action type
4. **Debouncing**: Text input validation (field name, labels)
5. **Optimistic Updates**: Already in `useUpdateTableConfig`

### Expected Performance

- Page load: < 2 seconds (with 100 fields)
- Settings save: < 1 second
- Permissions matrix render: < 500ms (with virtualization)

---

## Accessibility Requirements

**WCAG 2.1 AA Compliance**:

- ✅ Keyboard navigation (all interactive elements)
- ✅ Screen reader support (ARIA labels, roles)
- ✅ Focus management (trap in modals, restore on close)
- ✅ Color contrast (design system already compliant)
- ✅ Error announcements (ARIA live regions)
- ✅ Form field associations (label for/id)

**Vietnamese Typography**:

- Design system already optimized
- Font rendering for diacritics

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

**Coverage Targets**:

- Component rendering: 100%
- User interactions: 90%
- Validation logic: 100%
- Utilities: 100%

**Key Test Scenarios**:

- Field CRUD operations
- Field name uniqueness validation
- Kanban status field validation
- Permissions matrix population
- E2EE key handling
- Unsaved changes detection

### Integration Tests

**Scenarios**:

- Complete settings flow (fetch → edit → save)
- Cross-section dependencies (delete field used in kanban)
- Permissions API integration
- Error handling and rollback

### E2E Tests (Playwright)

**User Flows**:

- Add field → Save → Verify in records page
- Configure kanban → Navigate to kanban → Verify layout
- Set permissions → Login as different role → Verify access
- Delete table → Verify navigation

---

## Risks and Mitigation

| Risk                                      | Impact | Probability | Mitigation                             |
| ----------------------------------------- | ------ | ----------- | -------------------------------------- |
| Permissions complexity overwhelming users | High   | Medium      | Progressive disclosure, tooltips, docs |
| Large field lists performance issues      | High   | Medium      | Virtualization, lazy rendering         |
| E2EE confusion leading to data loss       | High   | Low         | Clear warnings, backup reminders       |
| Cross-section dependencies hard to track  | Medium | High        | Comprehensive validation               |

---

## Timeline Estimate

| Phase                             | Duration | Sections                           |
| --------------------------------- | -------- | ---------------------------------- |
| **Phase 1**: Foundation           | 1 week   | Page layout, tabs, header, routing |
| **Phase 2**: General & Fields     | 1 week   | Most complex section               |
| **Phase 3**: Actions & Views      | 1 week   | Actions, list view, detail view    |
| **Phase 4**: Filters & Kanban     | 1 week   | Quick filters, kanban              |
| **Phase 5**: Permissions & Danger | 1 week   | Second most complex                |
| **Phase 6**: Testing & Polish     | 1 week   | Tests, accessibility, optimization |

**Total**: 6 weeks (1.5 months)

---

## Success Metrics

**Functional**:

- [ ] All 10 sections implemented per BA spec
- [ ] 26+ field types supported
- [ ] E2EE working correctly
- [ ] Permissions matrix functional
- [ ] Unsaved changes detection working

**Non-Functional**:

- [ ] Page load < 2s
- [ ] Settings save < 1s
- [ ] 80%+ test coverage
- [ ] WCAG 2.1 AA compliant
- [ ] Mobile responsive

**User Experience**:

- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] No layout shifts
- [ ] Smooth transitions

---

## Next Actions

1. **Review this summary and full plan** with team
2. **Confirm BA documentation is complete** (Gantt section seems incomplete)
3. **Create feature branch**: `feature/active-tables-settings-rebuild`
4. **Set up project board** for tracking
5. **Begin Phase 1** implementation

---

## Key Files to Reference

**BA Documentation**: `/docs/BA/active-tables/settings/docs/`
**Existing Hook**: `/apps/web/src/features/active-tables/hooks/use-update-table-config.ts`
**Route File**: `/apps/web/src/routes/$locale/workspaces/$workspaceId/tables/$tableId/settings.tsx`
**Full Plan**: `/plans/20251105-active-table-settings-rebuild-plan.md`
**Design System**: `/docs/design-system.md`
**Project Conventions**: `/CLAUDE.md`

---

**Questions for Product Owner**:

1. Is Gantt configuration documentation complete? (Missing from BA docs read)
2. Should we implement all 10 sections in first release or prioritize?
3. Are there any existing user workflows we need to support for backward compatibility?
4. What's the priority order if we need to phase delivery?

**Recommended Priority Order** (if phased):

1. General + Fields (core functionality)
2. Actions + Permissions (access control)
3. List View + Detail View (display)
4. Kanban + Filters (nice-to-have)
5. Danger Zone (always last)
