# Phase 06: shadcn/ui Integration & Styling

**Phase**: 06/08 | **Duration**: 2h | **Status**: ⏸️ Pending | **Depends on**: Phase 03

## Overview

Integrate Yoopta Editor with Beqeek design system (shadcn/ui components, design tokens, TailwindCSS v4).

## Tasks

### 1. Typography Components

Already done in Phase 03 via `.extend()` pattern:

- ✅ Paragraph → TypographyP
- ✅ H1/H2/H3 → TypographyH1/H2/H3
- ✅ Blockquote → TypographyBlockquote

Additional components needed:

- Lists → Use default Yoopta styles
- Code blocks → Apply `bg-muted` token
- Tables → Apply `border-border` token

### 2. Design Token Integration

Update `/packages/beqeek-editor/src/document-editor/DocumentEditor.tsx`:

```typescript
className={cn(
  'prose prose-slate dark:prose-invert max-w-none',
  'bg-background text-foreground',
  '[&_.yoopta-code]:bg-muted [&_.yoopta-code]:border-border',
  '[&_.yoopta-table]:border-border',
  '[&_.yoopta-callout]:border-border',
  className
)}
```

### 3. Dark Mode Support

Verify all plugins work in dark mode:

- Code blocks (syntax highlighting colors)
- Tables (border colors)
- Callouts (background colors)
- Toolbar (button colors)

### 4. Mobile Responsiveness

- Toolbar positioning on mobile
- Touch targets (min 44x44px)
- Font sizes (responsive scale)
- Padding/margins (mobile-first)

## Testing

- [ ] Light mode: all plugins styled correctly
- [ ] Dark mode: all plugins styled correctly
- [ ] Mobile (375px): toolbar usable
- [ ] Tablet (768px): layout optimal
- [ ] Desktop (1440px): max-width applied
- [ ] Design tokens used (no hardcoded colors)
- [ ] Matches Beqeek design system

## Success Criteria

✅ All plugins use design tokens, dark mode works, mobile responsive

→ Next: [Phase 07: Testing & Validation](./phase-07-testing-validation.md)
