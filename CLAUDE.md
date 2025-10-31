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
│   │   ├── routes/        File-based routes (TanStack Router)
│   │   ├── components/    Shared components (error boundaries, loading states)
│   │   ├── stores/        Zustand stores (sidebar, language, auth)
│   │   ├── shared/        API clients, query client, utilities
│   │   ├── hooks/         Custom React hooks
│   │   ├── providers/     React context providers
│   │   ├── main.tsx       App entry point with router setup
│   │   └── routeTree.gen.ts  Auto-generated route tree (DO NOT EDIT)
│   └── vite.config.ts

packages/
├── ui/                         Component library
│   ├── src/components/         shadcn/ui components
│   ├── src/styles/globals.css  TailwindCSS v4 styles
│   └── postcss.config.mjs
├── active-tables-core/         Core Active Tables logic with React components & Zustand stores
├── beqeek-shared/              Shared types, constants, and validators (TypeScript only)
├── encryption-core/            E2EE utilities (AES-256, OPE, HMAC-SHA256)
├── eslint-config/             Shared ESLint rules
└── typescript-config/         Shared TypeScript configs
```

### Web App Architecture

**Entry**: `src/main.tsx` → `AppProviders` → `RouterProvider` with lazy-loaded routes

**Routing**: TanStack Router v1.133+ with **FILE-BASED routing**
- **Route Files**: `src/routes/**/*.tsx` - File structure defines URL structure
- **Generated Tree**: `src/routeTree.gen.ts` - Auto-generated (DO NOT EDIT, in `.gitignore`)
- **Plugin**: `@tanstack/router-plugin/vite` in `vite.config.ts` generates routes on save
- **Locale patterns**: `/` (vi default) and `/$locale` prefix for other languages
- **Auth guards**: `beforeLoad` hook using `getIsAuthenticated()` from `src/features/auth`
- **Lazy loading**: Automatic code-splitting with `autoCodeSplitting: true`

**Route Structure**:
```
src/routes/
├── __root.tsx                              # Root layout with RootLayout component
├── index.tsx                               # / - Redirect to locale
├── $.tsx                                   # 404 catch-all route
├── $locale.tsx                             # Layout for /$locale routes
├── $locale/
│   ├── index.tsx                           # /$locale - Redirect based on auth
│   ├── login.tsx                           # /$locale/login
│   ├── workspaces.tsx                      # /$locale/workspaces
│   ├── workspaces/
│   │   └── $workspaceId/
│   │       ├── tables.tsx                  # Tables list
│   │       ├── tables/
│   │       │   └── $tableId/
│   │       │       ├── index.tsx           # Table detail
│   │       │       ├── records.tsx         # Records page
│   │       │       └── settings.tsx        # Settings page
│   │       ├── workflows.tsx
│   │       ├── team.tsx
│   │       ├── roles.tsx
│   │       ├── analytics.tsx
│   │       ├── starred.tsx
│   │       ├── recent-activity.tsx
│   │       └── archived.tsx
│   ├── notifications.tsx                   # Global routes
│   ├── search.tsx
│   └── help.tsx
```

**Creating New Routes**:
1. Create file in `src/routes/` following naming convention
2. Use `createFileRoute()` from `@tanstack/react-router`
3. Export `Route` constant with component and options
4. Plugin auto-generates `routeTree.gen.ts` on save
5. Use `useRouter()` hook to access router instance (NOT a global import)

**Example Route File**:
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const MyPageLazy = lazy(() => import('@/features/my-feature/pages/my-page'));

export const Route = createFileRoute('/$locale/my-route')({
  component: MyComponent,
  beforeLoad: ({ params }) => {
    // Auth guards, redirects, etc.
  },
});

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPageLazy />
    </Suspense>
  );
}
```

**Accessing Route Params (REQUIRED PATTERN)**:

Use `getRouteApi()` with centralized route constants for type-safe param extraction:

```tsx
// ✅ CORRECT: Type-safe constants + getRouteApi()
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export function MyPage() {
  const { tableId, workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // Navigate using constants - prevents typos!
  navigate({
    to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
    params: { locale, workspaceId, tableId },
  });
}
```

```tsx
// ❌ WRONG: Hardcoded paths + type assertions
import { useParams } from '@tanstack/react-router';

const route = getRouteApi('/$locale/workspaces/$workspaceId/tables/$tableId'); // Typo-prone!
const params = useParams({ from: '...' });
const tableId = (params as any).tableId as string; // Loses type safety!
```

**Route Constants** ([route-paths.ts](apps/web/src/shared/route-paths.ts)):
```tsx
ROUTES.ACTIVE_TABLES.LIST          // /$locale/workspaces/$workspaceId/tables
ROUTES.ACTIVE_TABLES.TABLE_DETAIL  // /$locale/workspaces/$workspaceId/tables/$tableId
ROUTES.ACTIVE_TABLES.TABLE_RECORDS // /$locale/workspaces/$workspaceId/tables/$tableId/records
ROUTES.ACTIVE_TABLES.TABLE_SETTINGS// /$locale/workspaces/$workspaceId/tables/$tableId/settings
ROUTES.WORKSPACE.*                 // Workspace feature routes
ROUTES.LOGIN, ROUTES.WORKSPACES    // Auth routes
```

**Benefits:**
- ✅ Full TypeScript inference from route definitions
- ✅ Single source of truth for all routes
- ✅ Zero maintenance when routes change
- ✅ Auto-completion prevents typos
- ✅ Compile-time route path validation
- ✅ Works perfectly with code splitting

See [route-helpers.md](apps/web/src/shared/route-helpers.md) for detailed patterns.

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
Package containing Active Tables models, types, validators, React components (Quill editor), and Zustand stores.
Depends on `@workspace/encryption-core` and `@workspace/beqeek-shared`.
Peer dependencies: `react`, `react-dom`, `@tanstack/react-table` (must be provided by consumer).

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
8. **File-based routing**: Routes are files in `src/routes/`, NOT `src/router.tsx` (deleted)
9. **Generated files**: NEVER edit `routeTree.gen.ts` - auto-generated by TanStack Router plugin
10. **Router instance**: Use `useRouter()` hook, NOT a global `router` import
11. **Route naming**: `$` for params, `_` prefix for pathless layouts, `$.tsx` for catch-all/404
12. **Route params**: ALWAYS use `getRouteApi()` for type-safe params, NEVER use `useParams({ from: '...' })` with type assertions

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