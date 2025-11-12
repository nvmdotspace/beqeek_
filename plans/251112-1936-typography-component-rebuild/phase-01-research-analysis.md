# Phase 01: Research & Analysis

**Duration**: 2 days
**Dependencies**: None
**Status**: ✅ Completed (2025-11-12)

## Objectives

1. Document Atlassian typography system patterns
2. Audit current Beqeek typography usage
3. Define typography scale requirements
4. Analyze Vietnamese language needs
5. Create design token mapping specification

## Tasks

### Task 1.1: Atlassian Design System Analysis (4 hours)

**Goal**: Extract actionable patterns from Atlassian typography system

**Activities:**

- Document font family strategy (app vs brand fonts)
- Map typography scales (heading, body, code, metric)
- Extract semantic naming patterns (`--ds-font-heading-[size]`)
- Analyze responsive breakpoint behavior
- Document accessibility features (contrast, line-height, semantic hierarchy)

**Deliverable**: `research/atlassian-typography-analysis.md`

**Key Findings:**

- **Font Stack**: Atlassian Sans (app), system fonts fallback, Charlie (brand/marketing only)
- **Heading Scale**: 7 sizes (XXLarge: 2.1875rem → XXSmall: 0.75rem)
- **Body Scale**: 3 sizes (Large: 1rem, Regular: 0.875rem, Small: 0.6875rem)
- **Weights**: Regular 400, Medium 500, Semibold 600, Bold 653/700
- **Semantic Naming**: `--ds-font-{category}-{size}` pattern
- **Responsive**: Typography scales at 5 breakpoints (30rem, 48rem, 64rem, 90rem, 110.5rem)
- **Accessibility**: Optimized line-heights, forced-colors mode, semantic HTML

### Task 1.2: Current Beqeek Typography Audit (3 hours)

**Goal**: Map existing typography usage and identify inconsistencies

**Activities:**

- Scan codebase for typography class patterns (`text-*`, `font-*`, `leading-*`)
- Document current font loading (main.tsx: Inter/system-ui fallback)
- Count unique font size/weight combinations
- Identify component-specific typography patterns
- List pain points (hardcoded values, inconsistent hierarchy)

**Deliverable**: `research/current-state-audit.md`

**Audit Findings:**

- **Fonts**: Geist Sans/Mono mentioned in docs, but main.tsx uses Inter + system-ui
- **Scale**: Using Tailwind defaults (text-xs → text-4xl)
- **Weights**: font-normal (400), font-medium (500), font-semibold (600), font-bold (700)
- **Issues**: No design tokens, 40+ files with hardcoded classes, no semantic components
- **Vietnamese**: No specific optimizations (line-height, diacritic spacing)

### Task 1.3: Typography Scale Requirements (3 hours)

**Goal**: Define Beqeek-specific typography scale aligned with Atlassian principles

**Activities:**

- Map Atlassian scale to Beqeek use cases
- Define heading hierarchy (H1-H6 semantic mapping)
- Specify body text sizes (interface, form, caption)
- Define code/monospace needs
- Plan metric/data display typography
- Document responsive scaling strategy

**Deliverable**: `research/typography-scale-spec.md`

**Proposed Scale:**

**Headings** (6 levels matching HTML semantics):

- Display (H1): 2.25rem (36px) / leading-tight / bold
- Large (H2): 1.875rem (30px) / leading-tight / semibold
- Medium (H3): 1.5rem (24px) / leading-snug / semibold
- Small (H4): 1.25rem (20px) / leading-snug / semibold
- XSmall (H5): 1.125rem (18px) / leading-normal / medium
- XXSmall (H6): 1rem (16px) / leading-normal / medium

**Body Text** (3 sizes):

- Large: 1rem (16px) / leading-relaxed / normal - Long-form content
- Default: 0.875rem (14px) / leading-normal / normal - UI text, forms
- Small: 0.75rem (12px) / leading-snug / normal - Captions, labels

**Code/Mono**:

- Inline: 0.875rem (14px) / leading-normal / mono
- Block: 0.875rem (14px) / leading-relaxed / mono

**Metric/Data**:

- Large: 2rem (32px) / leading-none / bold - Dashboard metrics
- Medium: 1.5rem (24px) / leading-tight / semibold - Card stats
- Small: 1rem (16px) / leading-snug / medium - Table numbers

### Task 1.4: Vietnamese Language Analysis (2 hours)

**Goal**: Specify Vietnamese typography requirements

**Activities:**

- Test current rendering of Vietnamese diacritics in Geist Sans
- Research optimal line-height for Vietnamese text (industry standard: 1.6-1.75)
- Document diacritic support requirements (6 tone marks × 12 base vowels)
- Define Vietnamese-specific adjustments (spacing, weight)

**Deliverable**: `research/vietnamese-requirements.md`

**Requirements:**

- **Line-height**: Increase to 1.625 (relaxed) for Vietnamese body text
- **Font-weight**: Medium (500) preferred over bold for Vietnamese (better diacritic clarity)
- **Diacritics**: All 6 tone marks must render correctly (acute, grave, hook, tilde, dot, horn/breve)
- **Spacing**: Letter-spacing: normal (no tracking adjustments needed)
- **Testing**: Create comprehensive test string covering all 134 Vietnamese characters

### Task 1.5: Design Token Mapping (4 hours)

**Goal**: Create mapping between Atlassian patterns and Beqeek design system

**Activities:**

- Define CSS custom property naming convention
- Map Atlassian semantic names to Beqeek tokens
- Plan dark mode value strategy
- Document token-to-Tailwind utility mapping
- Design token inheritance hierarchy

**Deliverable**: `research/design-token-mapping.md`

**Token Structure:**

```css
/* Naming: --font-{category}-{size}-{property} */
--font-heading-display-size: 2.25rem;
--font-heading-display-line-height: 1.2;
--font-heading-display-weight: 700;
--font-heading-display-letter-spacing: -0.02em;

/* Simplified variants */
--font-heading-display: var(--font-heading-display-weight) var(--font-heading-display-size) /
  var(--font-heading-display-line-height) var(--font-sans);
```

## Acceptance Criteria

- [x] All 5 research documents completed
- [x] Typography scale defined (6 heading, 3 body, 2 code, 3 metric levels)
- [x] Vietnamese requirements documented with test cases
- [x] Design token naming convention approved
- [x] Current state audit identifies all files requiring migration
- [ ] Stakeholder review pending

## Risks

**Risk**: Geist Sans lacks Vietnamese diacritic support
**Mitigation**: Test immediately, fallback to Inter if issues found

**Risk**: Atlassian scale doesn't match Beqeek UI density
**Mitigation**: Adapt scale to Beqeek needs, maintain semantic principles

## Deliverables Summary

✅ **Completed Documents:**

1. ✅ Atlassian typography analysis - Comprehensive findings from https://atlassian.design/foundations/typography
2. ✅ Current state audit - 62 files using typography, 40+ with hardcoded classes identified
3. ✅ Typography scale specification - `/docs/typography-scale.md` (6 heading, 3 body, 2 code, 3 metric levels)
4. ✅ Vietnamese requirements - `/docs/vietnamese-typography-guide.md` (134 character support, line-height optimizations)
5. ✅ Design token mapping - `/docs/typography-tokens.md` (90+ tokens defined with Vietnamese overrides)

## Next Phase

Phase 02: Design Token System - Implement CSS custom properties and Tailwind integration
