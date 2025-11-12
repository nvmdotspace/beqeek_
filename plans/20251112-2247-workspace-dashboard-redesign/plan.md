# Workspace Dashboard Redesign Plan

**Project:** Beqeek Workspace Dashboard Redesign
**Start Date:** 2025-11-12
**Status:** 🚧 In Progress
**Priority:** High

## Overview

Redesign the workspace dashboard to be more compact, scannable, and aligned with the Beqeek Design System. Address key UX issues: oversized statistics cards, cluttered workspace cards, and unnecessary navigation friction.

## Problem Statement

### Current Issues

1. **Statistics cards are too large** - Occupy 30-40% of viewport, pushing workspaces below fold
2. **Workspace cards have information overload** - Too many metadata fields and buttons
3. **Navigation friction** - Two clicks required to access workspace (card → button)

### Design Goals

- Reduce vertical space for statistics by 50-60%
- Simplify workspace cards (reference: Jira's space list)
- Enable one-click navigation to workspaces
- Apply Beqeek Design System tokens consistently
- Maintain accessibility and responsive behavior

## Phases

### [Phase 1: Compact Statistics Design](./phase-01-statistics-redesign.md)

**Status:** 🚧 In Progress
**Priority:** High

- Analyze current statistics layout
- Design compact horizontal statistics bar
- Reduce card height from ~150px to ~70px
- Apply design system tokens

### [Phase 2: Simplified Workspace Cards](./phase-02-workspace-cards-redesign.md)

**Status:** ⏳ Pending
**Priority:** High

- Study Jira's space list pattern
- Remove bottom button group
- Make entire card clickable
- Show minimal info: icon, name, key
- Add hover state for additional actions

### [Phase 3: Component Implementation](./phase-03-component-implementation.md)

**Status:** ⏳ Pending
**Priority:** High

- Implement new StatCard component
- Implement new WorkspaceCard component
- Use Beqeek primitives (Box, Stack, Grid, Inline)
- Apply spacing tokens (space-200, space-300, etc.)
- Ensure TypeScript type safety

### [Phase 4: Integration & Testing](./phase-04-integration-testing.md)

**Status:** ⏳ Pending
**Priority:** Medium

- Replace old components in workspace-dashboard.tsx
- Test responsive behavior (xs to 2xl breakpoints)
- Validate accessibility (keyboard nav, ARIA labels)
- Cross-browser testing
- Performance validation

### [Phase 5: Documentation](./phase-05-documentation.md)

**Status:** ⏳ Pending
**Priority:** Low

- Update design guidelines
- Document component usage
- Add to Storybook (if applicable)
- Create migration guide for other dashboards

## Success Criteria

### Quantitative

- ✅ Statistics section height reduced by ≥50%
- ✅ Workspace card height reduced by ≥40%
- ✅ Navigation clicks reduced from 2 to 1
- ✅ 100% design system token coverage
- ✅ WCAG AA accessibility compliance

### Qualitative

- ✅ Workspace list visible on load without scrolling
- ✅ Cards are scannable and easy to distinguish
- ✅ Professional, modern aesthetic matching Jira/Linear quality
- ✅ Smooth animations and hover states
- ✅ Consistent with rest of Beqeek platform

## Timeline

- **Phase 1:** ~2 hours (design + implement compact stats)
- **Phase 2:** ~3 hours (design + implement workspace cards)
- **Phase 3:** ~2 hours (component development)
- **Phase 4:** ~2 hours (testing + refinement)
- **Phase 5:** ~1 hour (documentation)

**Total Estimated Time:** ~10 hours

## Dependencies

### Design System

- ✅ Beqeek Design System (complete)
- ✅ Layout primitives (Box, Stack, Grid, Inline, Container)
- ✅ Spacing tokens (space-0 to space-1000)
- ✅ Color tokens (semantic + accent)
- ✅ Typography tokens

### Code Structure

- Component location: `apps/web/src/features/workspace/components/`
- Page location: `apps/web/src/features/workspace/pages/workspace-dashboard.tsx`
- Router: TanStack Router with file-based routing

### API & Data

- Workspace API: `apps/web/src/shared/api/workspace-client.ts`
- React Query hooks: `apps/web/src/features/workspace/hooks/use-workspaces.ts`

## Reference Materials

### Design Inspiration

- **Jira Spaces List:** Minimal cards with icon, name, key
- **Linear Projects:** Clean, scannable grid layout
- **Notion Workspaces:** Simple, one-click access

### Documentation

- `/docs/beqeek-design-system.md` - Primary design system reference
- `/docs/layout-primitives-guide.md` - Component usage patterns
- `/docs/DESIGN_SYSTEM_SUMMARY.md` - Token inventory

## Risk Assessment

### Low Risk

- Design system is complete and battle-tested
- Components are isolated and easy to test
- No API changes required

### Medium Risk

- User adaptation to new layout (mitigated by improved UX)
- Breaking existing user workflows (mitigated by better navigation)

### Mitigation Strategies

- Progressive rollout with feature flag
- A/B testing with subset of users
- Gather feedback early and iterate
- Keep old components for easy rollback

## Notes

- Focus on **progressive disclosure** - show essential info first
- Maintain **semantic HTML** for accessibility
- Use **design system tokens** exclusively (no hardcoded values)
- Ensure **mobile-first responsive** design
- Add **smooth transitions** for professional polish

---

**Last Updated:** 2025-11-12
**Next Review:** After Phase 1 completion
