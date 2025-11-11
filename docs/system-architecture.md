# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│                   (React 19 + Vite + TS)                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web App     │  │  Admin App   │  │ Product Page │      │
│  │  (Main SPA)  │  │  (Planned)   │  │  (Planned)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Client-Side E2EE                        │
│               (AES-256, OPE, HMAC-SHA256)                   │
│                   32-char encryption key                     │
│                  (localStorage, never transmitted)           │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│                (POST-based RPC endpoints)                    │
│         /api/workspace/{workspaceId}/workflow/{verb}        │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│                    (Not in this repo)                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Workflow   │  │   Storage    │      │
│  │   Service    │  │   Engine     │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Redis      │  │  S3 Storage  │      │
│  │  (Primary)   │  │   (Cache)    │  │  (Files)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Monorepo Structure (Turborepo + PNPM)

```
beqeek/
├── apps/                    # Applications
│   └── web/                 # Main React 19 SPA
│       ├── src/
│       │   ├── features/    # Feature modules (12+)
│       │   ├── routes/      # TanStack Router (file-based)
│       │   ├── components/  # Shared components
│       │   ├── stores/      # Zustand global state
│       │   ├── shared/      # API clients, utils
│       │   └── hooks/       # Custom React hooks
│       └── vite.config.ts   # Build configuration
│
└── packages/                # Shared packages
    ├── ui/                  # Component library (shadcn/ui)
    ├── active-tables-core/  # Core Active Tables logic
    ├── beqeek-shared/       # Constants, types, validators
    ├── encryption-core/     # E2EE utilities
    ├── eslint-config/       # Linting rules
    └── typescript-config/   # TS configurations
```

### Technology Stack

**Core Framework**:

- **React 19**: UI library with concurrent features
- **TypeScript 5.9**: Strict mode, full type coverage
- **Vite 6**: Build tool (dev server + production bundler)

**Routing & Navigation**:

- **TanStack Router 1.133+**: File-based routing, type-safe params
- Auto-generated route tree from file structure
- Lazy-loaded routes for code splitting

**State Management**:

```typescript
┌────────────────────────────────────────────────────┐
│                  State Philosophy                  │
├────────────────────────────────────────────────────┤
│ Local State (useState)                             │
│   - UI toggles, modals, form inputs               │
│   - Component-specific state                       │
│   - ~300+ instances                                │
├────────────────────────────────────────────────────┤
│ Server State (React Query)                         │
│   - API data, caching, mutations                   │
│   - Automatic refetching, invalidation             │
│   - ~80 queries, ~40 mutations                     │
├────────────────────────────────────────────────────┤
│ Global State (Zustand)                             │
│   - Auth, sidebar, language                        │
│   - User preferences                               │
│   - 3 stores total                                 │
└────────────────────────────────────────────────────┘
```

**UI Components**:

- **shadcn/ui**: Radix UI primitives + TailwindCSS
- **TailwindCSS v4**: Utility-first styling
- **Lucide React**: Icon library (1000+ icons)
- **@dnd-kit**: Drag-and-drop (Kanban boards)

**Data Fetching**:

- **Axios**: HTTP client with interceptors
- **TanStack Query**: Server state management
- **TanStack Table**: Data tables with sorting, filtering

**Internationalization**:

- **Paraglide.js**: Zero-runtime i18n (Vietnamese, English)
- URL-based locale routing (`/$locale/*`)

### Build Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                     Build Process                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 1. TypeScript Compilation (tsc)                         │
│    - Type checking                                       │
│    - No emit (Vite handles transpilation)               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. i18n Compilation (Paraglide)                         │
│    - messages/vi.json → src/paraglide/generated/       │
│    - messages/en.json → src/paraglide/generated/       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Package Builds (Turborepo)                           │
│    - ui → dist/                                          │
│    - active-tables-core → dist/                         │
│    - Other packages → dist/                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. App Build (Vite)                                     │
│    - Code splitting (manual chunks)                     │
│    - Minification (Terser)                              │
│    - CSS optimization (cssnano)                         │
│    - Asset optimization                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Output: apps/web/dist/                                  │
│    - index.html                                          │
│    - assets/*.js (chunked by vendor)                    │
│    - assets/*.css (minified)                            │
│    - Total: ~2.5MB uncompressed, ~600KB gzipped        │
└─────────────────────────────────────────────────────────┘
```

**Chunk Strategy**:

- **react**: React core (~150KB)
- **radix**: Radix UI primitives (~300KB)
- **tanstack**: Router, Query, Table (~250KB)
- **icons**: Lucide icons (~80KB)
- **vendor**: Other dependencies (~800KB)
- **Per-route**: Lazy-loaded chunks (~20-50KB each)

## Core Feature Architecture

### Active Tables

**Purpose**: Configurable workflow data tables with E2EE

```
┌─────────────────────────────────────────────────────────┐
│                    Active Tables Flow                    │
└─────────────────────────────────────────────────────────┘
                          │
    ┌─────────────────────┴─────────────────────┐
    ▼                                             ▼
┌──────────────────┐                    ┌──────────────────┐
│  Table Config    │                    │  Record Data     │
│  (Schema)        │                    │  (CRUD)          │
│                  │                    │                  │
│ - Field types    │                    │ - Create         │
│ - Validations    │                    │ - Read           │
│ - Permissions    │                    │ - Update         │
│ - Views (kanban, │                    │ - Delete         │
│   gantt, list)   │                    │ - Comments       │
└──────────────────┘                    └──────────────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Client-Side Encryption (E2EE)              │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ AES-256    │  │    OPE     │  │ HMAC-SHA256│       │
│  │            │  │            │  │            │       │
│  │ Text       │  │ Numbers/   │  │ Selects    │       │
│  │ Fields     │  │ Dates      │  │ (equality) │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│                                                          │
│  Key: 32 chars, localStorage only, NEVER transmitted   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  API Communication                       │
│  POST /api/workspace/{id}/workflow/verb/active_tables  │
│                                                          │
│  - search/active_tables                                 │
│  - get/active_tables                                    │
│  - create/active_tables                                 │
│  - update/active_tables                                 │
│  - get_active_records                                   │
│  - create_active_records                                │
│  - update_active_records                                │
└─────────────────────────────────────────────────────────┘
```

**Field Types** (25+):

- Text: SHORT_TEXT, TEXT, RICH_TEXT, EMAIL, URL
- Number: INTEGER, NUMERIC
- Date: DATE, DATETIME, TIME, YEAR, MONTH, etc.
- Selection: SELECT_ONE, SELECT_LIST, CHECKBOX_YES_NO, etc.
- Reference: SELECT_ONE_RECORD, SELECT_LIST_RECORD, etc.

**View Layouts**:

1. **Generic Table**: Spreadsheet-style with sorting, filtering
2. **Head-Column**: Card layout with title + subtitle fields
3. **Kanban**: Drag-and-drop board grouped by SELECT_ONE field
4. **Gantt**: Timeline view with start/end dates + dependencies

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Authentication Flow                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 1. User enters credentials (email + password)           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. POST /api/auth/login                                 │
│    - Validates credentials                              │
│    - Returns JWT token + user data                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Store in Zustand + localStorage                      │
│    - useAuthStore.setUser(user)                         │
│    - localStorage.setItem('token', token)               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Axios interceptor adds token to all requests         │
│    - Authorization: Bearer {token}                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Route guards check authentication                    │
│    - beforeLoad: getIsAuthenticated()                   │
│    - Redirect to /login if not authenticated            │
└─────────────────────────────────────────────────────────┘
```

**Token Lifecycle**:

- **Storage**: localStorage (persists across sessions)
- **Expiration**: 7 days (backend configurable)
- **Refresh**: Manual re-login (auto-refresh planned)
- **Logout**: Clear localStorage + Zustand state

### Encryption Architecture

**Client-Side E2EE** (End-to-End Encryption):

```
┌─────────────────────────────────────────────────────────┐
│                  Encryption Key Flow                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 1. User generates 32-char encryption key                │
│    - Random base64 string                               │
│    - Generated via crypto.randomBytes(24).toString()    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Key stored in localStorage                           │
│    - localStorage.setItem('encryptionKey', key)         │
│    - NEVER sent to server                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Authentication key (SHA-256 hash) sent to server     │
│    - encryptionAuthKey = SHA256(encryptionKey)          │
│    - Server stores hash for verification                │
│    - Cannot reverse hash to get original key            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Encryption before API calls                          │
│    - Text fields: AES-256-CBC (IV prepended)            │
│    - Numbers/dates: OPE (Order-Preserving Encryption)   │
│    - Selects: HMAC-SHA256 (equality checks)             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Decryption after API response                        │
│    - Client decrypts with stored key                    │
│    - Server never has access to plaintext               │
└─────────────────────────────────────────────────────────┘
```

**Encryption Methods**:

| Field Type  | Encryption  | Purpose         | Queryable           |
| ----------- | ----------- | --------------- | ------------------- |
| Text        | AES-256-CBC | Full security   | No                  |
| Number/Date | OPE         | Range queries   | Yes (>, <, BETWEEN) |
| Select      | HMAC-SHA256 | Equality checks | Yes (=, IN)         |

**Security Guarantees**:

- ✅ Server never sees encryption key
- ✅ Data encrypted before transmission
- ✅ Zero-knowledge architecture
- ⚠️ Key loss = permanent data loss (user responsibility)

## Data Flow

### CRUD Operations (with E2EE)

**Create Record**:

```typescript
// 1. User fills form
const formData = {
  name: 'John Doe',
  age: 30,
  status: 'active',
};

// 2. Client encrypts sensitive fields
const encrypted = await encryptRecord(formData, fields, encryptionKey);
// {
//   name: 'U2FsdGVkX1...' (AES-256),
//   age: '0x7B...' (OPE),
//   status: 'a3f7e9...' (HMAC)
// }

// 3. Send to API
await api.post('/api/workspace/{id}/workflow/create/active_records', {
  table_id: tableId,
  record: encrypted,
});

// 4. Server stores encrypted data (cannot read plaintext)

// 5. Client refetches list (React Query invalidation)
queryClient.invalidateQueries(['records', tableId]);
```

**Read Records**:

```typescript
// 1. Fetch encrypted records from API
const { data } = await api.post('/api/workspace/{id}/workflow/get_active_records', {
  table_id: tableId,
});

// 2. Client decrypts with stored key
const decrypted = await decryptRecords(data.records, fields, encryptionKey);

// 3. Display in UI (plaintext only exists in memory)
```

**Update Record**:

```typescript
// 1. User edits field
const updates = { name: 'Jane Doe' };

// 2. Encrypt changed fields only
const encrypted = await encryptFields(updates, fields, encryptionKey);

// 3. Send patch to API
await api.post('/api/workspace/{id}/workflow/update/active_records', {
  record_id: recordId,
  record: encrypted,
});

// 4. Optimistic update in React Query
queryClient.setQueryData(['record', recordId], (old) => ({
  ...old,
  ...updates,
}));
```

### Caching Strategy (React Query)

**Query Keys**:

```typescript
// Tables
['tables', workspaceId][('table', workspaceId, tableId)][
  // Records
  ('records', tableId, filters)
][('record', recordId)][
  // Comments
  ('comments', recordId)
][
  // Workspace
  'workspaces'
][('workspace', workspaceId)];
```

**Stale Time**: 5 minutes (default)
**Cache Time**: 10 minutes (garbage collection)

**Invalidation Triggers**:

- **Create**: Invalidate list query
- **Update**: Invalidate detail + list
- **Delete**: Remove from cache + invalidate list
- **Mutation error**: Rollback optimistic update

## Performance Optimizations

### Code Splitting

```
Entry Point (main.tsx)
    │
    ├─ React chunk (~150KB)
    ├─ Radix UI chunk (~300KB)
    ├─ TanStack chunk (~250KB)
    └─ Routes (lazy-loaded)
        │
        ├─ /login → login.chunk.js (~30KB)
        ├─ /workspaces → workspaces.chunk.js (~50KB)
        └─ /tables/:id → table-detail.chunk.js (~80KB)
```

**Lazy Loading Pattern**:

```typescript
// routes/$locale/workspaces/$workspaceId/tables/$tableId/index.tsx
import { lazy, Suspense } from 'react';

const TableDetailLazy = lazy(() => import('@/features/active-tables/pages/table-detail'));

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/')({
  component: () => (
    <Suspense fallback={<LoadingState />}>
      <TableDetailLazy />
    </Suspense>
  ),
});
```

### Virtual Scrolling

**For large datasets** (1000+ records):

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: records.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50, // 50px per row
  overscan: 10,
});

// Only render visible rows (huge performance boost)
virtualizer.getVirtualItems().map(virtualRow => {
  const record = records[virtualRow.index];
  return <TableRow key={record.id}>{...}</TableRow>;
});
```

### Memoization

```typescript
// Expensive computations
const sortedRecords = useMemo(() => {
  return records.sort((a, b) => a.name.localeCompare(b.name));
}, [records]);

// Prevent re-renders
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// Component memoization
export const ExpensiveComponent = memo(({ data }) => {
  // ...
});
```

## Security Architecture

### Threat Model

**Covered**:

1. ✅ **Man-in-the-Middle**: HTTPS + E2EE
2. ✅ **Server Breach**: Zero-knowledge encryption
3. ✅ **XSS**: React auto-escaping (DOMPurify for rich text)
4. ✅ **CSRF**: Token-based auth (backend)
5. ✅ **Brute Force**: Rate limiting (backend)

**User Responsibility**:

1. ⚠️ **Key Loss**: Permanent data loss (no recovery)
2. ⚠️ **Key Theft**: User must secure encryption key
3. ⚠️ **Phishing**: User education required

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Transport Security (HTTPS)                     │
│   - TLS 1.3 encryption                                  │
│   - Certificate pinning (recommended)                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Authentication (JWT)                           │
│   - Bearer token in Authorization header                │
│   - 7-day expiration                                    │
│   - httpOnly cookies (recommended upgrade)              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Authorization (Role-Based)                     │
│   - Workspace membership checks                         │
│   - Table-level permissions                             │
│   - Record-level permissions (self_created, etc.)       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Data Encryption (E2EE)                         │
│   - Client-side encryption/decryption                   │
│   - Server never has plaintext access                   │
│   - Zero-knowledge architecture                         │
└─────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Frontend Scalability

**Current**: Single-tenant SPA
**Target**: 500 concurrent users per instance

**Bottlenecks**:

1. Large datasets (1000+ records) → Virtual scrolling
2. Complex computations (encryption) → Web Workers (planned)
3. Memory leaks → Strict cleanup in useEffect

### Backend Scalability (Not in this repo)

**Assumed Architecture**:

- **Load Balancer**: Nginx/HAProxy
- **API Servers**: Horizontal scaling (stateless)
- **Database**: PostgreSQL with read replicas
- **Cache**: Redis for session data
- **Storage**: S3 for file uploads

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
│                   (Nginx / CloudFront)                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│  Web Server 1    │                  │  Web Server 2    │
│  (Nginx)         │                  │  (Nginx)         │
│                  │                  │                  │
│  - Static files  │                  │  - Static files  │
│  - Gzip          │                  │  - Gzip          │
│  - Caching       │                  │  - Caching       │
└──────────────────┘                  └──────────────────┘
```

**Deployment Options**:

1. **Docker** (Recommended): Multi-stage build, nginx:alpine
2. **Vercel**: Auto-deploy on git push
3. **AWS S3 + CloudFront**: Static hosting
4. **Netlify**: Continuous deployment

## Monitoring & Observability

### Recommended Tools

**Error Tracking**:

- **Sentry**: JavaScript error tracking, performance monitoring
- **LogRocket**: Session replay for debugging

**Analytics**:

- **Plausible**: Privacy-friendly analytics
- **Google Analytics**: User behavior tracking

**Performance**:

- **Lighthouse CI**: Automated performance audits
- **Web Vitals**: Core Web Vitals monitoring

**Uptime**:

- **UptimeRobot**: Endpoint monitoring
- **Pingdom**: Performance + uptime

## Future Enhancements

### Planned Improvements

1. **Web Workers**: Offload encryption to background threads
2. **IndexedDB**: Local caching for offline support
3. **Service Worker**: PWA capabilities, offline mode
4. **WebSocket**: Real-time updates (comments, collaboration)
5. **GraphQL**: Consider migration from REST for efficiency
6. **Micro-frontends**: Split apps into separate deployments

### Scalability Roadmap

**Phase 1** (Current):

- Single-tenant SPA
- Client-side encryption
- React Query caching

**Phase 2** (Q1 2026):

- Web Workers for encryption
- IndexedDB caching
- Service Worker (PWA)

**Phase 3** (Q2 2026):

- WebSocket real-time updates
- Micro-frontend architecture
- GraphQL migration

## Architecture Principles

**Guiding Principles**:

1. **Security First**: E2EE, zero-knowledge architecture
2. **Performance**: Code splitting, lazy loading, memoization
3. **Type Safety**: TypeScript strict mode, full coverage
4. **Maintainability**: Monorepo, shared packages, conventions
5. **Scalability**: Horizontal scaling, caching, virtual scrolling

**Trade-offs**:

- **E2EE vs. Searchability**: OPE/HMAC enable limited queries
- **Type Safety vs. Speed**: Strict TS adds build time
- **Monorepo vs. Simplicity**: More complex setup, better DX
- **React Query vs. Local State**: Network overhead, better UX

## Diagrams

### Component Hierarchy

```
<App>
  <AppProviders>
    <ThemeProvider>
      <QueryClientProvider>
        <RouterProvider>
          <RootLayout>
            <Sidebar>
              <WorkspaceSwitcher />
              <Navigation />
            </Sidebar>
            <MainContent>
              <Route /> {/* Lazy-loaded */}
            </MainContent>
          </RootLayout>
        </RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </AppProviders>
</App>
```

### Data Flow (React Query)

```
Component
    │
    ├─ useQuery(['records', tableId])
    │       │
    │       ├─ Check cache (stale < 5min?)
    │       │   └─ Return cached data
    │       │
    │       └─ Fetch from API
    │           ├─ Decrypt data
    │           ├─ Update cache
    │           └─ Return to component
    │
    └─ useMutation(updateRecord)
            │
            ├─ Optimistic update (immediate UI)
            ├─ Encrypt data
            ├─ POST to API
            │   ├─ Success → Invalidate queries
            │   └─ Error → Rollback optimistic update
            └─ Update complete
```

## References

- **Turborepo**: https://turbo.build/repo/docs
- **TanStack Router**: https://tanstack.com/router/latest
- **TanStack Query**: https://tanstack.com/query/latest
- **Vite**: https://vitejs.dev/guide/
- **React 19**: https://react.dev/blog/2025/11/react-19
- **E2EE Principles**: https://en.wikipedia.org/wiki/End-to-end_encryption
