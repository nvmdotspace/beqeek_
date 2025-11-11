# Codebase Summary

Generated from Repomix analysis on 2025-11-11

## Overview

Beqeek: **React 19 + Vite + Turborepo** workflow automation platform with client-side E2EE.

**Total Files**: 441 files
**Total Tokens**: 567,932 tokens
**Total Chars**: 2,375,749 chars
**Languages**: TypeScript (99%), CSS (1%)
**Build Tool**: Turborepo + PNPM workspaces

## Top 5 Files by Token Count

1. **docs/swagger.yaml** (19,681 tokens, 95,340 chars, 3.5%) - Complete API specification
2. **packages/beqeek-shared/src/configs/table-configs.ts** (18,840 tokens, 79,381 chars, 3.3%) - 35 table templates
3. **messages/vi.json** (14,869 tokens, 55,814 chars, 2.6%) - Vietnamese i18n messages
4. **docs/active-table-config-functional-spec.md** (14,088 tokens, 48,635 chars, 2.5%) - Active Tables spec
5. **docs/active-tables/gantt-business-analysis.md** (13,813 tokens, 51,081 chars, 2.4%) - Gantt feature analysis

## Project Structure

```
beqeek/                              (~568k tokens total)
├── apps/
│   └── web/                         # Main React 19 SPA
│       ├── src/
│       │   ├── features/            # 12 feature modules
│       │   │   ├── active-tables/   # Core workflow tables (largest feature)
│       │   │   │   ├── api/         # 4 API clients
│       │   │   │   ├── components/  # 40+ components (settings, kanban, gantt, records)
│       │   │   │   ├── hooks/       # 17 custom hooks
│       │   │   │   ├── pages/       # 5 pages
│       │   │   │   ├── types/       # Type definitions
│       │   │   │   └── utils/       # Encryption, validation helpers
│       │   │   ├── auth/            # Authentication
│       │   │   ├── workspace/       # Workspace management
│       │   │   ├── team/            # Team collaboration
│       │   │   ├── roles/           # Role/permissions management
│       │   │   ├── analytics/       # Usage metrics
│       │   │   ├── workflows/       # Workflow automation (WIP)
│       │   │   ├── notifications/   # Notifications
│       │   │   ├── search/          # Global search
│       │   │   ├── support/         # Help & support
│       │   │   ├── organization/    # Org settings (starred, archived, recent)
│       │   │   └── workspace-users/ # User management
│       │   │
│       │   ├── routes/              # TanStack Router (file-based)
│       │   │   ├── __root.tsx
│       │   │   ├── $locale.tsx
│       │   │   ├── index.tsx
│       │   │   ├── $.tsx            # 404 catch-all
│       │   │   └── $locale/         # Locale-prefixed routes
│       │   │       ├── login.tsx
│       │   │       ├── workspaces.tsx
│       │   │       ├── notifications.tsx
│       │   │       ├── search.tsx
│       │   │       ├── help.tsx
│       │   │       └── workspaces/
│       │   │           └── $workspaceId/
│       │   │               ├── tables.tsx
│       │   │               ├── workflows.tsx
│       │   │               ├── team.tsx
│       │   │               ├── roles.tsx
│       │   │               ├── analytics.tsx
│       │   │               ├── starred.tsx
│       │   │               ├── recent-activity.tsx
│       │   │               ├── archived.tsx
│       │   │               └── tables/
│       │   │                   └── $tableId/
│       │   │                       ├── index.tsx      # Table config
│       │   │                       ├── settings.tsx   # Table settings
│       │   │                       └── records/
│       │   │                           ├── index.tsx  # Records list
│       │   │                           ├── $recordId.tsx # Record detail
│       │   │                           └── route.tsx
│       │   │
│       │   ├── components/          # Shared components
│       │   │   ├── app-layout.tsx
│       │   │   ├── app-sidebar.tsx
│       │   │   ├── root-layout.tsx
│       │   │   ├── workspace-selector.tsx
│       │   │   ├── navigation-menu.tsx
│       │   │   ├── mobile-bottom-nav.tsx
│       │   │   ├── error-boundary.tsx
│       │   │   ├── error-display.tsx
│       │   │   ├── api-error-boundary.tsx
│       │   │   ├── route-error.tsx
│       │   │   ├── route-pending.tsx
│       │   │   ├── not-found.tsx
│       │   │   ├── navigation-progress.tsx
│       │   │   ├── page-transition.tsx
│       │   │   ├── mode-toggle.tsx
│       │   │   ├── keyboard-shortcuts-help.tsx
│       │   │   ├── activity-tracking.tsx
│       │   │   └── feature-placeholder.tsx
│       │   │
│       │   ├── stores/              # Zustand stores (3 total)
│       │   │   ├── auth-store.ts    # User, token
│       │   │   ├── sidebar-store.ts # Sidebar open/close
│       │   │   └── language-store.ts # i18n locale
│       │   │
│       │   ├── shared/              # Shared utilities & API
│       │   │   ├── api/
│       │   │   │   ├── http-client.ts        # Axios base client
│       │   │   │   ├── api-error.ts          # Error handling
│       │   │   │   ├── active-tables-client.ts # Active Tables API
│       │   │   │   ├── config.ts             # API config
│       │   │   │   └── types.ts
│       │   │   ├── utils/
│       │   │   │   ├── error-utils.ts
│       │   │   │   └── field-encryption.ts
│       │   │   ├── query-client.ts  # React Query setup
│       │   │   ├── route-paths.ts   # Route constants
│       │   │   ├── route-helpers.md # Route patterns doc
│       │   │   └── locales.ts       # Locale config
│       │   │
│       │   ├── hooks/               # Custom hooks
│       │   │   ├── use-api-error-handler.ts
│       │   │   ├── use-badge-counts.ts
│       │   │   ├── use-current-locale.ts
│       │   │   ├── use-keyboard-shortcuts.ts
│       │   │   └── use-query-with-auth.ts
│       │   │
│       │   ├── providers/
│       │   │   ├── app-providers.tsx # Root providers wrapper
│       │   │   └── theme-provider.tsx
│       │   │
│       │   ├── main.tsx             # App entry point
│       │   └── vite-env.d.ts
│       │
│       ├── public/                  # Static assets
│       │   ├── file.svg
│       │   ├── globe.svg
│       │   ├── tanstack.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       │
│       ├── .env.example
│       ├── components.json          # shadcn/ui config
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       ├── tsconfig.tests.json
│       └── vite.config.ts
│
├── packages/
│   ├── ui/                          # Component library (shadcn/ui)
│   │   ├── src/
│   │   │   ├── components/          # 35+ components
│   │   │   │   ├── ui/
│   │   │   │   │   └── shadcn-io/
│   │   │   │   │       ├── kanban/
│   │   │   │   │       │   └── index.tsx
│   │   │   │   │       └── sonner.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── color-picker.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── kanban.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   └── utils.ts         # cn() utility
│   │   │   ├── styles/
│   │   │   │   └── globals.css      # TailwindCSS v4 styles
│   │   │   └── index.ts
│   │   ├── components.json
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── tsconfig.json
│   │   └── tsconfig.lint.json
│   │
│   ├── active-tables-core/          # Core Active Tables logic
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/          # Field utilities
│   │   │   │   │   ├── field-badge.tsx
│   │   │   │   │   ├── field-error.tsx
│   │   │   │   │   ├── field-label.tsx
│   │   │   │   │   ├── field-wrapper.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── fields/          # 15+ field renderers
│   │   │   │   │   ├── lexical/     # Rich text editor
│   │   │   │   │   │   ├── nodes/
│   │   │   │   │   │   │   └── image-node.tsx
│   │   │   │   │   │   ├── editor-config.ts
│   │   │   │   │   │   ├── image-plugin.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── lexical-editor.tsx
│   │   │   │   │   │   ├── styles.css
│   │   │   │   │   │   ├── theme.ts
│   │   │   │   │   │   └── toolbar-plugin.tsx
│   │   │   │   │   ├── async-record-select.tsx
│   │   │   │   │   ├── checkbox-field.tsx
│   │   │   │   │   ├── date-field.tsx
│   │   │   │   │   ├── datetime-field.tsx
│   │   │   │   │   ├── field-list-renderer.tsx
│   │   │   │   │   ├── field-renderer-props.ts
│   │   │   │   │   ├── field-renderer.tsx
│   │   │   │   │   ├── field-summary.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── number-field.tsx
│   │   │   │   │   ├── reference-field.tsx
│   │   │   │   │   ├── rich-text-field.tsx
│   │   │   │   │   ├── select-field.tsx
│   │   │   │   │   ├── text-field.tsx
│   │   │   │   │   ├── textarea-field.tsx
│   │   │   │   │   ├── time-field.tsx
│   │   │   │   │   ├── user-field.tsx
│   │   │   │   │   └── user-select.tsx
│   │   │   │   ├── gantt/           # Gantt chart
│   │   │   │   │   ├── gantt-chart.tsx
│   │   │   │   │   ├── gantt-grid.tsx
│   │   │   │   │   ├── gantt-props.ts
│   │   │   │   │   ├── gantt-task.tsx
│   │   │   │   │   ├── gantt-timeline.tsx
│   │   │   │   │   ├── gantt-utils.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── use-gantt-zoom.ts
│   │   │   │   ├── kanban/          # Kanban board
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── kanban-board.tsx
│   │   │   │   │   ├── kanban-card.tsx
│   │   │   │   │   ├── kanban-column.tsx
│   │   │   │   │   └── kanban-props.ts
│   │   │   │   ├── record-detail/   # Record detail layouts
│   │   │   │   │   ├── comments-panel.tsx
│   │   │   │   │   ├── head-detail-layout.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── record-detail-props.ts
│   │   │   │   │   ├── record-detail.tsx
│   │   │   │   │   └── two-column-detail-layout.tsx
│   │   │   │   ├── record-list/     # Record list layouts
│   │   │   │   │   ├── compact-layout.tsx
│   │   │   │   │   ├── generic-table-layout.tsx
│   │   │   │   │   ├── head-column-layout.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── record-list-props.ts
│   │   │   │   │   └── record-list.tsx
│   │   │   │   ├── states/          # Loading/error/empty states
│   │   │   │   │   ├── empty-state.tsx
│   │   │   │   │   ├── error-state.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── loading-state.tsx
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   ├── default-messages.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/               # React hooks
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-active-table.tsx
│   │   │   │   ├── use-encryption.ts
│   │   │   │   ├── use-field-value.ts
│   │   │   │   ├── use-inline-edit.ts
│   │   │   │   └── use-permissions.ts
│   │   │   ├── stores/              # Zustand stores
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-filter-store.ts
│   │   │   │   ├── use-selection-store.ts
│   │   │   │   └── use-view-store.ts
│   │   │   ├── types/               # Type definitions
│   │   │   │   ├── action.ts
│   │   │   │   ├── common.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── existing-types.ts
│   │   │   │   ├── field.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── record.ts
│   │   │   │   └── responses.ts
│   │   │   ├── utils/               # Utilities
│   │   │   │   ├── decryption-cache.ts
│   │   │   │   ├── encryption-helpers.ts
│   │   │   │   ├── field-formatter.ts
│   │   │   │   ├── field-validation.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── permission-checker.ts
│   │   │   │   └── record-decryptor.ts
│   │   │   └── index.ts
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── README-LIST-VIEWS.md
│   │   ├── README.md
│   │   └── tsconfig.json
│   │
│   ├── beqeek-shared/               # Shared constants & types
│   │   ├── src/
│   │   │   ├── configs/
│   │   │   │   ├── index.ts
│   │   │   │   ├── table-config-helpers.ts
│   │   │   │   └── table-configs.ts # 35 table templates (18k+ tokens)
│   │   │   ├── constants/
│   │   │   │   ├── action-types.ts
│   │   │   │   ├── field-types.ts   # 25+ field type constants
│   │   │   │   ├── index.ts
│   │   │   │   ├── layouts.ts       # Layout constants
│   │   │   │   ├── permissions.ts   # Permission arrays
│   │   │   │   └── table-types.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   └── table-config-types.ts
│   │   │   ├── utils/
│   │   │   │   ├── default-actions.ts
│   │   │   │   └── uuid-generator.ts
│   │   │   ├── validators/
│   │   │   │   ├── index.ts
│   │   │   │   └── table-type-validators.ts
│   │   │   └── index.ts
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── README.md
│   │   └── tsconfig.json
│   │
│   ├── encryption-core/             # E2EE utilities
│   │   ├── src/
│   │   │   ├── algorithms/
│   │   │   │   ├── aes-256.ts       # AES-256-CBC
│   │   │   │   ├── hmac.ts          # HMAC-SHA256
│   │   │   │   └── ope.ts           # Order-preserving encryption
│   │   │   ├── common-utils.ts
│   │   │   ├── index.ts
│   │   │   ├── key-generator.ts
│   │   │   └── types.ts
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── README.md
│   │   └── tsconfig.json
│   │
│   ├── eslint-config/               # Shared ESLint rules
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── react-internal.js
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── typescript-config/           # Shared TS configs
│       ├── base.json
│       ├── nextjs.json
│       ├── react-library.json
│       ├── package.json
│       └── README.md
│
├── docs/                            # Documentation
│   ├── active-tables/               # Feature specifications
│   │   ├── gantt-business-analysis.md (13k+ tokens)
│   │   ├── kanban-business-analysis.md
│   │   ├── kanban-drag-drop-feature-analysis.md
│   │   └── Quick-Filter-Business-Analysis.md
│   ├── active-table-config-functional-spec.md (14k+ tokens)
│   ├── code-standards.md            # Coding standards & patterns
│   ├── codebase-summary.md          # This file
│   ├── deployment-guide.md          # Docker, CI/CD
│   ├── design-guidelines.md         # UI/UX standards
│   ├── doc-get-active-records.md
│   ├── encryption-modes-corrected.md
│   ├── first-reference-record-spec.md
│   ├── hash_step.md
│   ├── project-overview-pdr.md      # Product requirements
│   ├── project-roadmap.md           # Feature roadmap
│   ├── swagger.yaml                 # API spec (19k+ tokens)
│   ├── system-architecture.md       # Architecture diagrams
│   ├── workflow-connectors-functional-spec.md
│   ├── workflow-forms-functional-spec.md
│   └── workflow-units-functional-spec.md
│
├── messages/                        # i18n translations
│   ├── vi.json                      # Vietnamese (14k+ tokens)
│   └── en.json                      # English
│
├── plans/                           # Planning templates
│   └── templates/
│       ├── bug-fix-template.md
│       ├── feature-implementation-template.md
│       ├── refactor-template.md
│       └── template-usage-guide.md
│
├── project.inlang/                  # Paraglide.js i18n config
│   ├── .gitignore
│   ├── project_id
│   └── settings.json
│
├── scripts/
│   └── lint-staged-helper.sh
│
├── .claude/                         # Claude Code workflows
├── .husky/                          # Git hooks
│   └── pre-commit
│
├── .dockerignore
├── .env.example
├── .eslintrc.js
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── AGENTS.md                        # Agent guidelines
├── CLAUDE.md                        # Claude Code instructions
├── compose.yml                      # Docker Compose
├── deploy.sh                        # Deployment script
├── DEPLOYMENT.md                    # Deployment guide
├── Dockerfile.web                   # Production Dockerfile
├── IMPLEMENTATION_SUMMARY.md
├── MIGRATION_FILE_BASED_ROUTING.md
├── nginx.conf                       # Nginx config
├── package.json                     # Root package.json
├── pnpm-workspace.yaml              # PNPM workspace config
├── README.md                        # Project README
├── tsconfig.json                    # Root TS config
└── turbo.json                       # Turborepo config
```

## Core Features Breakdown

### Active Tables Feature (Largest Module)

**Location**: `apps/web/src/features/active-tables/`

**Components**:

- **Record Form** (2): create-record-dialog, field-input
- **Settings** (25+): Actions, danger zone, fields, filters, gantt, general, kanban, permissions, views
- **UI Components** (20+): Table cards, comments, encryption, inline editing, kanban, permissions

**API Clients** (4):

- active-actions-api.ts
- active-comments-api.ts
- active-records-api.ts
- active-tables-api.ts

**Hooks** (17):

- use-active-tables, use-create-record, use-encryption-stub, use-infinite-active-table-records
- use-list-context, use-list-table-records, use-record-by-id, use-record-comments
- use-record-comments-with-permissions, use-scroll-shortcuts, use-table-encryption
- use-table-management, use-update-record, use-update-record-field, use-update-table-config

**Pages** (5):

- active-table-detail-page, active-table-records-page, active-table-settings-page
- active-tables-page, record-detail-page

**Utilities**:

- encryption-detection, encryption-key-storage, field-cleanup, field-name-generator
- module-icons, query-encryption, record-detail-config, settings-validation

### Other Features

| Feature         | Location                 | Components | Hooks | Pages |
| --------------- | ------------------------ | ---------- | ----- | ----- |
| Auth            | features/auth            | -          | 2     | 1     |
| Workspace       | features/workspace       | 4          | 3     | 1     |
| Workspace Users | features/workspace-users | -          | 3     | -     |
| Team            | features/team            | -          | -     | 1     |
| Roles           | features/roles           | -          | -     | 1     |
| Analytics       | features/analytics       | -          | -     | 1     |
| Workflows       | features/workflows       | -          | -     | 1     |
| Notifications   | features/notifications   | -          | -     | 1     |
| Search          | features/search          | -          | -     | 1     |
| Support         | features/support         | -          | -     | 1     |
| Organization    | features/organization    | -          | -     | 3     |

## Technology Stack

### Frontend Dependencies (Key Packages)

**Core**:

- react@19.1.1, react-dom@19.1.1
- typescript@5.9.2
- vite@6.0.3

**Routing & State**:

- @tanstack/react-router@1.133.36 (file-based routing with auto-generation)
- @tanstack/react-query@5.71.10 (server state management)
- @tanstack/react-table@8.21.3 (data tables)
- @tanstack/react-form@1.11.0 (form validation)
- zustand@5.0.1 (global client state)

**UI Components**:

- @radix-ui/\* (40+ primitives for shadcn/ui)
- lucide-react@0.544.0 (icons)
- tailwindcss@4.1.13 (v4 CSS framework)
- @dnd-kit/core@6.3.1 (drag-and-drop for kanban)

**Utilities**:

- axios@1.12.2 (HTTP client)
- crypto-js@4.2.0 (client-side encryption)
- date-fns@4.1.0 (date formatting)
- sonner@1.7.4 (toast notifications)

**i18n**:

- @inlang/paraglide-js@2.4.0 (zero-runtime i18n)

### Build Configuration

**Turborepo Tasks**:

- `build`: Depends on `^build` (builds packages first)
- `dev`: Cache disabled, persistent
- `lint`: Depends on `^lint`
- `check-types`: Depends on `^check-types`

**Vite Configuration**:

- Manual chunk splitting: react, radix, tanstack, icons, vendor
- TanStack Router plugin (auto-generates routeTree.gen.ts)
- Paraglide i18n plugin
- Dev server: localhost:4173

**TypeScript**:

- Strict mode enabled
- Path alias: `@` → `src`
- Project references for monorepo packages

## State Management

### Philosophy

| State Type | Tool        | Usage                                   | Count                         |
| ---------- | ----------- | --------------------------------------- | ----------------------------- |
| Local      | useState    | UI toggles, form inputs, modals         | ~300+ instances across webapp |
| Server     | React Query | API data, caching, mutations            | ~80 queries, ~40 mutations    |
| Global     | Zustand     | User preferences, auth, theme, language | 3 stores total                |

### Zustand Stores

1. **auth-store.ts**: User, token, login/logout
2. **sidebar-store.ts**: Sidebar open/close state
3. **language-store.ts**: i18n locale management

### React Query Patterns

**Query Keys**:

```typescript
['tables', workspaceId][('table', workspaceId, tableId)][('records', tableId, filters)][('record', recordId)][
  ('comments', recordId)
]['workspaces'][('workspace', workspaceId)];
```

**Stale Time**: 5 minutes (default)
**Cache Time**: 10 minutes (garbage collection)

## Routing Architecture

### File-Based Routing (TanStack Router)

**Auto-Generated**: `src/routeTree.gen.ts` (gitignored)
**Plugin**: `@tanstack/router-plugin/vite` generates routes on save

**Route Structure**:

- `__root.tsx` → Root layout (all routes)
- `index.tsx` → `/` (redirect to locale)
- `$.tsx` → 404 catch-all
- `$locale.tsx` → Layout for `/$locale` routes
- `$locale/` → Locale-prefixed routes (vi, en)

**Type-Safe Params**: Use `getRouteApi()` with `ROUTES` constants from `route-paths.ts`

**Lazy Loading**: Automatic code-splitting with `autoCodeSplitting: true`

## Internationalization

**Locales**: Vietnamese (vi - default), English (en)
**Messages**: `messages/vi.json` (14k+ tokens), `messages/en.json`
**Generated**: `apps/web/src/paraglide/generated/`

**Locale Strategy**:

1. URL path (`/$locale`)
2. Cookie (`locale`)
3. Browser preference
4. localStorage
5. Default (`vi`)

## Build Output

**Production Bundle** (~568k tokens total codebase):

- Uncompressed: ~2.5MB
- Gzipped: ~600KB
- Per-route chunk: ~20-50KB

**Chunk Strategy**:

- react: React core (~150KB)
- radix: Radix UI primitives (~300KB)
- tanstack: Router, Query, Table (~250KB)
- icons: Lucide icons (~80KB)
- vendor: Other dependencies (~800KB)
- Per-route: Lazy-loaded chunks (~20-50KB each)

## Key Metrics

**Code Quality**:

- TypeScript Coverage: 100%
- Strict Mode: Enabled
- No `any` Types: Enforced (with rare exceptions)

**Build Performance**:

- Dev Server Startup: ~2s
- HMR Update: ~50ms
- Production Build: ~45s
- Type Check: ~15s

**Security**:

- ✅ Client-side E2EE (AES-256, OPE, HMAC)
- ✅ Token-based auth (JWT)
- ✅ HTTPS enforced
- ⚠️ Key loss = permanent data loss

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

# i18n
pnpm machine-translate             # Auto-translate messages

# Dependencies
pnpm install                       # Install all dependencies
pnpm update                        # Update dependencies
```

## Documentation Index

- **Project Overview**: `/docs/project-overview-pdr.md` - Product requirements, vision, roadmap
- **Code Standards**: `/docs/code-standards.md` - Coding conventions, patterns, anti-patterns
- **System Architecture**: `/docs/system-architecture.md` - Architecture diagrams, data flow
- **Design Guidelines**: `/docs/design-guidelines.md` - UI/UX standards, design tokens
- **Deployment**: `/docs/deployment-guide.md` - Docker, CI/CD, production setup
- **Roadmap**: `/docs/project-roadmap.md` - Feature roadmap, priorities
- **API Spec**: `/docs/swagger.yaml` (19k+ tokens) - Complete API documentation
- **Feature Specs**: `/docs/active-tables/*.md` - Kanban, Gantt, filters analysis

## Repository Insights

**Most Complex Files** (by tokens):

1. API spec (19k tokens) - Comprehensive REST API documentation
2. Table configs (18k tokens) - 35 pre-configured workflow templates
3. Vietnamese i18n (14k tokens) - ~1000 translation keys
4. Active Tables spec (14k tokens) - Core feature documentation
5. Gantt analysis (13k tokens) - Timeline visualization requirements

**Largest Packages** (by files):

1. **ui** - 35+ shadcn/ui components
2. **active-tables-core** - 60+ files (components, hooks, utils)
3. **web app** - 200+ files across 12 features

**Most Active Areas**:

- Active Tables feature (core domain model)
- UI component library (shared across apps)
- Shared constants (35 table templates, field types, permissions)
