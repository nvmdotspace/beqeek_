# Phase 6: Validation & Cleanup

**Date**: 2025-11-17
**Priority**: 🔴 Critical
**Status**: ⚪ Pending Phase 5 Completion
**Duration**: 3-4 days
**Assignees**: TBD

---

## Context

Final phase validates migration success, runs comprehensive testing, documents patterns, and cleans up legacy code. Gates production deployment.

**Dependencies**:

- ✅ Phase 1-5 completed (all features migrated)
- ✅ Percy baselines established
- ✅ Migration reports from all phases

**Links**:

- [Main Plan](./plan.md)
- [All Phase Reports](./reports/)

---

## Overview

**Goals**:

1. Comprehensive visual regression testing (Percy)
2. Performance benchmarking (Lighthouse, bundle size)
3. Documentation consolidation
4. Legacy code cleanup
5. Production deployment readiness

**Non-goals**:

- New feature development
- Refactoring beyond spacing/layout
- Changing design tokens

---

## Key Deliverables

1. **Final migration report** - Consolidated statistics, patterns, learnings
2. **Visual regression results** - Percy report with 0 unapproved diffs
3. **Performance audit** - Before/after Lighthouse scores, bundle size analysis
4. **Pattern documentation** - Updated design system docs
5. **ESLint rule** (optional) - Prevent new hardcoded spacing
6. **Deployment checklist** - QA sign-off, rollback plan

---

## Requirements

### Functional

- ✅ All user flows functional (create, read, update, delete)
- ✅ No console errors (dev + production)
- ✅ Responsive behavior preserved (mobile/tablet/desktop)
- ✅ Accessibility unchanged (ARIA, keyboard nav)
- ✅ Dark mode spacing consistent

### Non-Functional

- ✅ Percy: 0 unapproved visual diffs
- ✅ Lighthouse: Performance ±2 points vs baseline
- ✅ Bundle size: +5KB max (primitives overhead)
- ✅ TypeScript: Zero type errors
- ✅ Build time: ±10% vs baseline

---

## Architecture

### Testing Scope

#### **Critical User Flows** (Full End-to-End)

1. **Auth Flow**
   - Login → Dashboard → Logout
   - Invalid credentials → Error state

2. **Workspace Management**
   - Create workspace → Navigate to workspace
   - Workspace dashboard → Stats display

3. **Active Tables**
   - Create table → Configure fields → Save
   - View records (table/kanban/gantt) → Create record
   - Edit record → Update fields → Save
   - Comments → Add comment → Display

4. **Workflows**
   - Create workflow form → Add fields → Save
   - Select connector → Configure → Test connection

5. **Team Management**
   - Invite member → Assign role
   - Edit permissions → Save

#### **Visual Regression Coverage**

- All Percy baselines (from Phase 1-5)
- Dark mode snapshots
- Responsive breakpoints (mobile, tablet, desktop)
- Empty states, loading states, error states

#### **Performance Benchmarks**

**Pages to audit**:

1. `/login` - Login page
2. `/workspaces` - Workspace list
3. `/workspaces/{id}/tables` - Table list
4. `/workspaces/{id}/tables/{id}/records` - Record list (heaviest page)
5. `/workspaces/{id}/workflows` - Workflow list

**Metrics**:

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

---

## Implementation Steps

### Step 1: Comprehensive Percy Testing (Day 1)

**1.1 Generate full Storybook**

```bash
# Build Storybook with all components
pnpm build-storybook

# Generate Percy snapshots
npx percy storybook ./storybook-static
```

**1.2 Review Percy dashboard**

- Check for any unapproved diffs
- Verify responsive snapshots
- Verify dark mode snapshots

**1.3 Fix any regressions**

- If diffs found: Investigate, fix, re-snapshot
- Document intentional changes

**Expected outcome**: 0 unapproved diffs, green Percy build

---

### Step 2: Performance Auditing (Day 1 PM - Day 2 AM)

**2.1 Baseline measurements (pre-migration)**

```bash
# Checkout baseline tag
git checkout phase-0-baseline

# Build production
pnpm build

# Preview
pnpm --filter web preview

# Run Lighthouse on 5 key pages
# Save reports to: plans/251117-layout-primitives-migration/reports/lighthouse-baseline/
```

**2.2 Current measurements (post-migration)**

```bash
# Checkout current
git checkout main # or phase-5-complete

# Build production
pnpm build

# Preview
pnpm --filter web preview

# Run Lighthouse on same 5 pages
# Save reports to: plans/251117-layout-primitives-migration/reports/lighthouse-current/
```

**2.3 Compare results**

```markdown
# Create: performance-comparison.md

| Page    | Metric | Baseline | Current | Δ     | Status    |
| ------- | ------ | -------- | ------- | ----- | --------- |
| Login   | LCP    | 1.2s     | 1.3s    | +0.1s | ✅ OK     |
| Tables  | LCP    | 2.1s     | 2.0s    | -0.1s | ✅ Better |
| Records | TTI    | 3.5s     | 3.6s    | +0.1s | ✅ OK     |
```

**Acceptance criteria**: All deltas within ±10% or ±200ms

---

### Step 3: Bundle Size Analysis (Day 2 AM)

**3.1 Build with visualizer**

```bash
# If not already configured, add to vite.config.ts:
# import { visualizer } from 'rollup-plugin-visualizer';
# plugins: [
#   visualizer({ filename: './dist/stats.html', open: true })
# ]

pnpm build
```

**3.2 Analyze chunks**

- Verify primitives in correct chunk (ui/components)
- Check vendor chunk size unchanged
- Ensure no duplication

**3.3 Document bundle changes**

```markdown
# bundle-size-analysis.md

| Chunk  | Baseline | Current | Δ    | Notes                  |
| ------ | -------- | ------- | ---- | ---------------------- |
| vendor | 245KB    | 245KB   | 0KB  | No change              |
| ui     | 38KB     | 42KB    | +4KB | Primitives added       |
| app    | 152KB    | 150KB   | -2KB | Removed inline spacing |
| TOTAL  | 435KB    | 437KB   | +2KB | ✅ Within target       |
```

**Acceptance criteria**: Total delta < 5KB gzipped

---

### Step 4: Documentation Consolidation (Day 2 PM)

**4.1 Create final migration report**

```markdown
# plans/251117-layout-primitives-migration/FINAL-REPORT.md

## Summary

- **Files migrated**: X/113 (Y% coverage)
- **Pattern occurrences replaced**: ~1,195
- **Duration**: Z weeks (planned: 3-4 weeks)
- **Visual regressions**: 0
- **Performance impact**: ±N%
- **Bundle size impact**: +XKB

## Migration Statistics

### By Phase

- Phase 1: 10 files (pilot)
- Phase 2: 20 files (Active Tables core)
- Phase 3: 25 files (Active Tables settings)
- Phase 4: 30 files (Workflows)
- Phase 5: 25 files (Remaining features)
- **Total**: 110 files

### By Pattern Type

- gap-\* → Stack/Inline: ~350 occurrences
- space-y-\* → Stack: ~280 occurrences
- p*-* → Box padding: ~450 occurrences
- m*-* → gap/padding: ~115 occurrences

### Exceptions Documented

1. Complex grid layouts (X files) - Used CSS vars
2. Responsive breakpoints (Y files) - Tailwind fallback
3. Animation targets (Z files) - Kept direct classes

## Learnings

- [Pattern 1]: Stack for vertical spacing eliminates margin leakage
- [Pattern 2]: Inline wrapping better than flexbox + gap
- [Pattern 3]: Box padding variants reduce custom classes
- [Edge case 1]: Table structures need CSS vars, not primitives
- [Edge case 2]: Drag-drop requires stable DOM structure

## Recommendations

1. Use primitives for all new components
2. Document exceptions in component comments
3. Consider ESLint rule: no-hardcoded-spacing
4. Update onboarding docs with primitive examples
```

**4.2 Update design system documentation**

```bash
# Update: docs/design-system.md

# Add section: "Layout Primitives Usage"
- When to use Box vs Stack vs Inline
- Space scale mapping (space-100 = 8px)
- Exception patterns (tables, animations, responsive)
- Code examples from migration
```

**4.3 Create pattern library**

```bash
# Create: packages/ui/src/components/primitives/README.md

# Document all primitive props
# Include usage examples from migration
# Link to Storybook stories
```

---

### Step 5: Legacy Code Cleanup (Day 3)

**5.1 Search for remaining hardcoded spacing**

```bash
# Find any missed files
rg "gap-\d+|space-[xy]-\d+|p[xy]?-\d+|m[xy]?-\d+" apps/web/src/features \
  --type tsx \
  --files-with-matches \
  > migration-todo.txt

# Review list, categorize:
# - Exceptions (document why)
# - Missed files (migrate or schedule)
# - False positives (ignore)
```

**5.2 Remove commented-out old code**

```bash
# Search for backup comments
rg "// ❌ BEFORE|// BEFORE:|/\* OLD:" apps/web/src
```

**5.3 Remove .backup files (if any)**

```bash
find apps/web/src -name "*.backup" -delete
```

---

### Step 6: ESLint Rule (Optional) (Day 3 PM)

**6.1 Create custom ESLint rule**

```typescript
// packages/eslint-config/rules/no-hardcoded-spacing.js

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent hardcoded Tailwind spacing classes',
      category: 'Best Practices',
    },
    messages: {
      hardcodedSpacing: 'Use Layout Primitives (Box/Stack/Inline) instead of hardcoded spacing: {{class}}',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === 'className') {
          const value = node.value?.value || '';
          const forbidden = /\b(gap-\d+|space-[xy]-\d+|p[xy]?-\d+|m[xy]?-\d+)\b/;
          if (forbidden.test(value)) {
            context.report({
              node,
              messageId: 'hardcodedSpacing',
              data: { class: value.match(forbidden)[0] },
            });
          }
        }
      },
    };
  },
};
```

**6.2 Add to ESLint config**

```javascript
// packages/eslint-config/index.js
module.exports = {
  rules: {
    'local/no-hardcoded-spacing': 'warn', // Warn, not error (gradual adoption)
  },
};
```

**6.3 Test rule**

```bash
pnpm lint --fix
```

---

### Step 7: QA Testing & Sign-off (Day 4)

**7.1 QA checklist**

```markdown
# QA Test Plan

## Critical Flows

- [ ] Auth: Login → Dashboard → Logout
- [ ] Workspace: Create → Navigate → Delete
- [ ] Table: Create → Configure fields → Save
- [ ] Record: Create → Edit → Delete
- [ ] Workflow Form: Create → Add fields → Save
- [ ] Connector: Select → Configure → Test
- [ ] Team: Invite member → Assign role

## Visual Checks

- [ ] All pages render correctly (no layout breaks)
- [ ] Responsive: Mobile, tablet, desktop
- [ ] Dark mode: Spacing consistent
- [ ] Empty states: Proper spacing
- [ ] Loading states: Skeleton spacing

## Performance

- [ ] Pages load in < 3s (dev)
- [ ] No console errors
- [ ] Smooth scrolling
- [ ] No CLS (layout shift)

## Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader announcements unchanged
- [ ] Touch targets ≥44px (mobile)

## Edge Cases

- [ ] Long content: Overflow/scroll works
- [ ] Many items: Pagination/virtualization works
- [ ] Error states: Spacing preserved
```

**7.2 Deployment checklist**

```markdown
# Deployment Checklist

## Pre-Deployment

- [ ] All tests pass (unit, integration, e2e)
- [ ] Percy: 0 unapproved diffs
- [ ] Lighthouse: Performance acceptable
- [ ] Bundle size: Within limits
- [ ] QA sign-off received
- [ ] Team review completed
- [ ] Rollback plan documented

## Deployment

- [ ] Merge to main
- [ ] Tag release: v1.0.0-layout-primitives
- [ ] Deploy to staging
- [ ] Smoke test staging
- [ ] Deploy to production
- [ ] Monitor errors (Sentry, logs)

## Post-Deployment

- [ ] Verify key pages load
- [ ] Monitor performance (Real User Metrics)
- [ ] Check error rates (< 0.1%)
- [ ] User feedback (support tickets, surveys)

## Rollback Triggers

- Error rate > 1%
- Performance degradation > 20%
- Critical user flow broken
- Visual regressions reported
```

**7.3 Rollback plan**

```bash
# If issues detected post-deployment:

# 1. Revert to previous release
git checkout v0.9.9-pre-migration
pnpm build
# Deploy

# 2. Or cherry-pick fixes
git checkout main
git revert <commit-hash>
pnpm build
# Deploy

# 3. Document issues for Phase 7 (hotfix)
```

---

## Todo List

**Day 1**:

- [ ] Run Percy full suite
- [ ] Review Percy dashboard
- [ ] Fix any visual regressions
- [ ] Baseline Lighthouse audits (5 pages)

**Day 2**:

- [ ] Current Lighthouse audits (5 pages)
- [ ] Create performance comparison report
- [ ] Run bundle size analysis
- [ ] Document bundle changes
- [ ] Start final migration report

**Day 3**:

- [ ] Complete final migration report
- [ ] Update design system documentation
- [ ] Search for remaining hardcoded spacing
- [ ] Clean up legacy code
- [ ] Create ESLint rule (optional)

**Day 4**:

- [ ] QA testing (run checklist)
- [ ] Create deployment checklist
- [ ] Team review + sign-off
- [ ] Tag release
- [ ] Deploy to staging
- [ ] Smoke test
- [ ] Deploy to production (if approved)

---

## Success Criteria

**Must Have (Gates Production)**:

- ✅ Percy: 0 unapproved diffs
- ✅ Lighthouse: Performance ±10% vs baseline
- ✅ Bundle size: ≤5KB increase
- ✅ TypeScript: Zero errors
- ✅ QA sign-off: All critical flows pass
- ✅ No console errors (dev + prod)

**Should Have**:

- ✅ Final migration report complete
- ✅ Design system docs updated
- ✅ Pattern library created
- ✅ Legacy code cleaned up
- ✅ 100+ files migrated

**Nice to Have**:

- ✅ ESLint rule implemented
- ✅ Deployment automation (CI/CD)
- ✅ Real User Monitoring dashboard
- ✅ User feedback survey

---

## Risk Assessment

| Risk                                  | Probability | Impact   | Mitigation                        |
| ------------------------------------- | ----------- | -------- | --------------------------------- |
| Visual regressions discovered late    | Low         | High     | Comprehensive Percy testing early |
| Performance degradation in production | Low         | Critical | Lighthouse + RUM monitoring       |
| User-reported layout issues           | Medium      | Medium   | Rollback plan, hotfix process     |
| Team resistance to primitives         | Low         | Medium   | Documentation, training, examples |

**Rollback Plan**:

- Tag: `v0.9.9-pre-migration`
- One-click revert to previous release
- Hotfix branch for critical issues
- Document learnings for future

---

## Security Considerations

N/A - UI-only changes, no security implications.

---

## Next Steps

**After Phase 6 completion**:

1. **Production deployment** (if all checks pass)
2. **Monitor for 1 week** (error rates, performance, user feedback)
3. **Retrospective** (team discussion on process, learnings)
4. **Knowledge sharing** (blog post, internal presentation)
5. **Continuous improvement** (ESLint rule, onboarding updates)

**Future Enhancements**:

- Responsive primitive props (space={{ base: '100', md: '200' }})
- Animation-friendly primitives (stable class names)
- Primitive composition helpers (CardContent, DialogContent)
- Codemod tool for future migrations

---

## Appendix: Rollback Procedure

```bash
# 1. Identify issue (e.g., visual regression on /tables page)
# 2. Assess severity (critical user flow? cosmetic?)

# If CRITICAL:
git checkout v0.9.9-pre-migration
pnpm build
pnpm --filter web preview # Test
# Deploy to production immediately

# If NON-CRITICAL:
# Create hotfix branch
git checkout -b hotfix/layout-issue-tables
# Fix issue (revert specific file or patch)
git commit -m "fix: revert tables page layout"
# Cherry-pick to main
git checkout main
git cherry-pick <commit>
# Deploy

# 3. Document in migration report
# 4. Schedule fix in Phase 7 (if needed)
```
