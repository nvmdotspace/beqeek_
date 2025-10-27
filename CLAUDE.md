# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Install dependencies (required first)
pnpm install

# Run entire monorepo (recommended - includes i18n compilation)
pnpm dev

# Run specific app with custom host
pnpm --filter web dev
pnpm --filter web dev -- --host 127.0.0.1

# Dev server runs on localhost:4173
```

### Building
```bash
# Build entire monorepo (compiles i18n + packages + apps)
pnpm build

# Build specific app and its dependencies
pnpm --filter web build

# Build specific packages
pnpm --filter @workspace/ui build
pnpm --filter @workspace/active-tables-core build

# Production build
NODE_ENV=production pnpm build

# Preview production build
pnpm --filter web preview
```

### Code Quality
```bash
# Lint entire monorepo
pnpm lint

# Lint specific app
pnpm --filter web lint

# Type check
pnpm --filter web check-types

# Format code (Prettier)
pnpm format
```

### UI Components
```bash
# Add shadcn/ui component (auto-syncs to packages/ui)
pnpm dlx shadcn@latest add button -c apps/web
```

### Internationalization
```bash
# Machine translate i18n messages
pnpm machine-translate
```

## Architecture Overview

**Beqeek** is a workflow automation platform built as a Turborepo monorepo with PNPM workspaces.

### Tech Stack
- **Frontend**: React 19 + Vite 6 + TanStack (Router, Query, Form, Table)
- **Styling**: TailwindCSS v4 + shadcn/ui + Radix UI
- **State**: Zustand (global) + React Query (server) + useState (local)
- **i18n**: Paraglide.js with Vietnamese (default) and English
- **Type Safety**: TypeScript 5.9 strict mode
- **API**: Axios with centralized error handling
- **Build**: Turborepo with dependency-aware task pipelines

### Monorepo Structure

```
apps/
├── web/           Main React application (Vite + React 19)
│   ├── src/
│   │   ├── features/      Feature modules (auth, workspace, active-tables, workflows, etc.)
│   │   ├── routes/        Route layouts (RootLayout with sidebar)
│   │   ├── components/    Shared components (error boundaries, loading states)
│   │   ├── stores/        Zustand stores (sidebar, language, auth)
│   │   ├── shared/        API clients, query client, utilities
│   │   ├── hooks/         Custom React hooks
│   │   ├── providers/     React context providers
│   │   └── router.tsx     TanStack Router configuration
│   └── vite.config.ts

packages/
├── ui/                         Component library
│   ├── src/components/         shadcn/ui components
│   ├── src/styles/globals.css  TailwindCSS v4 styles
│   └── postcss.config.mjs
├── active-tables-core/         Core Active Tables logic (TypeScript only)
├── active-tables-hooks/        React hooks for Active Tables
├── encryption-core/            E2EE utilities (AES-256, OPE, HMAC-SHA256)
├── eslint-config/             Shared ESLint rules
└── typescript-config/         Shared TypeScript configs
```

### Web App Architecture

**Entry**: `src/main.tsx` → `AppProviders` → `RouterProvider` with lazy-loaded routes

**Routing**: TanStack Router with auth guards, lazy loading, and locale support
- Routes: `src/router.tsx` (programmatic) - NOT file-based routing
- Locale patterns: `/` (vi default) and `/$locale` prefix for other languages
- Auth guards in `beforeLoad` using `getIsAuthenticated()` from `src/features/auth`

**i18n**: Paraglide plugin in Vite config
- Messages in `messages/` directory → compiled to `src/paraglide/generated`
- Supports: `vi` (default), `en`
- Strategy: URL → cookie → preferredLanguage → localStorage → baseLocale

**State Management Philosophy** (CRITICAL):

1. **Local State (useState)** - UI-only state, form inputs, modals, toggles
2. **Server State (React Query)** - API data, caching, mutations, invalidation
3. **Global State (Zustand)** - User preferences, auth, theme, sidebar, language

**Anti-patterns:**
- ❌ Never use Zustand for server data (use React Query)
- ❌ Never use useState for global preferences (use Zustand)
- ❌ Never use local state for API data (use React Query)

## Core Features

### Active Tables
**Purpose**: Configurable workflow data tables with schemas, E2EE, and record management

**Key Concepts**:
- Tables have metadata, schema (fields with types/constraints), and optional E2EE
- Field types: SHORT_TEXT, RICH_TEXT, INTEGER, NUMERIC, DATE, DATETIME, SELECT_ONE, SELECT_LIST, etc.
- **E2EE**: 32-char encryption key stored locally (never sent to server), encryptionAuthKey (SHA256) stored on server
- Encryption types:
  - AES-256-CBC for text fields (random IV prepended)
  - OPE (Order-Preserving Encryption) for numbers/dates (enables range queries)
  - HMAC-SHA256 for selects (enables equality checks)

**API Pattern**: POST-based RPC (`/api/workspace/{workspaceId}/workflow/{verb}/active_tables`)
- Full spec in `docs/swagger.yaml`
- Client in `apps/web/src/shared/api/active-tables-client.ts`

**Pages**:
- `/workspaces/tables` - List all tables
- `/workspaces/tables/$tableId` - Table configuration/schema editor
- `/workspaces/tables/$tableId/records` - Record management with kanban, comments, inline editing

### Feature Organization

Each feature in `apps/web/src/features/{feature}/` contains:
- `pages/` - Page components
- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `stores/` - Feature-specific Zustand stores (if needed)
- `types.ts` - Feature types
- `api.ts` - Feature API client (if needed)

**Existing features**: auth, workspace, active-tables, workflows, team, roles, analytics, encryption, organization, notifications, search, support

## Package Details

### @workspace/ui
Component library with TailwindCSS v4 and Radix UI primitives.

```tsx
// Import global styles (in main.tsx)
import "@workspace/ui/globals.css"

// Import components
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"  // Tailwind class merger
```

Exports via `package.json` exports field:
- `@workspace/ui/globals.css` → styles
- `@workspace/ui/components/*` → individual components
- `@workspace/ui/lib/*` → utilities
- `@workspace/ui/hooks/*` → hooks

### @workspace/active-tables-core
TypeScript-only package (no React) for table models, types, validators.
Depends on `@workspace/encryption-core`.

### @workspace/active-tables-hooks
React Query hooks and Zustand stores for Active Tables.
Depends on `active-tables-core` and `encryption-core`.

### @workspace/encryption-core
Client-side E2EE implementation using crypto-js.
- Keys stored locally, NEVER transmitted to server
- Handles AES-256, OPE, HMAC-SHA256 encryption

## Development Guidelines

### State Management Checklist

Before implementing features, answer:
1. **Data source?** API → React Query | User input → Local | Config → Global
2. **Scope?** Single component → Local | Many components → Global
3. **Persist?** No → Local | Yes → Global/React Query
4. **Complexity?** Simple → Local | Multiple related → Global | Server sync → React Query

Use selectors to prevent re-renders:
```tsx
// ✅ Good
const user = useAuthStore((state) => state.user);

// ❌ Bad
const authState = useAuthStore();  // Subscribes to entire store
```

### Design System Compliance (MANDATORY)

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

### Component Development

- **Naming**: PascalCase for components, camelCase for hooks (prefix `use`)
- **Co-location**: Feature-specific components in `apps/web/src/features/{feature}/`
- **TypeScript**: Full type coverage, interfaces for props with JSDoc
- **Styling**: TailwindCSS utilities + `cn()` for conditional classes
- **Reusability**: Export shared components from `packages/ui`

### API Integration

**Base client**: `apps/web/src/shared/api/http-client.ts` (Axios)
- Centralized error handling in `api-error.ts`
- React Query setup in `shared/query-client.ts`
- Feature-specific clients in feature directories

**Authentication**:
- Managed via `getIsAuthenticated()` helper
- Router guards check auth in `beforeLoad` hooks
- Workspace context required for most routes

### Encryption Handling

For E2EE Active Tables:
- Encryption key stored in localStorage (32 chars)
- **NEVER** send `encryptionKey` to server in mutations
- Encrypt client-side before API calls
- Decrypt after retrieval
- Use `@workspace/encryption-core` utilities
- Warn users about key backup/loss

### Build Configuration

**Vite** (`apps/web/vite.config.ts`):
- Manual chunk splitting: react, radix, tanstack, icons, vendor
- Paraglide i18n plugin
- Path alias: `@` → `src`
- Dev server: localhost:4173

**Turbo** (`turbo.json`):
- `build` depends on `^build` (builds dependencies first)
- `dev` is persistent and uncached
- `lint`, `check-types` depend on upstream tasks

## Common Pitfalls

1. **Packages not updating**: Run `pnpm build` from root to rebuild packages
2. **Import paths**: Use `@workspace/` for packages, `@/` for app src
3. **State duplication**: Single source of truth (don't mix React Query + Zustand for same data)
4. **Missing auth guards**: All authenticated routes need `getIsAuthenticated()` in `beforeLoad`
5. **Encryption key exposure**: Never log or transmit encryption keys
6. **Design violations**: Check `docs/design-system.md` before UI changes
7. **Locale fallback**: Unsupported locales fallback to `vi`
8. **Router is programmatic**: Routes defined in `src/router.tsx`, NOT file-based in `src/routes/`

## Code Quality Standards

- **Prettier**: 2-space indent, double-quoted JSX props
- **ESLint**: Shared config from `@workspace/eslint-config`
- **TypeScript**: Strict mode, no implicit any
- **Pre-PR**: Run `pnpm lint` and `pnpm build` locally
- **Commits**: Imperative mood, optional scope prefix (`feat:`, `fix:`, `chore:`)

## Documentation

- **API Spec**: `docs/swagger.yaml` (OpenAPI 3.0.3)
- **Design System**: `docs/design-system.md`
- **Feature Specs**: `docs/feature-*.md` (auth, workspaces, active-tables, workflows)
- **Guidelines**: `AGENTS.md` (comprehensive dev guidelines)
- **Deployment**: `DEPLOYMENT.md`

## Environment

- **Node.js**: >=22
- **PNPM**: 10.x
- **Platform**: macOS, Linux, Windows (WSL recommended)