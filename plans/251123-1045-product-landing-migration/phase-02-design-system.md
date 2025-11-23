# Phase 2: Design System Integration

**Parent:** [plan.md](./plan.md)
**Dependencies:** [Phase 1](./phase-01-app-scaffold.md)
**Docs:** [Design Guidelines](../../docs/design-guidelines.md)

---

## Overview

| Field                 | Value                                                        |
| --------------------- | ------------------------------------------------------------ |
| Date                  | 2025-11-23                                                   |
| Description           | Integrate Beqeek design system + landing-specific dark theme |
| Priority              | High                                                         |
| Implementation Status | Pending                                                      |
| Review Status         | Not Started                                                  |

## Key Insights

- Current HTML uses CDN Tailwind with custom config - needs migration to TailwindCSS v4
- Login page uses design tokens (`accent-blue`, `accent-teal`) - landing should match
- Landing is dark-only; can simplify by hardcoding `class="dark"` on html
- Custom animations (float, pulse-slow, scroll) need porting

## Requirements

1. Map HTML's custom colors to design tokens
2. Port glassmorphism utilities to Tailwind classes
3. Port custom animations
4. Ensure Vietnamese typography tokens apply
5. Create shared landing-specific styles

## Architecture

### Color Mapping

| HTML Custom                 | Design Token Equivalent             |
| --------------------------- | ----------------------------------- |
| `background: #0B0F19`       | Dark mode `--background` (adjust)   |
| `surface: #111623`          | Dark mode `--card`                  |
| `surfaceHighlight: #1A202F` | Dark mode `--accent`                |
| `primary: #3b82f6`          | `--accent-blue` / `--brand-primary` |
| `accent.purple: #8b5cf6`    | `--accent-purple`                   |
| `accent.teal: #14b8a6`      | `--accent-teal`                     |
| `accent.red: #ef4444`       | `--destructive`                     |
| `accent.orange: #f97316`    | `--accent-orange`                   |

### Custom CSS Variables for Landing

```css
:root {
  /* Landing-specific dark theme */
  --landing-bg: hsl(222 47% 7%); /* #0B0F19 equivalent */
  --landing-surface: hsl(222 37% 10%); /* #111623 equivalent */
  --landing-surface-highlight: hsl(222 27% 14%); /* #1A202F */
  --landing-border: rgba(255, 255, 255, 0.08);
  --landing-border-hover: rgba(255, 255, 255, 0.15);
}
```

## Related Code Files

- `packages/ui/src/styles/globals.css` - design tokens (lines 14-462)
- `apps/web/src/features/auth/pages/login-page.tsx` - login styling reference
- `apps/product-page/index.html` - source styles (lines 70-118)

## Implementation Steps

### 2.1 Create landing-specific CSS

```css
/* apps/landing/src/styles/landing.css */
@import '@workspace/ui/globals.css';

/* Landing-specific variables */
:root {
  --landing-bg: hsl(222 47% 7%);
  --landing-surface: hsl(222 37% 10%);
  --landing-surface-highlight: hsl(222 27% 14%);
  --landing-border: rgba(255, 255, 255, 0.08);
  --landing-border-hover: rgba(255, 255, 255, 0.15);
}

/* Force dark mode */
html {
  color-scheme: dark;
}

body {
  background-color: var(--landing-bg);
  color: hsl(210 40% 98%);
  overflow-x: hidden;
  font-family: 'Plus Jakarta Sans', var(--font-family-sans);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--landing-bg);
}
::-webkit-scrollbar-thumb {
  background: hsl(215 19% 35%);
  border-radius: 3px;
}

/* Glassmorphism */
.glass {
  background: rgba(17, 22, 35, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid var(--landing-border);
}
.glass:hover {
  background: rgba(26, 32, 47, 0.8);
  border-color: var(--landing-border-hover);
}

/* Text glow effect */
.text-glow {
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
}

/* Grid background pattern */
.bg-grid {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
}

/* Marquee mask */
.marquee-container {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

### 2.2 Add custom animations

```css
/* apps/landing/src/styles/animations.css */

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-scroll {
  animation: scroll 20s linear infinite;
}
```

### 2.3 Add Plus Jakarta Sans font

```html
<!-- In index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

### 2.4 Create utility components

```typescript
// apps/landing/src/components/ui/glass-card.tsx
import { cn } from '@workspace/ui/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div className={cn('glass rounded-2xl', className)} {...props}>
      {children}
    </div>
  );
}
```

### 2.5 Update index.css imports

```css
/* apps/landing/src/styles/index.css */
@import './landing.css';
@import './animations.css';
```

## Todo List

- [ ] Create landing.css with custom variables
- [ ] Create animations.css with keyframes
- [ ] Add Plus Jakarta Sans font to index.html
- [ ] Create GlassCard component
- [ ] Verify design tokens load correctly
- [ ] Test dark mode styling
- [ ] Check Vietnamese typography settings

## Success Criteria

- [ ] Colors match original HTML landing page
- [ ] Glassmorphism effect renders correctly
- [ ] Animations work smoothly
- [ ] Font loads and applies
- [ ] Design tokens from ui package accessible

## Risk Assessment

| Risk                      | Likelihood | Impact | Mitigation                        |
| ------------------------- | ---------- | ------ | --------------------------------- |
| CSS specificity conflicts | Medium     | Medium | Use landing.css after globals.css |
| Font loading delays       | Low        | Low    | Use font-display: swap            |
| Animation performance     | Low        | Medium | Use transform, will-change        |

## Security Considerations

- External font loading uses preconnect for performance
- No user data exposed in styling

## Next Steps

After Phase 2 complete → [Phase 3: Component Migration](./phase-03-component-migration.md)
