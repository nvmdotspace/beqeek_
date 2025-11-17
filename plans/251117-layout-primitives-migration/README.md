# Layout Primitives Migration Plan

**Comprehensive plan to migrate 113+ files from hardcoded Tailwind spacing to Layout Primitives**

---

## 📋 Quick Reference

| Document                                        | Purpose                                                   |
| ----------------------------------------------- | --------------------------------------------------------- |
| [plan.md](./plan.md)                            | **Start here** - Overview, timeline, risk mitigation      |
| [RESEARCH.md](./RESEARCH.md)                    | Research findings, patterns, edge cases, testing strategy |
| [Phase 1](./phase-01-pilot-migration.md)        | Pilot migration (8-10 files, validates approach)          |
| [Phase 2](./phase-02-active-tables-core.md)     | Active Tables core pages (~20 files)                      |
| [Phase 3](./phase-03-active-tables-settings.md) | Active Tables settings (~25 files)                        |
| [Phase 4](./phase-04-workflow-features.md)      | Workflow features (~30 files)                             |
| [Phase 5](./phase-05-remaining-features.md)     | Remaining features (~25 files)                            |
| [Phase 6](./phase-06-validation-cleanup.md)     | Validation, testing, cleanup, deployment                  |

---

## 🎯 Migration Goals

1. **Consistency**: Standardize spacing across 113+ files using semantic primitives
2. **Maintainability**: Reduce hardcoded values, use design tokens
3. **Pixel-perfect**: Zero visual regressions (Percy baseline)
4. **Performance**: No degradation (Lighthouse ±2 points, bundle +5KB max)
5. **Type safety**: Full TypeScript compliance

---

## 🏗️ Architecture

### Available Primitives

Located in `packages/ui/src/components/primitives/`:

- **Box** - Generic container with padding, background, border
- **Stack** - Vertical layout with managed spacing (replaces `space-y-*`)
- **Inline** - Horizontal layout with managed spacing (replaces `flex gap-*`)
- **Grid** - 12-column responsive grid (replaces `grid grid-cols-*`)

### Space Scale Mapping

| Tailwind | Primitive           | Pixels | Usage               |
| -------- | ------------------- | ------ | ------------------- |
| `gap-1`  | `space="space-025"` | 2px    | Tight spacing       |
| `gap-2`  | `space="space-050"` | 4px    | Very close items    |
| `gap-3`  | `space="space-075"` | 6px    | Close items         |
| `gap-4`  | `space="space-100"` | 8px    | **Default** spacing |
| `gap-6`  | `space="space-150"` | 12px   | Comfortable spacing |
| `gap-8`  | `space="space-200"` | 16px   | Generous spacing    |
| `gap-12` | `space="space-300"` | 24px   | Section spacing     |
| `gap-16` | `space="space-400"` | 32px   | Large gaps          |

---

## 📊 Migration Scope

### By Feature

- **Active Tables**: ~45 files (Tier 1-2 priority)
- **Workflow Forms**: ~18 files (Tier 2)
- **Workflow Connectors**: ~15 files (Tier 3, some already migrated)
- **Team**: ~10 files (Tier 3)
- **Workspace**: ~6 files (Tier 4, partially migrated)
- **Auth/Other**: ~10 files (Tier 4)

### By Pattern Type

- `gap-*`: ~350 occurrences → `Stack/Inline space="space-*"`
- `space-y-*`: ~280 occurrences → `Stack space="space-*"`
- `p*-*`: ~450 occurrences → `Box padding="space-*"`
- `m*-*`: ~115 occurrences → Convert to gap/padding (eliminate margins)

---

## 🚀 Getting Started

### 1. Read the Main Plan

Start with [plan.md](./plan.md) for overview and timeline.

### 2. Review Research Findings

Read [RESEARCH.md](./RESEARCH.md) for:

- Migration patterns and examples
- Edge cases to avoid
- Testing strategy (Percy, Storybook)
- TypeScript type safety patterns

### 3. Begin Phase 1 (Pilot)

Follow [phase-01-pilot-migration.md](./phase-01-pilot-migration.md):

- Setup Percy + Storybook
- Migrate 8-10 Tier 1 files
- Document learnings

### 4. Progress Through Phases

Each phase builds on previous learnings:

- Phase 2: Core pages
- Phase 3: Settings
- Phase 4: Workflows
- Phase 5: Remaining features
- Phase 6: Validation & deployment

---

## 📐 Core Migration Patterns

### Pattern 1: Vertical Stack

```tsx
// ❌ BEFORE
<div className="space-y-6">
  <Header />
  <Content />
</div>

// ✅ AFTER
<Stack space="space-300">
  <Header />
  <Content />
</Stack>
```

### Pattern 2: Horizontal Inline

```tsx
// ❌ BEFORE
<div className="flex gap-4 items-center">
  <Button />
  <Button />
</div>

// ✅ AFTER
<Inline space="space-100" align="center">
  <Button />
  <Button />
</Inline>
```

### Pattern 3: Box Padding

```tsx
// ❌ BEFORE
<div className="p-6 bg-card rounded-lg">
  <Content />
</div>

// ✅ AFTER
<Box padding="space-300" backgroundColor="card" borderRadius="lg">
  <Content />
</Box>
```

### Pattern 4: Margin Elimination

```tsx
// ❌ BEFORE
<div>
  <Header className="mb-4" />
  <Content />
</div>

// ✅ AFTER
<Stack space="space-100">
  <Header />
  <Content />
</Stack>
```

---

## ⚠️ Edge Cases (When NOT to Use Primitives)

1. **One-off spacing** (`pt-[23px]`) - Keep Tailwind for optical alignment
2. **Animation targets** - CSS transitions need stable class names
3. **Third-party libraries** - Some expect specific class structures
4. **Complex responsive breakpoints** - Fallback to Tailwind if primitives don't support
5. **Tables** - Use CSS variables for th/td padding

See [RESEARCH.md](./RESEARCH.md) for detailed edge case handling.

---

## ✅ Success Criteria

**Must Have (Gates Production)**:

- ✅ Percy visual regression: 0 unapproved diffs
- ✅ Lighthouse performance: ±10% vs baseline
- ✅ Bundle size: ≤5KB increase
- ✅ TypeScript: Zero errors
- ✅ QA sign-off: All critical flows pass

**Should Have**:

- ✅ 100+ files migrated (90%+ coverage)
- ✅ Pattern documentation complete
- ✅ Migration reports from all phases

---

## 📅 Timeline

**Total Duration**: 3-4 weeks

```
Week 1: Phase 1 (Pilot) + Phase 2 (Active Tables Core)
Week 2: Phase 3 (Settings) + Phase 4 (Workflows)
Week 3: Phase 5 (Remaining) + Phase 6 (Validation)
Week 4: Buffer for issues, QA, deployment
```

---

## 🔄 Rollback Plan

**Tags**:

- `phase-0-baseline` - Pre-migration snapshot
- `phase-N-complete` - After each phase

**Procedure**:

```bash
# Revert to baseline
git checkout phase-0-baseline
pnpm build
# Deploy

# Or cherry-pick fixes
git checkout main
git revert <commit-hash>
```

---

## 📚 Resources

### Codebase References

- [Existing Primitives](../../packages/ui/src/components/primitives/)
- [Design Tokens](../../packages/ui/src/styles/globals.css)
- [Active Tables](../../apps/web/src/features/active-tables/)
- [Workflow Forms](../../apps/web/src/features/workflow-forms/)
- [Workflow Connectors](../../apps/web/src/features/workflow-connectors/)

### Already Migrated (Reference)

- `workspace-card-compact.tsx` - Good Stack/Inline usage
- `connector-card-compact.tsx` - Complex nested primitives

### External Docs

- [Atlassian Design System](https://atlassian.design/) - Inspiration for primitives
- [Percy Visual Testing](https://percy.io/docs) - Visual regression testing
- [Lighthouse Performance](https://developer.chrome.com/docs/lighthouse/) - Performance auditing

---

## 🤝 Contributing

### Before Starting a Phase

1. Read phase plan document
2. Review previous phase report (if available)
3. Setup testing infrastructure (Percy, Storybook)
4. Create feature branch: `feat/layout-primitives-phase-N`

### During Migration

1. Migrate files in priority order
2. Test visually + TypeScript after each file
3. Commit frequently with descriptive messages
4. Document blockers/edge cases immediately

### After Completing a Phase

1. Run Percy visual regression suite
2. Run Lighthouse performance audit
3. Create phase migration report
4. Team review + approval
5. Tag release: `phase-N-complete`
6. Merge or create PR

---

## 📝 Reporting

After each phase, create report in `reports/`:

**Template**:

```markdown
# Phase N Migration Report

## Summary

- Files migrated: X/Y
- Patterns applied: List
- Edge cases found: List
- Visual regressions: 0
- Performance impact: ±N%

## Learnings

- [Learning 1]
- [Learning 2]

## Blockers

- [Blocker 1] - Resolution: ...

## Next Steps

- Proceed to Phase N+1
- Update Phase N+1 plan based on learnings
```

---

## 🎓 Best Practices

1. **Eliminate margins first** - Convert all `m*-*` to container `padding`/`gap`
2. **Co-locate spacing** - Keep spacing decisions at container level
3. **Use semantic props** - `space="space-300"` not `className="gap-6"`
4. **Test thoroughly** - Visual parity is critical
5. **Document exceptions** - Not everything needs primitives

---

## 📞 Questions?

- Read [RESEARCH.md](./RESEARCH.md) for detailed patterns
- Check phase plans for specific implementation steps
- Review reports directory for learnings from completed phases

---

**Status**: 🔵 Ready to Start Phase 1

**Last Updated**: 2025-11-17
