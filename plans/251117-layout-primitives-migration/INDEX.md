# Layout Primitives Migration - Document Index

Quick navigation for all migration planning documents.

---

## 🚀 Getting Started (Read in Order)

1. **[README.md](./README.md)** - Complete guide with architecture, patterns, scope
2. **[QUICKSTART.md](./QUICKSTART.md)** - Step-by-step guide for Phase 1
3. **[plan.md](./plan.md)** - Overview, timeline, phases, risk mitigation

---

## 📚 Background & Research

- **[RESEARCH.md](./RESEARCH.md)** - Migration patterns, edge cases, testing strategy, TypeScript patterns

---

## 📋 Phase Plans (Execute in Order)

### Phase 1: Pilot Migration (START HERE)

**[phase-01-pilot-migration.md](./phase-01-pilot-migration.md)**

- Duration: 3-4 days
- Files: 8-10 Tier 1 Active Tables files
- Purpose: Validate approach, setup testing
- Status: 🔵 Ready to Start

### Phase 2: Active Tables Core

**[phase-02-active-tables-core.md](./phase-02-active-tables-core.md)**

- Duration: 5-6 days
- Files: ~20 core pages (record lists, detail views)
- Depends on: Phase 1 completion
- Status: ⚪ Pending Phase 1

### Phase 3: Active Tables Settings

**[phase-03-active-tables-settings.md](./phase-03-active-tables-settings.md)**

- Duration: 5-6 days
- Files: ~25 settings components (fields, permissions, views)
- Depends on: Phase 2 completion
- Status: ⚪ Pending Phase 2

### Phase 4: Workflow Features

**[phase-04-workflow-features.md](./phase-04-workflow-features.md)**

- Duration: 4-5 days
- Files: ~30 workflow files (forms, connectors)
- Depends on: Phase 3 completion
- Status: ⚪ Pending Phase 3

### Phase 5: Remaining Features

**[phase-05-remaining-features.md](./phase-05-remaining-features.md)**

- Duration: 4-5 days
- Files: ~25 files (team, workspace, auth, support, search, notifications)
- Depends on: Phase 4 completion
- Status: ⚪ Pending Phase 4

### Phase 6: Validation & Cleanup

**[phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md)**

- Duration: 3-4 days
- Purpose: Testing, performance audit, deployment
- Depends on: Phase 5 completion
- Status: ⚪ Pending Phase 5

---

## 📊 Reports (Created During Execution)

Reports are created in the `reports/` directory after each phase:

### Phase Reports

- `reports/phase-01-migration-report.md` - Pilot results
- `reports/phase-02-migration-report.md` - Core pages results
- `reports/phase-03-migration-report.md` - Settings results
- `reports/phase-04-migration-report.md` - Workflows results
- `reports/phase-05-migration-report.md` - Remaining features results

### Testing Reports

- `reports/lighthouse-baseline/` - Pre-migration performance
- `reports/lighthouse-current/` - Post-migration performance
- `reports/performance-comparison.md` - Before/after metrics
- `reports/bundle-size-analysis.md` - Bundle size changes
- `reports/percy-results/` - Visual regression results

### Final Documentation

- `reports/FINAL-REPORT.md` - Comprehensive migration summary
- `reports/pattern-library.md` - Documented patterns
- `reports/exceptions.md` - Files excluded from migration

---

## 🎯 Quick Reference

### Pattern Cheatsheet

| Before                   | After                                | Notes              |
| ------------------------ | ------------------------------------ | ------------------ |
| `space-y-6`              | `<Stack space="space-300">`          | Vertical spacing   |
| `flex gap-4`             | `<Inline space="space-100">`         | Horizontal spacing |
| `p-6`                    | `<Box padding="space-300">`          | Container padding  |
| `grid grid-cols-3 gap-6` | `<Grid columns={3} gap="space-300">` | Grid layout        |
| `mt-4`                   | Move to parent Stack/Inline          | Eliminate margins  |

### Space Scale

```
space-025 = 2px   (gap-1)
space-050 = 4px   (gap-2)
space-075 = 6px   (gap-3)
space-100 = 8px   (gap-4) ← DEFAULT
space-150 = 12px  (gap-6)
space-200 = 16px  (gap-8)
space-300 = 24px  (gap-12)
space-400 = 32px  (gap-16)
space-500 = 40px  (gap-20)
space-600 = 48px  (gap-24)
space-800 = 64px  (gap-32)
space-1000 = 80px (gap-40)
```

---

## 📂 Document Map by Topic

### Planning & Strategy

- [README.md](./README.md) - Overall guide
- [plan.md](./plan.md) - Project plan
- [RESEARCH.md](./RESEARCH.md) - Research & patterns
- [INDEX.md](./INDEX.md) - This file

### Execution Guides

- [QUICKSTART.md](./QUICKSTART.md) - Quick start
- [phase-01-pilot-migration.md](./phase-01-pilot-migration.md) - Phase 1 execution
- [phase-02-active-tables-core.md](./phase-02-active-tables-core.md) - Phase 2 execution
- [phase-03-active-tables-settings.md](./phase-03-active-tables-settings.md) - Phase 3 execution
- [phase-04-workflow-features.md](./phase-04-workflow-features.md) - Phase 4 execution
- [phase-05-remaining-features.md](./phase-05-remaining-features.md) - Phase 5 execution
- [phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md) - Phase 6 execution

### Testing & Validation

- [RESEARCH.md](./RESEARCH.md) - Testing strategy (Percy, Storybook, unit tests)
- [phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md) - Comprehensive testing, deployment

---

## 🔍 Find Information By...

### By Role

**Developer starting migration:**

1. [QUICKSTART.md](./QUICKSTART.md)
2. [phase-01-pilot-migration.md](./phase-01-pilot-migration.md)

**Reviewer/QA:**

1. [plan.md](./plan.md) - Success criteria
2. [phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md) - Testing checklist

**Project Manager:**

1. [plan.md](./plan.md) - Timeline, risk assessment
2. [README.md](./README.md) - Scope, progress tracking

### By Topic

**Migration Patterns:**

- [RESEARCH.md](./RESEARCH.md) - Section 1: Migration Patterns
- [QUICKSTART.md](./QUICKSTART.md) - Pattern Cheatsheet

**Edge Cases:**

- [RESEARCH.md](./RESEARCH.md) - Section 2: Edge Cases
- Phase plans - "Migration Patterns" sections

**Testing:**

- [RESEARCH.md](./RESEARCH.md) - Section 5: Testing Strategy
- [phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md) - Comprehensive testing

**Performance:**

- [RESEARCH.md](./RESEARCH.md) - Section 3: Performance Implications
- [phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md) - Step 2-3: Performance auditing

**TypeScript:**

- [RESEARCH.md](./RESEARCH.md) - Section 4: TypeScript Type Safety

### By Phase

Each phase plan contains:

- Context & overview
- Target file list
- Migration patterns specific to that phase
- Implementation steps (day-by-day)
- Todo checklist
- Success criteria
- Risk assessment

---

## 📈 Progress Tracking

**Phase Status:**

- 🔵 Ready to Start
- 🟡 In Progress
- 🟢 Completed
- 🔴 Blocked

**Current Status:**

- Phase 1: 🔵 Ready to Start
- Phase 2: ⚪ Pending Phase 1
- Phase 3: ⚪ Pending Phase 2
- Phase 4: ⚪ Pending Phase 3
- Phase 5: ⚪ Pending Phase 4
- Phase 6: ⚪ Pending Phase 5

**Files Migrated:** 0 / ~113 (0%)

---

## 🆘 Common Questions

**Q: Where do I start?**
A: Read [README.md](./README.md), then [QUICKSTART.md](./QUICKSTART.md), then begin [Phase 1](./phase-01-pilot-migration.md).

**Q: How do I test changes?**
A: [RESEARCH.md](./RESEARCH.md) Section 5, [phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md) Step 7.

**Q: What if I encounter an edge case?**
A: Check [RESEARCH.md](./RESEARCH.md) Section 2, document in phase report.

**Q: How do I know which pattern to use?**
A: [QUICKSTART.md](./QUICKSTART.md) Pattern Cheatsheet, [RESEARCH.md](./RESEARCH.md) Section 1.

**Q: What if visual regression occurs?**
A: Investigate cause, fix, re-snapshot Percy. See [phase-06-validation-cleanup.md](./phase-06-validation-cleanup.md) Step 1.

**Q: Can I skip phases?**
A: No - each phase validates patterns for next phase. Follow order.

---

## 📞 Getting Help

**Reference Implementations:**

- `packages/ui/src/components/primitives/` - Primitive components
- `apps/web/src/features/workspace/components/workspace-card-compact.tsx` - Already migrated
- `apps/web/src/features/workflow-connectors/components/connector-card-compact.tsx` - Already migrated

**Documentation:**

- [README.md](./README.md) - Complete guide
- [RESEARCH.md](./RESEARCH.md) - Detailed patterns
- Phase plans - Specific implementation steps

**Commands:**

```bash
# Find hardcoded spacing
rg -l "gap-|space-|p[xy]?-|m[xy]?-" apps/web/src/features

# Check TypeScript
pnpm --filter web check-types

# Run dev server
pnpm dev

# Run Percy
npx percy storybook ./storybook-static
```

---

**Last Updated:** 2025-11-17
**Plan Location:** `/Users/macos/Workspace/buildinpublic/beqeek/plans/251117-layout-primitives-migration/`
