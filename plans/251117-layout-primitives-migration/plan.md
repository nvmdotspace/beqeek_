# Layout Primitives Migration Plan

**Project**: Migrate from hardcoded Tailwind spacing to Layout Primitives
**Date**: 2025-11-17
**Status**: 🟡 Planning Complete
**Estimated Duration**: 3-4 weeks
**Risk Level**: Medium (visual regression, breaking changes)

---

## Context

Migrate 113+ files from hardcoded Tailwind spacing (`gap-4`, `space-y-6`, `px-8`) to semantic Layout Primitives (`Stack`, `Inline`, `Box`, `Grid`). Aggressive approach prioritizes full primitives adoption over CSS variable substitution.

**Research artifacts**:

- [RESEARCH.md](./RESEARCH.md) - Migration patterns, edge cases, testing strategy
- Existing primitives: `@workspace/ui/components/primitives` (Box, Stack, Inline, Grid)
- Design tokens: `packages/ui/src/styles/globals.css` (--space-\* variables)

**Success examples**:

- ✅ workspace-card-compact.tsx - Full Stack/Inline adoption
- ✅ connector-card-compact.tsx - Complex nested primitives

---

## Migration Scope

### By Feature (Estimated)

| Feature                 | Files | Priority | Notes                              |
| ----------------------- | ----- | -------- | ---------------------------------- |
| **Active Tables**       | ~45   | Tier 1-2 | Core pages, settings, record forms |
| **Workflow Forms**      | ~18   | Tier 2   | Form builder, config panels        |
| **Workflow Connectors** | ~15   | Tier 3   | Connectors (some already migrated) |
| **Team**                | ~10   | Tier 3   | Member/role management             |
| **Workspace**           | ~6    | Tier 4   | Dashboard (partially migrated)     |
| **Auth/Other**          | ~10   | Tier 4   | Login, search, support             |
| **TOTAL**               | ~104  | -        | Excludes already migrated files    |

### Pattern Occurrences

- `gap-*`: ~350 occurrences → `Stack/Inline space="space-*"`
- `space-y-*`: ~280 occurrences → `Stack space="space-*"`
- `p*-*`: ~450 occurrences → `Box padding="space-*"`
- `m*-*`: ~115 occurrences → Convert to gap/padding

---

## Phases Overview

### [Phase 1: Pilot Migration](./phase-01-pilot-migration.md)

**Status**: 🔵 Ready
**Duration**: 3-4 days
**Files**: 8-10 Tier 1 files
Validate approach with high-impact Active Tables pages. Establish baseline tests.

### [Phase 2: Active Tables Core](./phase-02-active-tables-core.md)

**Status**: ⚪ Pending
**Duration**: 5-6 days
**Files**: ~20 core pages
Migrate main table pages, record lists, detail views.

### [Phase 3: Active Tables Settings](./phase-03-active-tables-settings.md)

**Status**: ⚪ Pending
**Duration**: 5-6 days
**Files**: ~25 settings components
Migrate field config, permissions, kanban/gantt settings.

### [Phase 4: Workflow Features](./phase-04-workflow-features.md)

**Status**: ⚪ Pending
**Duration**: 4-5 days
**Files**: ~30 workflow files
Migrate workflow forms, connectors (excluding already migrated).

### [Phase 5: Remaining Features](./phase-05-remaining-features.md)

**Status**: ⚪ Pending
**Duration**: 4-5 days
**Files**: ~25 files
Team, workspace, auth, support features.

### [Phase 6: Validation & Cleanup](./phase-06-validation-cleanup.md)

**Status**: ⚪ Pending
**Duration**: 3-4 days
Visual regression testing, documentation, remove legacy patterns.

---

## Migration Principles

1. **Eliminate margins**: Convert `m*-*` to container `padding` or flex `gap`
2. **Semantic props**: Use `space="space-300"` not `className="gap-6"`
3. **Co-locate spacing**: Keep spacing at container level, not children
4. **Preserve behavior**: Pixel-perfect visual parity (no layout shifts)
5. **Type safety**: Full TypeScript compliance, no `any` casts

---

## Risk Mitigation

| Risk                    | Mitigation                                          |
| ----------------------- | --------------------------------------------------- |
| Visual regressions      | Percy + Storybook baseline snapshots before Phase 1 |
| TypeScript errors       | Test polymorphic types with forwardRef components   |
| Responsive breakpoints  | Document cases requiring Tailwind fallback          |
| Performance degradation | Lighthouse benchmarks before/after each phase       |
| Rollback complexity     | Feature-flag each phase, maintain git tags          |

---

## Success Criteria

- ✅ Zero visual regressions (Percy baseline match)
- ✅ TypeScript compilation passes
- ✅ No runtime errors (dev + production builds)
- ✅ Lighthouse performance score unchanged (±2 points)
- ✅ Design system documentation updated

---

## Dependencies

**Required before Phase 1**:

- Percy CLI + Storybook integration (`@percy/cli`, `@percy/storybook`)
- Storybook stories for primitives (spacing variants)
- Baseline snapshots for Tier 1 files

**Optional enhancements**:

- Codemod tool for automated pattern replacement
- ESLint rule to prevent new hardcoded spacing

---

## Timeline

```
Week 1: Phase 1 (Pilot) + Phase 2 (Active Tables Core)
Week 2: Phase 3 (Active Tables Settings) + Phase 4 start
Week 3: Phase 4 (Workflows) + Phase 5 (Remaining)
Week 4: Phase 6 (Validation) + Buffer for issues
```

---

## Next Steps

1. Review Phase 1 plan
2. Setup Percy + Storybook integration
3. Generate baseline snapshots for pilot files
4. Begin Phase 1 migration (Tier 1 files)

---

## Notes

- Migration is **incremental** - each phase can ship independently
- **Do not migrate** during active feature development in target files
- Tag releases after each phase for rollback safety
- Update design system docs as patterns emerge
