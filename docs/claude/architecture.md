# Architecture Overview

**Beqeek** is a workflow automation platform built as a Turborepo monorepo with PNPM workspaces.

## Tech Stack

- **Frontend**: React 19 + Vite 6 + TanStack (Router, Query, Form, Table)
- **Styling**: TailwindCSS v4 + shadcn/ui + Radix UI
- **State**: Zustand (global) + React Query (server) + useState (local)
- **i18n**: Paraglide.js with Vietnamese (default) and English
- **Type Safety**: TypeScript 5.9 strict mode
- **API**: Axios with centralized error handling
- **Build**: Turborepo with dependency-aware task pipelines

## Monorepo Structure

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
├── ui/                         Component library (shadcn/ui + Radix UI)
├── active-tables-core/         Core Active Tables logic with React components & Zustand stores
├── beqeek-shared/              Shared types, constants, and validators (TypeScript only)
├── encryption-core/            E2EE utilities (AES-256, OPE, HMAC-SHA256)
├── eslint-config/             Shared ESLint rules
└── typescript-config/         Shared TypeScript configs
```

## Web App Architecture

**Entry**: `src/main.tsx` → `AppProviders` → `RouterProvider` with lazy-loaded routes

**i18n**: Paraglide plugin in Vite config

- Messages in `messages/` directory → compiled to `src/paraglide/generated`
- Supports: `vi` (default), `en`
- Strategy: URL → cookie → preferredLanguage → localStorage → baseLocale

## Feature Organization

Each feature in `apps/web/src/features/{feature}/` contains:

- `pages/` - Page components
- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `stores/` - Feature-specific Zustand stores (if needed)
- `types.ts` - Feature types
- `api.ts` - Feature API client (if needed)

**Existing features**: auth, workspace, active-tables, workflows, team, roles, analytics, encryption, organization, notifications, search, support

## Core Features

### Active Tables

**Purpose**: Configurable workflow data tables with schemas, E2EE, and record management

**Key Concepts**:

- Tables have metadata, schema (fields with types/constraints), and optional E2EE
- Field types: SHORT_TEXT, RICH_TEXT, INTEGER, NUMERIC, DATE, DATETIME, SELECT_ONE, SELECT_LIST, etc.
- **E2EE**: 32-char encryption key stored locally (never sent to server), encryptionAuthKey (SHA256) stored on server

**API Pattern**: POST-based RPC (`/api/workspace/{workspaceId}/workflow/{verb}/active_tables`)

- Full spec in `docs/swagger.yaml`
- Client in `apps/web/src/shared/api/active-tables-client.ts`

**Pages**:

- `/workspaces/tables` - List all tables
- `/workspaces/tables/$tableId` - Table configuration/schema editor
- `/workspaces/tables/$tableId/records` - Record management with kanban, comments, inline editing
