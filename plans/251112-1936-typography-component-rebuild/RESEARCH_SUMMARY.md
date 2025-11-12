# Typography Component Rebuild - Research Summary

**Date**: 2025-11-12
**Author**: Claude Code Agent
**Status**: Complete

## Executive Summary

Comprehensive plan to rebuild Beqeek typography system following Atlassian Design System principles. Current state uses ad-hoc Tailwind utilities across 40+ files without semantic structure. New system provides composable React components, design tokens, Vietnamese optimization, and full accessibility compliance.

**Timeline**: 10 days (4 phases)
**Impact**: High - affects all UI components
**Risk Level**: Medium - requires gradual migration

---

## Research Findings

### 1. Atlassian Typography System Analysis

**Key Learnings:**

**Font Strategy:**

- App fonts (Atlassian Sans/Mono) for product UI
- System font fallbacks (ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI)
- Brand fonts (Charlie) restricted to marketing only
- Variable font format for file size optimization

**Typography Scales:**

- **Headings**: 7 levels (XXLarge: 2.1875rem → XXSmall: 0.75rem)
- **Body**: 3 sizes (Large: 1rem, Regular: 0.875rem, Small: 0.6875rem)
- **Weights**: Regular 400, Medium 500, Semibold 600, Bold 653/700
- **Code**: Monospace with consistent 0.875rem sizing

**Semantic Naming Pattern:**

```
--ds-font-{category}-{size}
  category: heading | body | code | metric
  size: display | large | medium | small | xsmall | xxsmall
```

**Responsive Strategy:**

- 5 breakpoints (30rem, 48rem, 64rem, 90rem, 110.5rem)
- Progressive scaling at larger viewports
- Mobile-first approach

**Accessibility Features:**

- Optimized line-heights for readability (1.2-1.625)
- WCAG 2.1 AA contrast ratios
- Semantic HTML (h1-h6) with proper hierarchy
- Forced-colors mode support for high-contrast
- prefers-reduced-motion respect

**Design Principles:**

1. Optimize for readability
2. Create visual harmony through hierarchy
3. Contextualize for different users/devices

---

### 2. Current Beqeek State Audit

**Font Configuration (main.tsx):**

```typescript
'--font-geist-sans': "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
'--font-geist-mono': "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
```

**Issue**: Documentation mentions Geist Sans/Mono, but actual font stack uses Inter. Need to clarify font strategy.

**Typography Usage Patterns (40+ files):**

- Headings: `text-3xl font-bold`, `text-2xl font-semibold`, `text-xl font-semibold`
- Body: `text-base`, `text-sm`, `text-xs` with varying `leading-*` values
- Weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- Colors: `text-foreground`, `text-muted-foreground`, ad-hoc color classes

**Pain Points:**

1. **No semantic structure** - Hardcoded classes scattered across codebase
2. **Inconsistent hierarchy** - Same visual style for different heading levels
3. **No design tokens** - Typography not part of design system tokens
4. **Vietnamese gaps** - No line-height optimizations for diacritics
5. **Maintenance burden** - Changes require manual find/replace
6. **Type safety** - No TypeScript types for typography variants

**Design System Documentation:**

- Typography section exists but lacks semantic components
- Lists Tailwind utilities, not reusable patterns
- No component library for typography
- Vietnamese section mentions support but no implementation details

---

### 3. Vietnamese Language Requirements

**Character Set (134 total characters):**

- 6 tone marks: acute (á), grave (à), hook (ả), tilde (ã), dot (ạ), none
- 12 base vowels: a, ă, â, e, ê, i, o, ô, ơ, u, ư, y
- Special: horn (ơ, ư), breve (ă) with all tone combinations

**Typography Challenges:**

1. **Diacritic clipping** - Marks above/below can overlap with adjacent lines
2. **Weight rendering** - Bold weights can make diacritics less legible
3. **Line-height** - Standard 1.5 line-height too tight for Vietnamese

**Industry Best Practices:**

- Line-height: 1.6-1.75 for body text (vs 1.5 for English)
- Font-weight: Medium (500) preferred over Bold (700) for headings
- Letter-spacing: Normal (no adjustments needed)
- Font families: Modern sans-serifs with full Unicode support

**Geist Sans Compatibility:**

- Need to verify Vietnamese diacritic rendering
- Test all 134 characters for clipping/overlap
- Fallback to Inter if issues found

**Proposed Optimizations:**

```css
:root[lang='vi'],
:root[lang='vi-VN'] {
  --font-body-large-line-height: 1.75;
  --font-body-default-line-height: 1.625;
  --font-heading-medium-weight: 500; /* Medium instead of semibold */
  --font-heading-small-weight: 500;
}
```

---

### 4. Proposed Typography Scale

**Design Principles:**

- Match Atlassian semantic naming
- Adapt sizes to Beqeek UI density
- Support 6 HTML heading levels (h1-h6)
- Provide 3 body text sizes
- Include code and metric variants

**Heading Scale (6 levels):**

```
display  → H1: 2.25rem (36px) / 1.2 / bold (700) / -0.02em
large    → H2: 1.875rem (30px) / 1.25 / semibold (600) / -0.01em
medium   → H3: 1.5rem (24px) / 1.375 / semibold (600) / normal
small    → H4: 1.25rem (20px) / 1.375 / semibold (600) / normal
xsmall   → H5: 1.125rem (18px) / 1.5 / medium (500) / normal
xxsmall  → H6: 1rem (16px) / 1.5 / medium (500) / normal
```

**Body Scale (3 sizes):**

```
large   → 1rem (16px) / 1.625 / normal (400) - Long-form content
default → 0.875rem (14px) / 1.5 / normal (400) - UI text, forms
small   → 0.75rem (12px) / 1.375 / normal (400) - Captions, labels
```

**Code/Monospace (2 variants):**

```
inline → 0.875rem (14px) / 1.5 / normal (400) - Inline code
block  → 0.875rem (14px) / 1.625 / normal (400) - Code blocks
```

**Metric/Data (3 sizes):**

```
large  → 2rem (32px) / 1.0 / bold (700) - Dashboard KPIs
medium → 1.5rem (24px) / 1.2 / semibold (600) - Card stats
small  → 1rem (16px) / 1.375 / medium (500) - Inline metrics
```

**Responsive Scaling:**
| Breakpoint | display | large | medium |
|------------|---------|-------|--------|
| Mobile (0px) | 2.25rem | 1.875rem | 1.5rem |
| Tablet (768px) | 2.5rem | 2rem | 1.625rem |
| Desktop (1024px) | 2.75rem | 2.25rem | 1.75rem |
| XL (1280px) | 3rem | 2.5rem | 1.75rem |

---

### 5. Design Token Architecture

**Naming Convention:**

```
--font-{category}-{size}-{property}

Examples:
--font-heading-display-size
--font-heading-display-line-height
--font-heading-display-weight
--font-heading-display-letter-spacing
```

**Token Hierarchy:**

```
Base tokens (primitives)
  ↓
Semantic tokens (heading-display, body-default)
  ↓
Component tokens (Heading, Text components)
  ↓
Tailwind utilities (text-heading-display)
```

**TailwindCSS v4 Integration:**

```css
@theme {
  --font-heading-display-size: 2.25rem;
  --font-heading-display-line-height: 1.2;
  /* ... more tokens */
}

@theme inline {
  --font-size-heading-display: var(--font-heading-display-size);
  --line-height-heading-display: var(--font-heading-display-line-height);
}
```

**Dark Mode Strategy:**

- Typography tokens remain same in dark mode
- Color tokens (text-foreground, etc.) handle dark mode
- No font size/weight changes needed

---

## Component Design Specification

### 1. Heading Component

**API:**

```tsx
<Heading
  level?: 'display' | 'large' | 'medium' | 'small' | 'xsmall' | 'xxsmall'
  color?: 'default' | 'muted' | 'primary' | 'destructive'
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  asChild?: boolean
  className?: string
>
```

**Features:**

- Automatic HTML mapping (display→h1, large→h2, etc.)
- Visual hierarchy override with `as` prop
- Design token integration
- Full TypeScript types
- Radix Slot for composition (`asChild` pattern)

### 2. Text Component

**API:**

```tsx
<Text
  size?: 'large' | 'default' | 'small'
  weight?: 'normal' | 'medium' | 'semibold'
  color?: 'default' | 'muted' | 'primary' | 'destructive' | 'success' | 'warning'
  align?: 'left' | 'center' | 'right' | 'justify'
  as?: 'p' | 'span' | 'div' | 'label' | 'legend'
  truncate?: boolean
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6
  asChild?: boolean
>
```

**Features:**

- 3 size variants
- 3 weight options
- 7 color variants
- Text truncation and line-clamping
- Semantic elements

### 3. Code Component

**API:**

```tsx
<Code
  variant?: 'inline' | 'block'
  color?: 'default' | 'muted' | 'primary'
  block?: boolean // Shorthand for variant="block"
>
```

**Features:**

- Inline and block variants
- Automatic `<pre>` wrapper for block code
- Horizontal scroll for long lines
- Monospace font token integration

### 4. Metric Component

**API:**

```tsx
<Metric
  value: string | number
  size?: 'large' | 'medium' | 'small'
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  label?: string
  unit?: string
  unitPosition?: 'prefix' | 'suffix'
>
```

**Features:**

- Tabular numerals (aligned digits)
- Optional label below metric
- Unit prefix/suffix support
- Color variants for status

---

## Migration Strategy

### Phase 1: Foundation (Week 1)

- Implement design tokens in globals.css
- Build React components
- Create visual gallery
- Write documentation

### Phase 2: New Code Adoption (Week 2)

- Use Typography components for all new features
- Add to component guidelines
- Team training session

### Phase 3: High-Priority Migration (Week 3-4)

- Migrate dashboard, tables, record detail
- Focus on user-facing pages
- Visual regression testing

### Phase 4: Gradual Rollout (Month 2-3)

- Update pages as they're modified
- No forced rewrite of working code
- Monitor adoption metrics

### Phase 5: Enforcement (Month 3+)

- Promote linting rules to 'error'
- Deprecate raw Tailwind patterns
- Optional codemod for automation

**Success Criteria:**

- 80% of new code uses Typography components (within 2 weeks)
- 0 visual regression bugs
- 0 accessibility regressions
- Positive developer feedback

---

## Implementation Dependencies

**Required:**

- TailwindCSS v4 (installed ✓)
- class-variance-authority (installed ✓)
- @radix-ui/react-slot (installed ✓)
- @workspace/ui package structure (exists ✓)

**Font Assets:**

- Geist Sans variable font (verify availability)
- Geist Mono variable font (verify availability)
- Fallback to Inter/system fonts if needed

**Testing Tools:**

- Vietnamese character test suite
- Visual regression testing (Percy/Chromatic recommended)
- Accessibility audit (axe DevTools)

---

## Risk Assessment & Mitigation

### HIGH RISKS

**Risk**: Breaking existing UI during migration
**Impact**: User-facing bugs, visual inconsistencies
**Probability**: Medium
**Mitigation**:

- Phased rollout (new features first)
- Visual regression testing
- Keep legacy code working during transition
- Gradual migration over 3 months

**Risk**: Vietnamese diacritics render poorly in Geist Sans
**Impact**: Unusable for Vietnamese users (50% of audience)
**Probability**: Low (but critical if occurs)
**Mitigation**:

- Test immediately in Phase 01
- Fallback to Inter font if issues found
- Comprehensive Vietnamese test suite
- User testing with Vietnamese speakers

### MEDIUM RISKS

**Risk**: Developer adoption resistance (continue using Tailwind classes)
**Impact**: Inconsistent codebase, maintenance burden
**Probability**: Medium
**Mitigation**:

- Clear documentation with examples
- Linting rules (warn → error over time)
- Code review guidelines
- Migration guide with common patterns

**Risk**: Performance impact (bundle size increase)
**Impact**: Slower page loads
**Probability**: Low
**Mitigation**:

- CVA already a dependency (minimal overhead)
- Components are tree-shakeable
- Measure bundle size before/after
- Lighthouse performance monitoring

### LOW RISKS

**Risk**: TailwindCSS v4 token integration breaks
**Impact**: Styling failures
**Probability**: Low
**Mitigation**:

- Follow v4 documentation closely
- Test incremental changes
- Fallback to Tailwind v3 if critical

**Risk**: Responsive scaling too aggressive
**Impact**: Text too large/small at certain viewports
**Probability**: Low
**Mitigation**:

- Conservative scaling factors
- User testing at breakpoints
- Easy to adjust tokens

---

## Unresolved Questions

1. **Font Asset Availability**: Are Geist Sans/Mono variable fonts available in project? If not, continue with Inter?

2. **Storybook Integration**: Should Typography components be added to Storybook? Not mentioned in project docs.

3. **i18n Integration**: Should Typography components auto-detect `lang` attribute for Vietnamese optimizations?

4. **Codemod Automation**: Worth building automated migration tool (jscodeshift) or manual migration sufficient?

5. **Bundle Size Target**: What's acceptable bundle size increase? Current size not documented.

6. **Legacy Timeline**: When to remove legacy Tailwind utilities completely? Suggested 6 months, confirm with team.

7. **Unit Testing**: Are Jest/Vitest tests required? Not mentioned in project scripts. Currently using Node test runner.

---

## Success Metrics

**Adoption Metrics:**

- 80% of new PRs use Typography components (within 2 weeks)
- 50% of existing pages migrated (within 3 months)
- 0 new code with raw text-\* Tailwind classes (after Week 2)

**Quality Metrics:**

- 0 visual regression bugs reported
- 0 accessibility regressions (WCAG 2.1 AA maintained)
- 100% Vietnamese character rendering pass rate
- <5% bundle size increase

**Developer Experience Metrics:**

- <5 min learning curve (documentation + examples)
- Positive feedback in retrospectives
- <3 typography-related support requests per week

---

## Next Steps

1. **Review & Approval** - Stakeholder review of plan and research findings
2. **Phase 01 Start** - Begin Research & Analysis tasks
3. **Font Verification** - Confirm Geist Sans/Mono availability
4. **Vietnamese Testing** - Build comprehensive test suite
5. **Token Implementation** - Start Phase 02 design tokens

---

## References

**External:**

- Atlassian Design System Typography: https://atlassian.design/foundations/typography
- TailwindCSS v4 Docs: https://tailwindcss.com/
- CVA Documentation: https://cva.style/docs
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

**Internal:**

- `/docs/design-system.md` - Current design system
- `/packages/ui/src/styles/globals.css` - Design tokens
- `/apps/web/src/main.tsx` - Font configuration
- `/CLAUDE.md` - Development guidelines
