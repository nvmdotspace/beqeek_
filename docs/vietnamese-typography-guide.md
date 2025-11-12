# Vietnamese Typography Optimization Guide

**Version**: 1.0.0
**Date**: 2025-11-12
**For**: Beqeek Typography System

## Overview

This guide provides technical specifications for optimizing typography for Vietnamese language support in Beqeek's design system.

## Vietnamese Character Set

### Total Characters: 134

#### Vowels with Tones (Base: a, ă, â, e, ê, i, o, ô, ơ, u, ư, y)

**A variations** (17 characters):

- Base: a, ă, â
- Acute: á, ắ, ấ
- Grave: à, ằ, ầ
- Hook: ả, ẳ, ẩ
- Tilde: ã, ẵ, ẫ
- Dot below: ạ, ặ, ậ

**E variations** (11 characters):

- Base: e, ê
- Acute: é, ế
- Grave: è, ề
- Hook: ẻ, ể
- Tilde: ẽ, ễ
- Dot below: ẹ, ệ

**I variations** (6 characters):

- Base: i
- Acute: í
- Grave: ì
- Hook: ỉ
- Tilde: ĩ
- Dot below: ị

**O variations** (17 characters):

- Base: o, ô, ơ
- Acute: ó, ố, ớ
- Grave: ò, ồ, ờ
- Hook: ỏ, ổ, ở
- Tilde: õ, ỗ, ỡ
- Dot below: ọ, ộ, ợ

**U variations** (11 characters):

- Base: u, ư
- Acute: ú, ứ
- Grave: ù, ừ
- Hook: ủ, ử
- Tilde: ũ, ữ
- Dot below: ụ, ự

**Y variations** (6 characters):

- Base: y
- Acute: ý
- Grave: ỳ
- Hook: ỷ
- Tilde: ỹ
- Dot below: ỵ

**Consonants** (22 characters):

- b, c, d, đ, g, h, k, l, m, n, p, q, r, s, t, v, x, ch, gh, gi, kh, ng, nh, ph, th, tr

### Character Height Requirements

Vietnamese diacritics extend above and below the base character:

| Diacritic Type   | Vertical Space Required |
| ---------------- | ----------------------- |
| Acute (á, é)     | +25% above cap height   |
| Hook (ả, ẻ)      | +30% above cap height   |
| Tilde (ã, õ)     | +20% above cap height   |
| Dot below (ạ, ẹ) | +15% below baseline     |
| Combined (ậ, ệ)  | +30% above, +15% below  |

**Implication**: Line height must be increased by at least 10-15% to prevent clipping.

## Font Requirements

### Font Family Support

**Inter Font** (Currently used in Beqeek):

- ✅ Full Vietnamese character support
- ✅ Proper diacritic positioning
- ✅ Good weight range (400, 500, 600, 700)
- ✅ Variable font available (reduces file size)

**Alternative Fonts** (if needed):

- Roboto: ✅ Full support
- Open Sans: ✅ Full support
- Noto Sans: ✅ Full support, designed for internationalization
- System fonts: ⚠️ Partial support (test required)

### Font Weight Guidelines

Vietnamese diacritics appear visually heavier than Latin characters:

| Context     | English Weight | Vietnamese Weight | Rationale                                    |
| ----------- | -------------- | ----------------- | -------------------------------------------- |
| Headings    | 700 (bold)     | 600 (semibold)    | Prevents diacritics from appearing too heavy |
| Subheadings | 600 (semibold) | 600 (semibold)    | No change needed                             |
| Body text   | 400 (regular)  | 400 (regular)     | No change needed                             |
| Emphasis    | 600 (semibold) | 500 (medium)      | Subtle emphasis works better                 |

**Implementation**:

```css
/* Default (English) */
h1 {
  font-weight: 700;
}

/* Vietnamese override */
:root[lang='vi'] h1 {
  font-weight: 600;
}
```

## Line Height Optimization

### Recommended Line Heights

| Typography Type | English   | Vietnamese | Difference | Rationale                  |
| --------------- | --------- | ---------- | ---------- | -------------------------- |
| **Headings**    |
| Display (h1)    | 1.2       | 1.3        | +8.3%      | Prevent diacritic clipping |
| Large (h2-h3)   | 1.25-1.33 | 1.35-1.45  | +8-9%      | Extra vertical space       |
| Small (h4-h6)   | 1.4-1.5   | 1.5-1.6    | +7%        | Comfortable spacing        |
| **Body Text**   |
| Large (16px)    | 1.5       | 1.625      | +8.3%      | Optimal readability        |
| Default (14px)  | 1.43      | 1.5        | +5%        | Minimum safe spacing       |
| Small (12px)    | 1.33      | 1.43       | +7.5%      | Prevent cramping           |
| **Dense UI**    |
| Table cells     | 1.25      | 1.35       | +8%        | Minimum for data tables    |
| Lists           | 1.5       | 1.625      | +8.3%      | Comfortable list spacing   |

### Line Height Formula

```
Vietnamese Line Height = English Line Height × 1.08
Minimum: English Line Height + 0.1
```

**Example**:

- English h1: 1.2 → Vietnamese h1: 1.2 × 1.08 = 1.296 ≈ 1.3
- English body: 1.43 → Vietnamese body: 1.43 × 1.08 = 1.544 ≈ 1.5

### Implementation Strategy

**Option 1: CSS Custom Properties** (Recommended)

```css
:root {
  --line-height-h1: 1.2;
  --line-height-body: 1.43;
}

:root[lang='vi'] {
  --line-height-h1: 1.3;
  --line-height-body: 1.5;
}

h1 {
  line-height: var(--line-height-h1);
}
```

**Option 2: Component Props**

```tsx
<Heading level={1} lang="vi">
  Tiêu đề tiếng Việt
</Heading>
// Component automatically applies Vietnamese line height
```

**Option 3: Auto-detection**

```tsx
const lang = document.documentElement.lang;
const isVietnamese = lang === 'vi';
const lineHeight = isVietnamese ? 1.3 : 1.2;
```

## Letter Spacing (Tracking)

Vietnamese benefits from slightly increased letter spacing due to diacritics:

| Context   | English          | Vietnamese     | Adjustment |
| --------- | ---------------- | -------------- | ---------- |
| Headings  | -0.025em (tight) | 0em (normal)   | +0.025em   |
| Body text | 0em (normal)     | 0em (normal)   | No change  |
| All caps  | 0.025em (wide)   | 0.05em (wider) | +0.025em   |
| Buttons   | 0em (normal)     | 0em (normal)   | No change  |

**Implementation**:

```css
/* English */
h1 {
  letter-spacing: -0.025em;
}

/* Vietnamese */
:root[lang='vi'] h1 {
  letter-spacing: 0em;
}
```

## Word Breaking & Hyphenation

### Vietnamese Word Structure

Vietnamese is a **monosyllabic language** with space-separated syllables:

- ❌ **Don't hyphenate**: Each syllable is a complete word
- ✅ **Word-wrap**: Break lines at spaces only
- ⚠️ **Long compounds**: Some technical terms combine multiple syllables without spaces

**Examples**:

- "Quản lý công việc" (Workflow management) - 4 syllables, 3 spaces
- "Thông tin liên hệ" (Contact information) - 4 syllables, 3 spaces

### CSS Configuration

```css
.vietnamese-text {
  /* Allow wrapping at word boundaries */
  word-wrap: break-word;
  overflow-wrap: break-word;

  /* Don't hyphenate Vietnamese */
  hyphens: none;

  /* Preserve space behavior */
  white-space: normal;
}

/* For technical terms or URLs */
.vietnamese-text-strict {
  word-break: break-all; /* Only for URLs/codes */
}
```

## Text Alignment

Vietnamese text alignment follows standard practices:

| Context         | Alignment                    | Rationale            |
| --------------- | ---------------------------- | -------------------- |
| Body text       | Left                         | Standard readability |
| Headings        | Left or Center               | Design preference    |
| Numbers/Metrics | Right                        | Easier comparison    |
| Tables          | Left (text), Right (numbers) | Standard convention  |
| Buttons         | Center                       | Visual balance       |

**Special Cases**:

- **Mixed content** (Vietnamese + numbers): Align based on majority content type
- **RTL languages**: Not applicable (Vietnamese is LTR)

## Responsive Typography

### Mobile Optimization (< 768px)

Vietnamese text on mobile requires extra care:

| Adjustment        | English | Vietnamese | Rationale                    |
| ----------------- | ------- | ---------- | ---------------------------- |
| Base font size    | 14px    | 14px       | No change                    |
| Minimum font size | 12px    | 12px       | iOS minimum                  |
| Line height       | +0      | +0.1       | Extra space on small screens |
| Letter spacing    | 0       | 0          | No adjustment needed         |

### Breakpoint Adjustments

```css
/* Mobile (< 768px) */
@media (max-width: 767px) {
  :root[lang='vi'] {
    --line-height-body: 1.5; /* +0.07 from English 1.43 */
  }
}

/* Tablet (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  :root[lang='vi'] {
    --line-height-body: 1.5; /* Same as mobile */
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  :root[lang='vi'] {
    --line-height-body: 1.5; /* Consistent */
    --line-height-h1: 1.3;
  }
}
```

## Accessibility Considerations

### Contrast Requirements

Vietnamese diacritics can reduce perceived contrast:

- **Minimum contrast**: 4.5:1 (WCAG AA for normal text)
- **Large text**: 3:1 (18px+ or 14px+ bold)
- **Vietnamese adjustment**: Test with diacritics, not just base characters

### Font Size Minimums

| Context    | English Minimum | Vietnamese Minimum | Rationale                     |
| ---------- | --------------- | ------------------ | ----------------------------- |
| Body text  | 12px            | 14px               | Diacritics require clarity    |
| Mobile UI  | 14px            | 14px               | iOS accessibility minimum     |
| Desktop UI | 12px            | 12px               | Acceptable with good contrast |

### Screen Reader Support

Vietnamese screen readers (e.g., NVDA, JAWS) require proper HTML lang attribute:

```html
<html lang="vi">
  <p>Nội dung tiếng Việt</p>
</html>

<!-- Or per-element -->
<p lang="vi">Nội dung tiếng Việt</p>
<p lang="en">English content</p>
```

## Testing Checklist

### Character Rendering Tests

Test with these high-complexity strings:

**All diacritics**:

```
àáảãạ ăằắẳẵặ âầấẩẫậ èéẻẽẹ êềếểễệ ìíỉĩị òóỏõọ ôồốổỗộ ơờớởỡợ ùúủũụ ưừứửữự ỳýỷỹỵ
```

**Common words with complex diacritics**:

```
Quản lý, Thông tin, Hệ thống, Cập nhật, Đăng nhập, Tài khoản
```

**Long compounds**:

```
Chức năng quản lý công việc tự động hóa
```

### Visual Regression Tests

- [ ] Diacritics don't clip at any line height
- [ ] No overlap between lines with stacked diacritics (ậ on one line, ô above)
- [ ] Font weight 600 looks balanced (not too heavy)
- [ ] Letter spacing doesn't create gaps
- [ ] All 134 characters render correctly

### Cross-Browser Testing

Test in these browsers (Vietnamese font rendering varies):

| Browser | OS      | Version | Priority |
| ------- | ------- | ------- | -------- |
| Chrome  | macOS   | Latest  | High     |
| Chrome  | Windows | Latest  | High     |
| Safari  | macOS   | Latest  | High     |
| Safari  | iOS     | Latest  | High     |
| Firefox | macOS   | Latest  | Medium   |
| Firefox | Windows | Latest  | Medium   |
| Edge    | Windows | Latest  | Medium   |

### Device Testing

| Device Type   | Screen Size | Font Size | Line Height |
| ------------- | ----------- | --------- | ----------- |
| iPhone SE     | 375px       | 14px      | 1.5 (21px)  |
| iPhone 14 Pro | 393px       | 14px      | 1.5 (21px)  |
| iPad          | 768px       | 14px      | 1.5 (21px)  |
| Desktop       | 1920px      | 14px      | 1.5 (21px)  |

## Implementation Examples

### Component with Vietnamese Support

```tsx
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  lang?: 'en' | 'vi';
}

export function Heading({ level, children, lang }: HeadingProps) {
  const detectedLang = lang || document.documentElement.lang;
  const isVietnamese = detectedLang === 'vi';

  const lineHeightMap = {
    1: isVietnamese ? 1.3 : 1.2,
    2: isVietnamese ? 1.35 : 1.25,
    3: isVietnamese ? 1.4 : 1.33,
    4: isVietnamese ? 1.5 : 1.4,
    5: isVietnamese ? 1.55 : 1.44,
    6: isVietnamese ? 1.6 : 1.5,
  };

  const weightMap = {
    1: isVietnamese ? 600 : 700,
    2: isVietnamese ? 600 : 700,
    3: 600, // Same for both
    4: 600,
    5: 600,
    6: 600,
  };

  return (
    <Component
      as={`h${level}`}
      style={{
        lineHeight: lineHeightMap[level],
        fontWeight: weightMap[level],
      }}
    >
      {children}
    </Component>
  );
}
```

### CSS Design Tokens

```css
:root {
  /* English defaults */
  --font-heading-h1-line-height: 1.2;
  --font-heading-h1-weight: 700;
  --font-heading-h2-line-height: 1.25;
  --font-heading-h2-weight: 700;
  --font-body-line-height: 1.43;
  --font-body-weight: 400;
}

:root[lang='vi'] {
  /* Vietnamese overrides */
  --font-heading-h1-line-height: 1.3;
  --font-heading-h1-weight: 600;
  --font-heading-h2-line-height: 1.35;
  --font-heading-h2-weight: 600;
  --font-body-line-height: 1.5;
  --font-body-weight: 400;
}
```

## Performance Optimization

### Font Subsetting

Reduce font file size by including only Vietnamese + Latin characters:

**Glyphs to include**:

- Latin basic (A-Z, a-z)
- Numbers (0-9)
- Vietnamese diacritics (134 characters)
- Punctuation (common)

**Estimated file size reduction**:

- Full Inter font: ~200KB
- Vietnamese + Latin subset: ~60KB
- Savings: 70%

### Font Loading Strategy

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-vietnamese.woff2') format('woff2');
  font-display: swap; /* Prevent FOIT */
  unicode-range: U+0000-007F, U+0080-00FF, U+0100-017F, U+1E00-1EFF;
}
```

## Common Issues & Solutions

### Issue 1: Diacritics Clipped

**Symptom**: Top of á, ê appears cut off
**Cause**: Line height too small
**Solution**: Increase line height by 10% or add `--font-heading-h1-line-height: 1.3`

### Issue 2: Text Appears Too Heavy

**Symptom**: Vietnamese headings look bolder than English
**Cause**: Diacritics add visual weight
**Solution**: Reduce font-weight from 700 to 600

### Issue 3: Uneven Line Spacing

**Symptom**: Lines with many diacritics have more space
**Cause**: Inconsistent line-height values
**Solution**: Use consistent line-height across all elements

### Issue 4: Poor Mobile Readability

**Symptom**: Text hard to read on small screens
**Cause**: Font size too small or line height too tight
**Solution**: Set minimum font-size: 14px and line-height: 1.5

## Resources

- Vietnamese Typography Standards: https://vietnamesetypography.com/
- Unicode Vietnamese Range: U+1E00–U+1EFF
- Google Fonts Vietnamese Subset: https://fonts.google.com/?subset=vietnamese
- WCAG 2.1 Text Requirements: https://www.w3.org/WAI/WCAG21/quickref/#text

---

**Next Steps**: Apply these specifications in Phase 2 (Design Token System Implementation)
