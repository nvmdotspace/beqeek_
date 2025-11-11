# Project Overview - Product Development Requirements

## Executive Summary

**Beqeek** is a workflow automation platform that enables organizations to create configurable data tables with end-to-end encryption (E2EE), custom workflows, and role-based access control. Built as a modern monorepo using React 19, the platform provides a flexible foundation for managing business processes without vendor lock-in.

**Core Value Proposition**: Enterprise-grade workflow automation with client-side encryption, enabling secure data management while maintaining full user control.

## Product Vision

### Mission Statement

Empower organizations to digitize workflows securely while maintaining complete data sovereignty and flexibility.

### Target Users

1. **Primary**: Mid-sized organizations (50-500 employees)
   - HR departments managing employee lifecycle
   - Operations teams tracking assets/contracts
   - Project managers coordinating tasks

2. **Secondary**: Developers/Technical teams
   - Self-hosted deployment requirements
   - Custom workflow automation
   - API integration needs

## Technical Architecture

### Technology Stack

**Frontend**

- React 19 with TypeScript 5.9 (strict mode)
- Vite 6 for build tooling
- TanStack Router (file-based routing)
- TanStack Query (server state)
- TanStack Table (data tables)
- Zustand (client state)
- shadcn/ui + Radix UI (components)
- TailwindCSS v4 (styling)
- Paraglide.js (i18n - Vietnamese/English)

**State Management Philosophy**

- Local State (useState): UI-only, form inputs, modals
- Server State (React Query): API data, caching, mutations
- Global State (Zustand): User preferences, auth, theme

**Monorepo Structure**

- Turborepo + PNPM workspaces
- apps/web: Main application
- packages/ui: Component library
- packages/active-tables-core: Core Active Tables logic
- packages/beqeek-shared: Shared constants/types
- packages/encryption-core: E2EE utilities

### Key Features

#### 1. Active Tables (Core Feature)

Configurable workflow data tables with:

- 25+ field types (text, number, date, select, reference)
- Client-side E2EE (AES-256, OPE, HMAC)
- 35 pre-configured templates (HR, CRM, project management)
- Multiple view layouts:
  - Generic table view
  - Kanban boards (drag-and-drop)
  - Gantt charts (timeline visualization)
  - Card/head-column layouts

#### 2. Security & Encryption

- **Encryption Types**:
  - AES-256-CBC for text fields
  - OPE for numbers/dates (enables range queries)
  - HMAC-SHA256 for selects (enables equality checks)
- **Key Management**: 32-char encryption key stored client-side only
- **Authentication Key**: SHA-256 hash stored server-side for verification

#### 3. Permission System

Fine-grained access control:

- Role-based permissions
- Record-level permissions (all, self_created, assigned_user, team-based)
- Comment permissions (separate from record permissions)
- Time-based restrictions (2h, 24h, 48h)
- Custom action permissions

#### 4. Internationalization

- Vietnamese (default locale)
- English
- Paraglide.js for zero-runtime i18n
- URL-based locale routing (`/$locale/*`)

## Development Standards

### Code Quality Requirements

**TypeScript**

- Strict mode enabled
- No implicit any
- Full type coverage
- Interfaces with JSDoc

**Component Development**

- PascalCase for components
- camelCase for hooks (prefix `use`)
- Feature-based organization
- Co-location of related files

**Styling Standards**

- TailwindCSS utilities + design tokens
- No hardcoded colors (use CSS variables)
- Mobile-first responsive design
- WCAG 2.1 AA accessibility

**API Integration**

- Axios with centralized error handling
- React Query for all server state
- Feature-specific API clients
- No API calls in components (use hooks)

### Build Configuration

**Development**

```bash
pnpm dev              # Run entire monorepo
pnpm --filter web dev # Run web app only
```

**Production**

```bash
NODE_ENV=production pnpm build
pnpm --filter web preview
```

**Code Quality**

```bash
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm --filter web check-types
```

## Project Structure

```
beqeek/
├── apps/
│   └── web/                    # Main React application
│       ├── src/
│       │   ├── features/       # Feature modules (12+ features)
│       │   │   ├── active-tables/
│       │   │   ├── auth/
│       │   │   ├── workspace/
│       │   │   └── ...
│       │   ├── routes/         # TanStack Router file-based routes
│       │   ├── components/     # Shared components
│       │   ├── stores/         # Zustand global stores
│       │   ├── shared/         # API clients, utilities
│       │   └── hooks/          # Custom React hooks
│       └── vite.config.ts
│
├── packages/
│   ├── ui/                     # Component library (shadcn/ui)
│   ├── active-tables-core/     # Active Tables React components
│   ├── beqeek-shared/          # Shared constants/types
│   ├── encryption-core/        # E2EE utilities
│   ├── eslint-config/          # Shared ESLint rules
│   └── typescript-config/      # Shared TypeScript configs
│
├── docs/                       # Documentation
├── messages/                   # i18n translations
├── project.inlang/             # Paraglide config
└── turbo.json                  # Turborepo config
```

## Feature Overview

### Implemented Features

1. **Authentication & Authorization** (apps/web/src/features/auth)
   - Login/logout flow
   - Token-based auth
   - Route guards

2. **Workspace Management** (apps/web/src/features/workspace)
   - Multi-workspace support
   - Workspace switching
   - Workspace settings

3. **Active Tables** (apps/web/src/features/active-tables)
   - Table creation/configuration
   - Schema editor
   - Record CRUD operations
   - Kanban boards
   - Gantt charts
   - Comments system
   - Inline editing

4. **User & Team Management**
   - User profiles
   - Team collaboration
   - Role management

5. **Analytics** (apps/web/src/features/analytics)
   - Usage metrics
   - Activity tracking

### Planned Features

- Workflow automation engine
- API webhooks
- Custom actions
- Advanced filtering
- Bulk operations
- Export/import capabilities
- Mobile app (React Native)

## API Architecture

**Pattern**: POST-based RPC endpoints

```
POST /api/workspace/{workspaceId}/workflow/{verb}/active_tables
```

**Key Endpoints**:

- `search/active_tables` - Get tables list
- `get/active_tables` - Get table details
- `create/active_tables` - Create table
- `update/active_tables` - Update table
- `get_active_records` - Get records
- `create_active_records` - Create record
- `update_active_records` - Update record

Full API spec: `docs/swagger.yaml`

## Deployment

### Docker Support

- Multi-stage production build
- Nginx serving static files
- Docker Compose orchestration
- Health checks included

**Quick Start**:

```bash
docker-compose up -d
```

### Environment Requirements

- Node.js >= 22
- PNPM 10.x
- 2GB RAM minimum
- PostgreSQL (backend - not in this repo)

## Success Metrics

### Phase 1 (Current)

- ✅ Core Active Tables feature complete
- ✅ E2EE implementation
- ✅ Kanban/Gantt views
- ✅ Permission system
- ✅ i18n support (2 languages)

### Phase 2 (Q1 2026)

- Workflow automation engine
- API webhooks
- Advanced analytics
- Mobile app beta

### Phase 3 (Q2-Q3 2026)

- Custom actions framework
- Plugin system
- Third-party integrations
- Enterprise features (SSO, audit logs)

## Risk Assessment

### Technical Risks

1. **Client-side Encryption Complexity**: Key management education for users
2. **Performance**: Large datasets with encryption overhead
3. **Browser Compatibility**: Modern browser requirements

### Mitigation Strategies

1. Comprehensive user documentation + in-app guidance
2. Virtual scrolling + pagination + indexedDB caching
3. Progressive enhancement + clear browser requirements

## References

- **Design System**: WCAG 2.1 AA, Vietnamese typography optimization
- **API Documentation**: `docs/swagger.yaml`
- **Feature Specs**: `docs/active-tables/*.md`
- **Encryption Spec**: `docs/encryption-modes-corrected.md`
- **Table Templates**: 35 pre-configured templates in `packages/beqeek-shared/configs`

## Contributors & Roles

- **Project Lead**: Architecture, technical decisions
- **Frontend Team**: React components, UI/UX implementation
- **Backend Team**: API development (separate repo)
- **DevOps**: Infrastructure, deployment automation

## License

Private/Commercial - Internal project
