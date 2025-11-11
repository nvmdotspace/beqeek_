# Codebase Summary

## Overview

Beqeek monorepo: **React 19 + Vite + Turborepo** workflow automation platform with client-side E2EE.

**LOC Estimate**: ~50k lines (packages: 15k, apps/web: 35k)
**Languages**: TypeScript (99%), CSS (1%)
**Build Tool**: Turborepo + PNPM workspaces

## Project Statistics

### Apps

| App          | Purpose                | LOC  | Status        |
| ------------ | ---------------------- | ---- | ------------- |
| web          | Main React application | ~35k | ✅ Production |
| admin        | Admin portal           | -    | 📝 Planned    |
| product-page | Marketing site         | -    | 📝 Planned    |

### Packages

| Package            | Purpose                  | LOC  | Exports                      |
| ------------------ | ------------------------ | ---- | ---------------------------- |
| ui                 | shadcn/ui components     | ~8k  | 45+ components               |
| active-tables-core | Core Active Tables logic | ~4k  | Components, hooks, stores    |
| beqeek-shared      | Constants & types        | ~2k  | 35 table configs, validators |
| encryption-core    | E2EE utilities           | ~1k  | AES, OPE, HMAC               |
| eslint-config      | Linting rules            | ~200 | 3 configs                    |
| typescript-config  | TS configs               | ~100 | 3 configs                    |

## Directory Structure

```
beqeek/                              (~50k LOC)
├── apps/
│   └── web/                         (~35k LOC)
│       ├── src/
│       │   ├── features/            (~20k LOC, 12 features)
│       │   │   ├── active-tables/   (~8k) - Tables, records, kanban, gantt
│       │   │   ├── auth/            (~2k) - Login, logout, auth store
│       │   │   ├── workspace/       (~3k) - Workspace management
│       │   │   ├── team/            (~2k) - Team collaboration
│       │   │   ├── roles/           (~1.5k) - Role management
│       │   │   ├── analytics/       (~1k) - Usage metrics
│       │   │   ├── workflows/       (~500) - Workflow automation (WIP)
│       │   │   ├── notifications/   (~500) - Notifications
│       │   │   ├── search/          (~400) - Global search
│       │   │   ├── support/         (~300) - Help & support
│       │   │   ├── organization/    (~300) - Org settings
│       │   │   └── workspace-users/ (~500) - User management
│       │   │
│       │   ├── routes/              (~3k LOC, 25+ routes)
│       │   │   ├── __root.tsx       - Root layout
│       │   │   ├── $locale.tsx      - Locale wrapper
│       │   │   └── $locale/         - Locale-specific routes
│       │   │       ├── login.tsx
│       │   │       ├── workspaces.tsx
│       │   │       └── workspaces/
│       │   │           └── $workspaceId/
│       │   │               ├── tables.tsx
│       │   │               ├── tables/
│       │   │               │   └── $tableId/
│       │   │               │       ├── index.tsx
│       │   │               │       ├── records.tsx
│       │   │               │       └── settings.tsx
│       │   │               ├── workflows.tsx
│       │   │               ├── team.tsx
│       │   │               ├── roles.tsx
│       │   │               └── analytics.tsx
│       │   │
│       │   ├── components/          (~2k LOC)
│       │   │   ├── layout/          - Layout components
│       │   │   ├── error-boundary/  - Error handling
│       │   │   └── loading/         - Loading states
│       │   │
│       │   ├── stores/              (~1.5k LOC)
│       │   │   ├── auth-store.ts    - Authentication state
│       │   │   ├── sidebar-store.ts - Sidebar state
│       │   │   └── language-store.ts - i18n state
│       │   │
│       │   ├── shared/              (~3k LOC)
│       │   │   ├── api/             - API clients (http-client, api-error)
│       │   │   ├── query-client.ts  - React Query config
│       │   │   ├── route-paths.ts   - Route constants
│       │   │   └── utils/           - Shared utilities
│       │   │
│       │   ├── hooks/               (~1k LOC)
│       │   │   ├── use-auth.ts
│       │   │   └── use-workspace.ts
│       │   │
│       │   ├── providers/           (~500 LOC)
│       │   │   ├── app-providers.tsx
│       │   │   └── theme-provider.tsx
│       │   │
│       │   ├── main.tsx             - App entry point
│       │   └── routeTree.gen.ts     - Auto-generated (gitignored)
│       │
│       ├── public/                  - Static assets
│       ├── vite.config.ts           - Vite configuration
│       └── package.json
│
├── packages/
│   ├── ui/                          (~8k LOC)
│   │   ├── src/
│   │   │   ├── components/          - 45+ shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   └── utils.ts         - cn() utility
│   │   │   └── styles/
│   │   │       └── globals.css      - TailwindCSS v4 styles
│   │   ├── components.json
│   │   └── postcss.config.mjs
│   │
│   ├── active-tables-core/          (~4k LOC)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── fields/          - 25+ field renderers
│   │       │   ├── record-list/     - List view layouts
│   │       │   ├── record-detail/   - Detail view layouts
│   │       │   ├── kanban/          - Kanban board
│   │       │   ├── gantt/           - Gantt chart
│   │       │   └── states/          - Loading/error/empty
│   │       ├── hooks/               - useActiveTable, usePermissions, etc.
│   │       ├── stores/              - Zustand stores
│   │       └── utils/               - Utilities
│   │
│   ├── beqeek-shared/               (~2k LOC)
│   │   └── src/
│   │       ├── constants/
│   │       │   ├── field-types.ts   - 25+ field type constants
│   │       │   ├── action-types.ts  - Action type constants
│   │       │   ├── permissions.ts   - Permission arrays
│   │       │   ├── layouts.ts       - Layout constants
│   │       │   └── table-types.ts   - 35 table type constants
│   │       ├── configs/             - 35 table configs
│   │       ├── types/               - Shared types
│   │       └── validators/          - Validation helpers
│   │
│   ├── encryption-core/             (~1k LOC)
│   │   └── src/
│   │       ├── aes.ts               - AES-256-CBC encryption
│   │       ├── ope.ts               - Order-preserving encryption
│   │       ├── hmac.ts              - HMAC-SHA256
│   │       └── utils.ts             - Key generation
│   │
│   ├── eslint-config/               (~200 LOC)
│   │   ├── base.js
│   │   ├── next.js
│   │   └── react-internal.js
│   │
│   └── typescript-config/           (~100 LOC)
│       ├── base.json
│       ├── nextjs.json
│       └── react-library.json
│
├── docs/                            (~10k LOC markdown)
│   ├── project-overview-pdr.md
│   ├── code-standards.md
│   ├── codebase-summary.md
│   ├── system-architecture.md
│   ├── design-guidelines.md
│   ├── deployment-guide.md
│   ├── project-roadmap.md
│   ├── swagger.yaml                 - API documentation
│   ├── active-tables/               - Feature specs
│   │   ├── kanban-business-analysis.md
│   │   ├── gantt-business-analysis.md
│   │   └── Quick-Filter-Business-Analysis.md
│   └── specs/
│       ├── active-table-config-functional-spec.md
│       ├── encryption-modes-corrected.md
│       └── workflow-*.md
│
├── messages/                        (~2k LOC JSON)
│   ├── vi.json                      - Vietnamese (default)
│   └── en.json                      - English
│
├── .claude/                         - Claude Code workflows
├── project.inlang/                  - Paraglide.js i18n config
├── turbo.json                       - Turborepo config
├── pnpm-workspace.yaml              - PNPM workspace config
├── package.json                     - Root package.json
├── CLAUDE.md                        - Claude Code instructions
└── README.md                        - Project README
```

## Core Features Breakdown

### 1. Active Tables (apps/web/src/features/active-tables, ~8k LOC)

**Purpose**: Configurable workflow data tables with E2EE

**Key Components**:

- `TableList` - Display all tables in workspace
- `TableDetailPage` - Table configuration & schema editor
- `RecordsList` - Display records in table/card layouts
- `RecordDetailPage` - Single record detail with inline editing
- `KanbanView` - Drag-and-drop kanban board
- `GanttView` - Timeline visualization
- `CommentsList` - Comments on records

**Hooks**:

- `useTable` - Fetch table details
- `useRecords` - Fetch/manage records
- `useRecordDetail` - Single record operations
- `useFieldEncryption` - Client-side E2EE

**API Endpoints** (via shared/api/active-tables-client.ts):

- `search/active_tables` - Get tables list
- `get/active_tables` - Get table details
- `create/active_tables` - Create table
- `update/active_tables` - Update table
- `get_active_records` - Get records
- `create_active_records` - Create record
- `update_active_records` - Update record

**Field Types Supported** (25+):

- Text: SHORT_TEXT, TEXT, RICH_TEXT, EMAIL, URL
- Number: INTEGER, NUMERIC
- Date: DATE, DATETIME, TIME, YEAR, MONTH, etc.
- Selection: SELECT_ONE, SELECT_LIST, CHECKBOX_YES_NO, etc.
- Reference: SELECT_ONE_RECORD, SELECT_LIST_RECORD, etc.

### 2. Authentication (apps/web/src/features/auth, ~2k LOC)

**Components**:

- `LoginPage` - Email/password login form
- `AuthGuard` - Route protection

**Stores**:

- `useAuthStore` (Zustand) - User state, token, login/logout

**Hooks**:

- `useAuth` - Access auth state
- `getIsAuthenticated` - Auth check for route guards

### 3. Workspace Management (apps/web/src/features/workspace, ~3k LOC)

**Components**:

- `WorkspaceList` - Display user's workspaces
- `WorkspaceSwitcher` - Quick workspace switcher (sidebar)
- `WorkspaceSettings` - Workspace configuration

**Hooks**:

- `useWorkspaces` - Fetch workspaces list
- `useCurrentWorkspace` - Get current workspace context

### 4. Team & Roles (~3.5k LOC)

**Team** (apps/web/src/features/team):

- User invitations
- Team member management
- Role assignment

**Roles** (apps/web/src/features/roles):

- Role creation/editing
- Permission matrix configuration
- Custom action permissions

### 5. Analytics (apps/web/src/features/analytics, ~1k LOC)

**Components**:

- `UsageMetrics` - Track table/record operations
- `ActivityTimeline` - Recent activity feed

## Technology Stack

### Frontend Dependencies

**Core** (~3.5MB):

- react@19.1.1, react-dom@19.1.1
- typescript@5.9.2
- vite@6.0.3

**Routing & State** (~1.2MB):

- @tanstack/react-router@1.133.36 (file-based routing)
- @tanstack/react-query@5.71.10 (server state)
- @tanstack/react-table@8.21.3 (data tables)
- @tanstack/react-form@1.11.0 (form validation)
- zustand@5.0.1 (client state)
- react-hook-form@7.66.0 (form handling)

**UI** (~2.5MB):

- @radix-ui/\* (40+ primitives for shadcn/ui)
- lucide-react@0.544.0 (icons)
- tailwindcss@4.1.13
- @dnd-kit/core@6.3.1 (drag-and-drop)

**Utilities** (~800KB):

- axios@1.12.2 (HTTP client)
- crypto-js@4.2.0 (encryption)
- date-fns@4.1.0 (date formatting)
- sonner@1.7.4 (toast notifications)

**i18n** (~200KB):

- @inlang/paraglide-js@2.4.0

**Dev Dependencies**:

- @faker-js/faker@10.1.0 (test data)
- @tanstack/react-query-devtools
- @tanstack/react-router-devtools
- eslint@9.36.0
- prettier@3.6.2

### Build Configuration

**Turborepo** (turbo.json):

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Vite** (apps/web/vite.config.ts):

- Manual chunk splitting (react, radix, tanstack, icons, vendor)
- TanStack Router plugin (auto-generates routes)
- Paraglide i18n plugin
- Dev server: localhost:4173

**TypeScript**:

- Strict mode enabled
- Path alias: `@` → `src`
- Project references for packages

## API Architecture

### Pattern

POST-based RPC endpoints:

```
POST /api/workspace/{workspaceId}/workflow/{verb}/active_tables
```

### Client Structure

**Base Client** (apps/web/src/shared/api/http-client.ts):

```typescript
const httpClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 30000,
});

// Interceptors for auth token + error handling
httpClient.interceptors.request.use(addAuthToken);
httpClient.interceptors.response.use(null, handleApiError);
```

**Error Handling** (apps/web/src/shared/api/api-error.ts):

- Centralized error handling
- User-friendly error messages
- Auto-retry logic for network errors

**Feature Clients**:

- `active-tables-client.ts` - Active Tables API
- `workspace-client.ts` - Workspace API
- Each feature has its own client

## State Management

### Philosophy

| State Type | Tool        | Usage Count                        |
| ---------- | ----------- | ---------------------------------- |
| **Local**  | useState    | ~300+ instances                    |
| **Server** | React Query | ~80+ queries, ~40+ mutations       |
| **Global** | Zustand     | 3 stores (auth, sidebar, language) |

### Zustand Stores

1. **Auth Store** (stores/auth-store.ts):

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  logout: () => void;
}
```

2. **Sidebar Store** (stores/sidebar-store.ts):

```typescript
interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}
```

3. **Language Store** (stores/language-store.ts):

```typescript
interface LanguageState {
  locale: 'vi' | 'en';
  setLocale: (locale: 'vi' | 'en') => void;
}
```

### React Query Keys

**Naming Convention**: `['entity', ...identifiers, filters?]`

Examples:

```typescript
['tables', workspaceId][('table', workspaceId, tableId)][('records', tableId, filters)][('record', recordId)][
  ('comments', recordId)
];
```

## Routing

### File-Based Routes (TanStack Router)

**Plugin**: `@tanstack/router-plugin/vite` auto-generates route tree on save

**Route Files** → **URL Paths**:

```
src/routes/
├── __root.tsx              → Root layout (all routes)
├── index.tsx               → / (redirect to /vi or /en)
├── $locale.tsx             → Layout for /$locale routes
└── $locale/
    ├── index.tsx           → /$locale (redirect based on auth)
    ├── login.tsx           → /$locale/login
    ├── workspaces.tsx      → /$locale/workspaces
    └── workspaces/
        └── $workspaceId/
            ├── tables.tsx  → /$locale/workspaces/:workspaceId/tables
            └── tables/
                └── $tableId/
                    ├── index.tsx → /$locale/workspaces/:workspaceId/tables/:tableId
                    ├── records.tsx → .../records
                    └── settings.tsx → .../settings
```

**Generated File**: `src/routeTree.gen.ts` (gitignored, auto-generated)

**Route Constants** (shared/route-paths.ts):

```typescript
export const ROUTES = {
  LOGIN: '/$locale/login',
  WORKSPACES: '/$locale/workspaces',
  ACTIVE_TABLES: {
    LIST: '/$locale/workspaces/$workspaceId/tables',
    TABLE_DETAIL: '/$locale/workspaces/$workspaceId/tables/$tableId',
    TABLE_RECORDS: '/$locale/workspaces/$workspaceId/tables/$tableId/records',
  },
};
```

**Type-Safe Params** (REQUIRED PATTERN):

```typescript
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export function MyPage() {
  const { tableId, workspaceId, locale } = route.useParams();
  // Full type safety!
}
```

## Internationalization

### Paraglide.js Setup

**Supported Locales**:

- `vi` (Vietnamese - default)
- `en` (English)

**Message Files**:

- `messages/vi.json` (~1000 keys)
- `messages/en.json` (~1000 keys)

**Generated Output**: `apps/web/src/paraglide/generated/`

**Usage**:

```typescript
import { m } from '@/paraglide/generated/messages';

function MyComponent() {
  return <h1>{m.welcome()}</h1>;
}
```

**Locale Strategy** (Vite config):

1. URL path (`/$locale`)
2. Cookie (`locale`)
3. Browser preference
4. localStorage
5. Default (`vi`)

## Testing

### Current Status

- ❌ No tests yet
- 📝 Test infrastructure ready (Vitest, Testing Library)
- 📋 Test command available: `pnpm --filter web test`

### Planned Coverage

- Unit tests for utilities/hooks
- Integration tests for features
- E2E tests for critical flows (login, CRUD)

## Build Output

### Production Build Size

**apps/web/dist/**:

```
assets/
├── index-[hash].js         ~800KB (vendor)
├── react-[hash].js         ~150KB (React 19)
├── radix-[hash].js         ~300KB (Radix UI)
├── tanstack-[hash].js      ~250KB (Router, Query, Table)
├── icons-[hash].js         ~80KB (Lucide)
├── date-fns-[hash].js      ~50KB
└── [feature]-[hash].js     ~20-50KB per feature

Total: ~2.5MB (gzipped: ~600KB)
```

### Chunk Strategy (Vite config)

- **react**: React core
- **radix**: Radix UI primitives
- **tanstack**: TanStack libraries
- **icons**: Lucide icons
- **date-fns**: Date utilities
- **vendor**: Everything else from node_modules
- **Per-route chunks**: Automatic code splitting

## Performance Considerations

### Optimizations

1. **Code Splitting**: File-based routing → automatic route-based splitting
2. **Tree Shaking**: TailwindCSS v4 CSS purging
3. **Lazy Loading**: Components lazy-loaded via `React.lazy()`
4. **Memoization**: `useMemo`, `useCallback` for expensive computations
5. **Virtual Scrolling**: @tanstack/react-table for large datasets
6. **Image Optimization**: Next-gen formats (WebP), lazy loading

### Known Bottlenecks

1. **Encryption Overhead**: Client-side E2EE adds ~50ms per record
2. **Large Tables**: 1000+ records need virtualization
3. **Initial Bundle**: ~2.5MB uncompressed (acceptable for enterprise app)

## Security

### Implemented

1. **Client-Side E2EE**: AES-256, OPE, HMAC
2. **Key Storage**: localStorage only (never transmitted)
3. **Token Auth**: JWT bearer tokens
4. **HTTPS Only**: Environment enforced
5. **XSS Prevention**: React auto-escaping + DOMPurify (planned)
6. **CSRF**: Token-based (backend responsibility)

### Pending

- [ ] Content Security Policy (CSP)
- [ ] Input sanitization for rich text (DOMPurify)
- [ ] Rate limiting (backend)
- [ ] Audit logging

## Maintenance & Updates

### Dependencies Update Strategy

- **Monthly**: Minor version updates
- **Quarterly**: Major version updates (with testing)
- **Security**: Immediate patching

### Breaking Changes Log

- **2025-01**: Upgraded to React 19 (from 18)
- **2024-12**: Migrated to TailwindCSS v4 (from v3)
- **2024-11**: File-based routing (from config-based)

## Key Metrics

**Code Quality**:

- TypeScript Coverage: 100%
- ESLint Warnings: < 120 (allowed)
- Strict Mode: Enabled
- No `any` Types: Enforced (except edge cases)

**Build Performance**:

- Dev Server Startup: ~2s
- HMR Update: ~50ms
- Production Build: ~45s
- Type Check: ~15s

**Bundle Size**:

- Uncompressed: ~2.5MB
- Gzipped: ~600KB
- Per-Route Chunk: ~20-50KB

## Common Commands

```bash
# Development
pnpm dev                           # Start all apps
pnpm --filter web dev              # Start web app only

# Build
pnpm build                         # Build entire monorepo
NODE_ENV=production pnpm build     # Production build

# Quality Checks
pnpm lint                          # ESLint
pnpm format                        # Prettier
pnpm --filter web check-types      # TypeScript

# Testing
pnpm --filter web test             # Run tests

# i18n
pnpm machine-translate             # Auto-translate messages

# Dependencies
pnpm install                       # Install all dependencies
pnpm update                        # Update dependencies
```

## Documentation Index

- **Project Overview**: `docs/project-overview-pdr.md`
- **Code Standards**: `docs/code-standards.md`
- **Architecture**: `docs/system-architecture.md`
- **Design Guidelines**: `docs/design-guidelines.md`
- **Deployment**: `docs/deployment-guide.md`
- **Roadmap**: `docs/project-roadmap.md`
- **API Spec**: `docs/swagger.yaml`
- **Feature Specs**: `docs/active-tables/*.md`

## Unresolved Questions

1. Backend API repository location? (Not in this monorepo)
2. Production deployment target? (Self-hosted? Cloud?)
3. Mobile app timeline? (React Native planned for Q2 2026)
4. Third-party integrations priority? (Slack, GitHub, etc.)
