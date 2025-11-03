# AGENTS.md

## Essential Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                    # Run entire monorepo
pnpm --filter web dev       # Run web app only

# Building
pnpm build                  # Build entire monorepo
pnpm --filter web build     # Build web app only

# Code Quality
pnpm lint                   # Lint entire monorepo
pnpm lint:fix               # Fix linting issues
pnpm --filter web lint       # Lint web app only
pnpm --filter web check-types  # Type check web app
pnpm format                 # Format code with Prettier
```

## Code Style Guidelines

- **Imports**: Use `@workspace/` for packages, `@/` for app src
- **Components**: PascalCase, co-locate in features, export shared from packages/ui
- **Hooks**: camelCase with `use` prefix
- **State**: useState (local), React Query (server), Zustand (global)
- **TypeScript**: Strict mode, full type coverage, interfaces for props
- **Styling**: TailwindCSS utilities + `cn()` helper, follow design system
- **Error Handling**: Centralized in api-error.ts, use React Query error boundaries
- **Testing**: No test framework configured - add tests before implementing
- **Formatting**: 2-space indent, single quotes, trailing commas, Prettier enforced

## Critical Rules

- **Routing**: File-based in `src/routes/`, use `getRouteApi()` for type-safe params
- **State**: Never mix React Query + Zustand for same data
- **E2EE**: Never transmit encryption keys to server
- **Generated Files**: NEVER edit `routeTree.gen.ts`
- **Auth**: All protected routes need `getIsAuthenticated()` in `beforeLoad`
