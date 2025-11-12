# Phase 02: Design Token System

**Duration**: 2 days
**Dependencies**: Phase 01 (Research & Analysis)
**Status**: Draft

## Objectives

1. Define CSS custom properties for typography tokens
2. Integrate tokens with TailwindCSS v4
3. Implement dark mode support
4. Create responsive typography scaling
5. Set up Vietnamese language optimizations

## Tasks

### Task 2.1: CSS Custom Properties (4 hours)

**Goal**: Define all typography design tokens in globals.css

**Activities:**

- Extend `packages/ui/src/styles/globals.css` with typography tokens
- Define base font properties (family, size, weight, line-height, letter-spacing)
- Create semantic scale tokens (heading-_, body-_, code-_, metric-_)
- Implement shorthand tokens (composite font declarations)
- Add dark mode overrides where needed

**File**: `packages/ui/src/styles/globals.css`

**Implementation:**

```css
@theme {
  /* Existing font family tokens */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* === Heading Tokens === */
  --font-heading-display-size: 2.25rem;
  --font-heading-display-line-height: 1.2;
  --font-heading-display-weight: 700;
  --font-heading-display-letter-spacing: -0.02em;

  --font-heading-large-size: 1.875rem;
  --font-heading-large-line-height: 1.25;
  --font-heading-large-weight: 600;
  --font-heading-large-letter-spacing: -0.01em;

  --font-heading-medium-size: 1.5rem;
  --font-heading-medium-line-height: 1.375;
  --font-heading-medium-weight: 600;
  --font-heading-medium-letter-spacing: normal;

  --font-heading-small-size: 1.25rem;
  --font-heading-small-line-height: 1.375;
  --font-heading-small-weight: 600;
  --font-heading-small-letter-spacing: normal;

  --font-heading-xsmall-size: 1.125rem;
  --font-heading-xsmall-line-height: 1.5;
  --font-heading-xsmall-weight: 500;
  --font-heading-xsmall-letter-spacing: normal;

  --font-heading-xxsmall-size: 1rem;
  --font-heading-xxsmall-line-height: 1.5;
  --font-heading-xxsmall-weight: 500;
  --font-heading-xxsmall-letter-spacing: normal;

  /* === Body Text Tokens === */
  --font-body-large-size: 1rem;
  --font-body-large-line-height: 1.625;
  --font-body-large-weight: 400;

  --font-body-default-size: 0.875rem;
  --font-body-default-line-height: 1.5;
  --font-body-default-weight: 400;

  --font-body-small-size: 0.75rem;
  --font-body-small-line-height: 1.375;
  --font-body-small-weight: 400;

  /* === Code/Mono Tokens === */
  --font-code-inline-size: 0.875rem;
  --font-code-inline-line-height: 1.5;
  --font-code-inline-weight: 400;

  --font-code-block-size: 0.875rem;
  --font-code-block-line-height: 1.625;
  --font-code-block-weight: 400;

  /* === Metric/Data Tokens === */
  --font-metric-large-size: 2rem;
  --font-metric-large-line-height: 1;
  --font-metric-large-weight: 700;

  --font-metric-medium-size: 1.5rem;
  --font-metric-medium-line-height: 1.2;
  --font-metric-medium-weight: 600;

  --font-metric-small-size: 1rem;
  --font-metric-small-line-height: 1.375;
  --font-metric-small-weight: 500;
}

/* Vietnamese-specific adjustments */
:root[lang='vi'],
:root[lang='vi-VN'] {
  --font-body-large-line-height: 1.75;
  --font-body-default-line-height: 1.625;
  --font-heading-medium-weight: 500; /* Medium weight better for Vietnamese diacritics */
  --font-heading-small-weight: 500;
}

/* Dark mode overrides (if needed) */
.dark {
  /* No typography token changes needed for dark mode */
  /* Font rendering already handled by existing color tokens */
}
```

**Acceptance**:

- [ ] All 16 typography tokens defined
- [ ] Vietnamese lang selector adjustments working
- [ ] Dark mode compatible

### Task 2.2: TailwindCSS v4 Integration (3 hours)

**Goal**: Configure Tailwind to use typography tokens

**Activities:**

- Extend Tailwind theme with custom typography utilities
- Create utility classes for semantic typography
- Configure font-size/line-height/weight combinations
- Test Tailwind compilation with new tokens

**File**: `packages/ui/src/styles/globals.css` (add to @theme block)

**Implementation:**

```css
@theme inline {
  /* Existing color tokens... */

  /* === Typography Utilities === */
  /* Heading utilities */
  --font-size-heading-display: var(--font-heading-display-size);
  --line-height-heading-display: var(--font-heading-display-line-height);
  --font-weight-heading-display: var(--font-heading-display-weight);

  --font-size-heading-large: var(--font-heading-large-size);
  --line-height-heading-large: var(--font-heading-large-line-height);
  --font-weight-heading-large: var(--font-heading-large-weight);

  /* Body utilities */
  --font-size-body-large: var(--font-body-large-size);
  --line-height-body-large: var(--font-body-large-line-height);

  --font-size-body: var(--font-body-default-size);
  --line-height-body: var(--font-body-default-line-height);

  --font-size-body-small: var(--font-body-small-size);
  --line-height-body-small: var(--font-body-small-line-height);

  /* Code utilities */
  --font-size-code: var(--font-code-inline-size);
  --line-height-code: var(--font-code-inline-line-height);

  /* Metric utilities */
  --font-size-metric-large: var(--font-metric-large-size);
  --font-size-metric-medium: var(--font-metric-medium-size);
  --font-size-metric-small: var(--font-metric-small-size);
}
```

**Usage Examples:**

```tsx
// Using tokens directly
<h1 style={{ fontSize: 'var(--font-heading-display-size)' }}>Title</h1>

// Using Tailwind utilities
<h1 className="text-heading-display font-heading-display leading-heading-display">
  Title
</h1>
```

**Acceptance**:

- [ ] Tailwind utilities available (`text-heading-display`, etc.)
- [ ] Hot reload works with token changes
- [ ] No build errors

### Task 2.3: Responsive Typography (3 hours)

**Goal**: Implement responsive scaling at defined breakpoints

**Activities:**

- Define mobile, tablet, desktop scaling factors
- Create responsive token overrides
- Test typography reflow at breakpoints
- Validate readability at all sizes

**Implementation:**

```css
/* Mobile-first base scale (defined in Task 2.1) */

/* Tablet (md: 768px) - Scale up slightly */
@media (min-width: 48rem) {
  :root {
    --font-heading-display-size: 2.5rem;
    --font-heading-large-size: 2rem;
    --font-heading-medium-size: 1.625rem;
  }
}

/* Desktop (lg: 1024px) - Full scale */
@media (min-width: 64rem) {
  :root {
    --font-heading-display-size: 2.75rem;
    --font-heading-large-size: 2.25rem;
    --font-heading-medium-size: 1.75rem;
    --font-metric-large-size: 2.5rem;
  }
}

/* Large desktop (xl: 1280px) - Max scale */
@media (min-width: 80rem) {
  :root {
    --font-heading-display-size: 3rem;
    --font-heading-large-size: 2.5rem;
  }
}
```

**Acceptance**:

- [ ] Typography scales correctly at 4 breakpoints
- [ ] Mobile readability maintained (no text below 12px)
- [ ] Desktop doesn't scale too large (max 48px)

### Task 2.4: Font Loading Optimization (2 hours)

**Goal**: Optimize Geist Sans/Mono loading for performance

**Activities:**

- Update main.tsx font loading strategy
- Implement font-display: swap
- Add font preload hints
- Test FOUT/FOIT behavior

**File**: `apps/web/index.html` (add preload links)

```html
<head>
  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/GeistSans-Regular.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/GeistSans-Medium.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/GeistSans-SemiBold.woff2" as="font" type="font/woff2" crossorigin />
</head>
```

**File**: `apps/web/src/main.tsx` (update font declarations)

```typescript
document.documentElement.style.setProperty(
  '--font-geist-sans',
  '"Geist Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
);
document.documentElement.style.setProperty(
  '--font-geist-mono',
  '"Geist Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
);
```

**CSS** (add to globals.css):

```css
@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/GeistSans-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap; /* Prevents invisible text during load */
  font-style: normal;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/GeistMono-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
}
```

**Acceptance**:

- [ ] Fonts load with fallback (no FOIT)
- [ ] Variable fonts used (better file size)
- [ ] Lighthouse performance score maintained

### Task 2.5: Vietnamese Testing Suite (2 hours)

**Goal**: Create comprehensive Vietnamese typography tests

**Activities:**

- Build test page with all diacritics
- Validate rendering in all browsers
- Test line-height adjustments
- Document any rendering issues

**File**: `packages/ui/tests/vietnamese-typography.html`

**Test String:**

```html
<p>Các thanh điệu tiếng Việt: á à ả ã ạ, é è ẻ ẽ ẹ, í ì ỉ ĩ ị, ó ò ỏ õ ọ, ú ù ủ ũ ụ, ý ỳ ỷ ỹ ỵ</p>
<p>Nguyên âm đặc biệt: ơ ớ ờ ở ỡ ợ, ư ứ ừ ử ữ ự, ă ắ ằ ẳ ẵ ặ</p>
<p>Đoạn văn mẫu: Việc tối ưu hóa hệ thống thiết kế đòi hỏi sự chú ý đến từng chi tiết nhỏ.</p>
```

**Acceptance**:

- [ ] All 134 Vietnamese characters render correctly
- [ ] No diacritic clipping or overlap
- [ ] Line-height adjustments working
- [ ] Tested in Chrome, Firefox, Safari

## Acceptance Criteria

- [ ] All typography tokens defined in globals.css
- [ ] Tailwind integration working (utilities available)
- [ ] Responsive scaling at 4 breakpoints
- [ ] Font loading optimized (swap, preload)
- [ ] Vietnamese characters render correctly
- [ ] Dark mode compatible
- [ ] No build errors or warnings
- [ ] Token documentation updated

## Risks

**Risk**: Geist Sans variable fonts not available
**Mitigation**: Use static font files, optimize with subset tool

**Risk**: TailwindCSS v4 theme extension breaks
**Mitigation**: Follow v4 documentation, test incrementally

**Risk**: Responsive scaling too aggressive (text too large/small)
**Mitigation**: Conservative scaling factors, user testing

## Deliverables

1. Updated `packages/ui/src/styles/globals.css` with typography tokens
2. Font loading configuration in main.tsx
3. Vietnamese test suite
4. Token documentation (tables, usage examples)

## Next Phase

Phase 03: Component Implementation - Build React Typography components using new tokens
