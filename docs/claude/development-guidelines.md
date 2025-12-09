# Development Guidelines

## Design System Compliance (MANDATORY)

All UI changes MUST follow `docs/design-system.md`:

- Use CSS custom properties for colors, spacing, typography
- Mobile-first responsive design with defined breakpoints
- WCAG 2.1 AA accessibility (ARIA, keyboard nav, screen readers)
- TypeScript strict typing for all components
- Vietnamese typography optimization
- Dark mode support

**Workflow**:

1. Check `packages/ui/` for existing components
2. Follow existing patterns and naming conventions
3. Use design tokens (CSS variables) not hardcoded values
4. Implement mobile-first with defined breakpoints
5. Include accessibility features

## Component Development

- **Naming**: PascalCase for components, camelCase for hooks (prefix `use`)
- **Co-location**: Feature-specific components in `apps/web/src/features/{feature}/`
- **TypeScript**: Full type coverage, interfaces for props with JSDoc
- **Styling**: TailwindCSS utilities + `cn()` for conditional classes
- **Reusability**: Export shared components from `packages/ui`

## Input Styling Standards (MANDATORY)

All input components MUST use design tokens for consistent appearance:

**Standard Input Classes:**

```tsx
// Base input styling
border border-input rounded-md
bg-background text-foreground
transition-all
placeholder:text-muted-foreground

// Focus state (consistent across all inputs)
focus-visible:outline-none
focus-visible:ring-1
focus-visible:ring-inset
focus-visible:ring-ring

// Error state
aria-invalid:border-destructive

// Disabled state
disabled:cursor-not-allowed
disabled:opacity-50
```

**NEVER use hardcoded colors:**

- ❌ `border-gray-300`, `bg-gray-100`, `text-gray-400`
- ❌ `focus:ring-blue-500`, `border-red-500`
- ✅ Use design tokens that respect theme

## API Integration

**Base client**: `apps/web/src/shared/api/http-client.ts` (Axios)

- Centralized error handling in `api-error.ts`
- React Query setup in `shared/query-client.ts`
- Feature-specific clients in feature directories

**Authentication**:

- Managed via `getIsAuthenticated()` helper
- Router guards check auth in `beforeLoad` hooks
- Workspace context required for most routes

## Encryption Handling

For E2EE Active Tables:

- Encryption key stored in localStorage (32 chars)
- **NEVER** send `encryptionKey` to server in mutations
- Encrypt client-side before API calls
- Decrypt after retrieval
- Use `@workspace/encryption-core` utilities
- Warn users about key backup/loss

## Build Configuration

**Vite** (`apps/web/vite.config.ts`):

- Manual chunk splitting: react, radix, tanstack, icons, vendor
- Paraglide i18n plugin
- Path alias: `@` → `src`
- Dev server: localhost:4173

**Turbo** (`turbo.json`):

- `build` depends on `^build` (builds dependencies first)
- `dev` is persistent and uncached
- `lint`, `check-types` depend on upstream tasks
