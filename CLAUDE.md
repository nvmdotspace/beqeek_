# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Turborepo monorepo using:
- **Vite + React 19** web application in `apps/web`
- **shadcn/ui + TailwindCSS v4** component library in `packages/ui`
- **TanStack Router** for file-based routing with devtools
- **TanStack Query** for server state management with devtools
- **pnpm** as package manager with workspace configuration

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (runs on port 3000)
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Format code
pnpm format

# Type checking in individual packages
pnpm --filter web check-types
```

## Key Technologies & Patterns

### Web App (`apps/web`)
- Uses **Vite** instead of Next.js (despite AGENTS.md references)
- **TanStack Router** with file-based routing in `src/routes/`
- **TanStack Query** for data fetching
- **shadcn/ui** components imported from `@workspace/ui`
- Path alias `@/` maps to `src/`

### UI Package (`packages/ui`)
- Reusable React components with **TailwindCSS v4**
- **Radix UI** primitives for accessible components
- **class-variance-authority** for component variants
- **tailwind-merge** for className merging
- **lucide-react** for icons

### Adding Components

Use shadcn CLI from the web app directory:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components/` and exported through the package's barrel exports.

### Import Patterns

```tsx
// UI components
import { Button } from '@workspace/ui/components/ui/button';

// App routing
import { createFileRoute } from '@tanstack/react-router';

// Data fetching
import { useQuery } from '@tanstack/react-query';
```

## File Structure Notes

- `apps/web/src/routes/` - TanStack Router file-based routes
- `apps/web/src/providers/` - React context providers (theme, app providers)
- `packages/ui/src/components/` - Reusable UI components
- `packages/ui/src/styles/globals.css` - Global TailwindCSS styles
- Shared configs in `packages/eslint-config/` and `packages/typescript-config/`

## Testing

No test runner currently configured. When adding tests, prefer Vitest + Testing Library and register in `turbo.json`.

## Important Details

- Uses **Node 22+** (specified in engines)
- **TailwindCSS v4** with PostCSS integration
- Component library exports structured for tree-shaking
- Strict TypeScript configuration shared across packages
- Dev tools available for both Router and Query in development