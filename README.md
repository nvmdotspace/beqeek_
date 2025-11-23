# Beqeek - Workflow Automation Platform

**Modern workflow automation with client-side E2EE** | React 19 + Vite 6 + Turborepo

Enterprise-grade workflow tables, drag-and-drop kanban boards, gantt charts, and end-to-end encryption—all in a single platform.

## Quick Start

### Prerequisites

- Node.js >= 22
- PNPM 10.x

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start development server (entire monorepo)
pnpm dev

# Or run specific app
pnpm --filter web dev

# Dev server runs on localhost:4173
```

### Production Build

```bash
# Build entire monorepo
pnpm build

# Build for production with optimization
NODE_ENV=production pnpm build

# Preview production build
pnpm --filter web preview
```

### Docker Deployment

```bash
# Quick start with Docker Compose (all services)
docker compose up -d

# Or use deployment script
chmod +x deploy.sh

# Deploy web app only
./deploy.sh docker

# Deploy product landing page only
./deploy.sh product-page

# Deploy all services
./deploy.sh all

# Services:
# - Web App: http://localhost:82
# - Product Page: http://localhost:83
```

## Tech Stack

**Frontend**: React 19 · TypeScript 5.9 · Vite 6 · TailwindCSS v4

**Routing**: TanStack Router (file-based, type-safe)

**State**: React Query (server) · Zustand (global) · useState (local)

**UI**: shadcn/ui · Radix UI · Lucide icons

**i18n**: Paraglide.js (Vietnamese, English)

**Encryption**: AES-256-CBC · OPE · HMAC-SHA256

**Build**: Turborepo · PNPM workspaces

## Project Structure

```
beqeek/
├── apps/
│   ├── web/                    # Main React application
│   │   ├── src/
│   │   │   ├── features/       # Feature modules (12+)
│   │   │   │   ├── active-tables/  # Core workflow tables
│   │   │   │   ├── auth/
│   │   │   │   ├── workspace/
│   │   │   │   └── ...
│   │   │   ├── routes/         # TanStack Router (file-based)
│   │   │   ├── components/     # Shared components
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── shared/         # API clients, utilities
│   │   │   └── hooks/          # Custom React hooks
│   │   └── vite.config.ts
│   │
│   └── product-page/           # Product landing page (SSG)
│       ├── src/
│       │   ├── components/     # Landing page sections
│       │   ├── pages/          # React Router pages
│       │   └── styles/         # TailwindCSS styles
│       └── vite.config.ts      # vite-react-ssg config
│
├── packages/
│   ├── ui/                     # Component library (shadcn/ui)
│   ├── active-tables-core/     # Active Tables React components
│   ├── beqeek-shared/          # Shared constants, types (35 table templates)
│   ├── encryption-core/        # E2EE utilities
│   ├── eslint-config/          # Shared ESLint rules
│   └── typescript-config/      # Shared TypeScript configs
│
├── docs/                       # Comprehensive documentation
└── messages/                   # i18n translations (vi, en)
```

## Key Features

### Active Tables

- 25+ field types (text, number, date, select, reference, rich text)
- Client-side E2EE with AES-256, OPE, HMAC
- Multiple view layouts: Table, Kanban, Gantt, Card
- Inline editing, comments, permissions
- 35 pre-configured templates (HR, CRM, project management)

### Security

- **Zero-knowledge encryption**: Keys stored client-side only
- **E2EE methods**: AES-256-CBC (text), OPE (numbers/dates), HMAC (selects)
- **Authentication**: JWT bearer tokens
- **Key management**: 32-char encryption key, SHA-256 auth key

### Internationalization

- Vietnamese (default) and English
- Zero-runtime i18n with Paraglide.js
- URL-based locale routing (`/$locale/*`)

## Development Commands

### Code Quality

```bash
# Lint entire monorepo
pnpm lint

# Format code with Prettier
pnpm format

# Type check
pnpm --filter web check-types
```

### Build & Package Management

```bash
# Build specific packages
pnpm --filter @workspace/ui build
pnpm --filter @workspace/active-tables-core build

# Update dependencies
pnpm update

# Add dependency to specific package
pnpm --filter web add <package-name>
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

## Architecture Highlights

### State Management Philosophy

| State Type | Tool        | Usage                               |
| ---------- | ----------- | ----------------------------------- |
| Local      | useState    | UI toggles, form inputs, modals     |
| Server     | React Query | API data, caching, mutations        |
| Global     | Zustand     | User preferences, auth, theme, i18n |

**Anti-patterns:**

- ❌ Never use Zustand for server data
- ❌ Never use useState for global preferences
- ❌ Never use local state for API data

### Routing (TanStack Router)

**File-based routing**: Routes auto-generated from `src/routes/**/*.tsx`

```typescript
// Type-safe params with getRouteApi()
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export function MyPage() {
  const { tableId, workspaceId, locale } = route.useParams();
  // Full TypeScript inference!
}
```

### Styling Standards

**Design tokens (MANDATORY):**

```tsx
// ✅ Use design tokens
<input className="border border-input bg-background text-foreground" />

// ❌ Never hardcode colors
<input className="border border-gray-300 bg-gray-100" />
```

**Standard input classes:**

```
border border-input rounded-md
bg-background text-foreground
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:cursor-not-allowed disabled:opacity-50
```

## Documentation

Comprehensive documentation in `/docs`:

- **[Project Overview (PDR)](docs/project-overview-pdr.md)**: Product vision, requirements, roadmap
- **[Codebase Summary](docs/codebase-summary.md)**: 567k tokens, 441 files analyzed by Repomix
- **[Code Standards](docs/code-standards.md)**: TypeScript patterns, React best practices, anti-patterns
- **[System Architecture](docs/system-architecture.md)**: Data flow, encryption, performance, security
- **[Design Guidelines](docs/design-guidelines.md)**: UI/UX standards, design tokens, accessibility
- **[Deployment Guide](docs/deployment-guide.md)**: Docker, CI/CD, production setup
- **[API Specification](docs/swagger.yaml)**: Complete REST API docs (19k+ tokens)
- **[Feature Specifications](docs/active-tables/)**: Kanban, Gantt, filters business analysis

## Package Reference

### Shared Packages

**@workspace/beqeek-shared** - Constants & Types (TypeScript-only):

- 25+ field type constants
- Action type constants (record, comment, custom)
- Permission arrays for UI dropdowns
- Layout constants (record list/detail, comments)
- 35 table type templates

**@workspace/active-tables-core** - React Components & Hooks:

- Field renderers (text, number, date, select, reference, rich text)
- Kanban board, Gantt chart, Record list/detail layouts
- Hooks: usePermissions, useEncryption, useInlineEdit
- Zustand stores: useViewStore, useFilterStore, useSelectionStore

**@workspace/encryption-core** - E2EE Utilities:

- AES-256-CBC encryption/decryption
- Order-Preserving Encryption (OPE) for range queries
- HMAC-SHA256 for equality checks
- Key generation utilities

**@workspace/ui** - Component Library:

- 35+ shadcn/ui components (button, input, dialog, table, etc.)
- TailwindCSS v4 global styles
- `cn()` utility for class composition

## Common Pitfalls

1. **Hardcoding values** → Import from `@workspace/beqeek-shared`
2. **Wrong state management** → Use React Query for API data, not useState
3. **Missing type safety** → Use `getRouteApi()` for params, not type assertions
4. **Hardcoded colors** → Use design tokens, not `text-gray-500`
5. **Package not updating** → Run `pnpm build` to rebuild packages
6. **Encryption key exposure** → Never log or transmit encryption keys

## Performance

**Build Metrics:**

- Dev server startup: ~2s
- HMR update: ~50ms
- Production build: ~45s
- Type check: ~15s

**Bundle Size:**

- Uncompressed: ~2.5MB
- Gzipped: ~600KB
- Per-route chunk: ~20-50KB

**Optimizations:**

- File-based routing → automatic code splitting
- Manual chunk strategy (react, radix, tanstack, icons, vendor)
- Virtual scrolling for large datasets (1000+ records)
- Lazy loading with `React.lazy()` + Suspense

## Contributing

See [AGENTS.md](AGENTS.md) for development conventions and guidelines.

**Before submitting PR:**

- ✅ Run `pnpm lint` (no errors)
- ✅ Run `pnpm build` (successful)
- ✅ Run `pnpm --filter web check-types` (no errors)
- ✅ Follow patterns in `/docs/code-standards.md`
- ✅ Use design tokens, no hardcoded colors
- ✅ Import constants from `@workspace/beqeek-shared`

## Resources

- **Turborepo**: https://turbo.build/repo/docs
- **TanStack Router**: https://tanstack.com/router/latest
- **TanStack Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com/docs
- **TailwindCSS v4**: https://tailwindcss.com/docs
- **Paraglide.js**: https://inlang.com/m/gercan/paraglide-js

## License

Private/Commercial - Internal project

---

**Need help?** Check [docs/](docs/) for comprehensive guides or review [CLAUDE.md](CLAUDE.md) for AI assistant instructions.
