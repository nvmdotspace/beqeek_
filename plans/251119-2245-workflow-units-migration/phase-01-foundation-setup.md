# Phase 1: Foundation Setup

**Date**: 2025-11-19 22:45
**Duration**: Week 1 (5 days)
**Priority**: Critical
**Dependencies**: None
**Status**: ⚪ Not Started

---

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Related Docs**:
  - Functional spec: `/docs/workflow-units-functional-spec.md`
  - Design system: `/docs/design-system.md`
  - CLAUDE.md: `/CLAUDE.md`
  - Route patterns: `/apps/web/src/shared/route-helpers.md`
- **Next Phase**: [Phase 2: Workflow Units CRUD](./phase-02-workflow-units-crud.md)

---

## Overview

Establish foundation for Workflow Units migration: folder structure, dependencies, routing, API skeleton, and Zustand store. Creates scaffolding for subsequent phases without implementing business logic.

**Implementation Status**: Not Started
**Review Status**: Pending

---

## Key Insights

### Research Findings

**React Flow v12 (@xyflow/react)**:

- Package renamed from `reactflow` to `@xyflow/react`
- Node dimensions: `node.measured.width/height` (changed from v11)
- Custom nodes are standard React components
- Built-in features: Background, Controls, MiniMap, Panel
- Auto code-splitting with lazy loading

**TanStack Router File-based Routing**:

- Routes auto-generated from `src/routes/**/*.tsx`
- `createFileRoute()` function for type-safe definitions
- `getRouteApi()` for type-safe param extraction
- Route constants centralized in `shared/route-paths.ts`
- Auto-generates `routeTree.gen.ts` (DO NOT edit)

**Monaco Editor React**:

- `@monaco-editor/react` provides clean wrapper API
- `monaco-yaml` plugin for YAML language support
- Worker registration required for language services
- Theme integration with design system tokens

**State Management Strategy**:

- React Query: Server data (API calls, caching, mutations)
- Zustand: Editor state (nodes, edges, mode, selected)
- useState: Local UI state (forms, toggles, dialogs)

---

## Requirements

### Functional Requirements

1. **Routing**: 4 routes for Workflow Units module
   - List page: `/$locale/workspaces/$workspaceId/workflow-units`
   - Unit detail: `/$locale/workspaces/$workspaceId/workflow-units/$unitId`
   - Event editor: `/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit`
   - Console: `/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/console`

2. **API Client**: Skeleton methods for units and events
   - WorkflowUnitsAPI: 5 methods (get list, get one, create, update, delete)
   - WorkflowEventsAPI: 5 methods + 3 helper methods

3. **Store**: Zustand store for workflow editor state
   - Nodes and edges
   - Editor mode (visual/YAML)
   - Selected node IDs
   - Canvas zoom/pan state

### Technical Requirements

1. **Dependencies**:
   - `@xyflow/react` ^12.0.0
   - `@monaco-editor/react` ^4.6.0
   - `js-yaml` ^4.1.0 + `@types/js-yaml`
   - `dagre` ^0.8.5 + `@types/dagre`
   - `zod` ^3.22.4 (already in project)

2. **TypeScript**: Strict mode, full type coverage
3. **Design System**: Use design tokens for placeholder UI
4. **Mobile-first**: Responsive breakpoints

### Design Requirements

1. **Layout**: Use layout primitives (Container, Stack, Inline, Grid)
2. **Typography**: Use typography components (Heading, Text)
3. **Colors**: Design tokens only (no hardcoded values)
4. **Spacing**: Atlassian 8px system (space-100 to space-1000)

---

## Architecture

### Folder Structure

```
apps/web/src/features/workflow-units/
├── api/
│   ├── workflow-units-api.ts          # Units API client
│   ├── workflow-events-api.ts         # Events API client
│   └── types.ts                       # Request/response types
├── components/
│   ├── workflow-builder/              # React Flow components (Phase 3)
│   ├── workflow-unit-list.tsx         # List view (Phase 2)
│   ├── workflow-event-list.tsx        # Event list (Phase 5)
│   ├── console-viewer.tsx             # Console (Phase 7)
│   └── dialogs/                       # CRUD dialogs (Phase 2)
├── hooks/
│   ├── use-workflow-units.ts          # React Query hooks (Phase 2)
│   ├── use-workflow-events.ts         # Event hooks (Phase 5)
│   ├── use-workflow-builder.ts        # React Flow state (Phase 3)
│   └── use-console-websocket.ts       # WebSocket (Phase 7)
├── stores/
│   └── workflow-editor-store.ts       # Zustand store
├── utils/
│   ├── yaml-to-nodes.ts               # YAML parser (Phase 4)
│   ├── nodes-to-yaml.ts               # YAML serializer (Phase 4)
│   └── node-types.ts                  # Node type definitions (Phase 3)
├── pages/
│   ├── workflow-units-list.tsx        # List page (Phase 2)
│   ├── workflow-unit-detail.tsx       # Detail page (Phase 2)
│   ├── workflow-event-editor.tsx      # Event editor (Phase 5)
│   └── workflow-console.tsx           # Console page (Phase 7)
└── types.ts                           # Feature-level types

apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-units/
├── index.tsx                          # List route
├── $unitId/
│   ├── index.tsx                      # Detail route
│   └── events/
│       └── $eventId/
│           ├── edit.tsx               # Event editor route
│           └── console.tsx            # Console route
```

### Data Flow

```
User Action → Route Change
            ↓
  TanStack Router
            ↓
  Lazy-load Page Component
            ↓
  React Query Hook → API Client → Server
            ↓
  Zustand Store (editor state)
            ↓
  UI Components (React Flow, Monaco)
```

### API Endpoint Structure

```typescript
// Base: /api/workspace/{workspaceId}/workflow

// Workflow Units
POST /get/workflow_units                    // List
POST /get/workflow_units/{unitId}           // Detail
POST /post/workflow_units                   // Create
POST /patch/workflow_units/{unitId}         // Update
POST /delete/workflow_units/{unitId}        // Delete

// Workflow Events
POST /get/workflow_events                   // List (filter by unitId)
POST /get/workflow_events/{eventId}         // Detail
POST /post/workflow_events                  // Create
POST /patch/workflow_events/{eventId}       // Update
POST /delete/workflow_events/{eventId}      // Delete

// Helpers
POST /get/workflow_forms                    // List forms
POST /get/active_tables                     // List tables
POST /get/active_tables/{tableId}           // Table detail
```

---

## Related Code Files

**Existing files to reference**:

- `/apps/web/src/shared/api/http-client.ts` - Base HTTP client
- `/apps/web/src/shared/api/api-error.ts` - Error handling
- `/apps/web/src/shared/route-paths.ts` - Route constants
- `/apps/web/src/features/active-tables/api/active-tables-client.ts` - API pattern
- `/apps/web/src/features/workspace/stores/workspace-store.ts` - Zustand pattern

**Files to create**:

1. `/apps/web/src/features/workflow-units/api/workflow-units-api.ts`
2. `/apps/web/src/features/workflow-units/api/workflow-events-api.ts`
3. `/apps/web/src/features/workflow-units/api/types.ts`
4. `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`
5. `/apps/web/src/features/workflow-units/pages/workflow-units-list.tsx`
6. `/apps/web/src/features/workflow-units/pages/workflow-unit-detail.tsx`
7. `/apps/web/src/features/workflow-units/pages/workflow-event-editor.tsx`
8. `/apps/web/src/features/workflow-units/pages/workflow-console.tsx`
9. `/apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-units/index.tsx`
10. `/apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-units/$unitId/index.tsx`
11. `/apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit.tsx`
12. `/apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/console.tsx`

---

## Implementation Steps

### Step 1: Install Dependencies (30 min)

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek

# Install React Flow
pnpm add @xyflow/react

# Install Monaco Editor
pnpm add @monaco-editor/react

# Install YAML parsing
pnpm add js-yaml
pnpm add -D @types/js-yaml

# Install dagre for auto-layout
pnpm add dagre
pnpm add -D @types/dagre

# Verify installation
pnpm list @xyflow/react @monaco-editor/react js-yaml dagre
```

### Step 2: Create Folder Structure (15 min)

```bash
# Create feature directories
mkdir -p apps/web/src/features/workflow-units/{api,components,hooks,stores,utils,pages}
mkdir -p apps/web/src/features/workflow-units/components/{workflow-builder,dialogs}

# Create route directories
mkdir -p apps/web/src/routes/\$locale/workspaces/\$workspaceId/workflow-units/\$unitId/events/\$eventId
```

### Step 3: Define API Types (1 hour)

Create `apps/web/src/features/workflow-units/api/types.ts`:

```typescript
// Workflow Unit types
export interface WorkflowUnit {
  id: string; // Snowflake ID
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowUnitRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkflowUnitRequest {
  name?: string;
  description?: string;
}

// Workflow Event types
export type EventSourceType = 'SCHEDULE' | 'WEBHOOK' | 'OPTIN_FORM' | 'ACTIVE_TABLE';

export interface WorkflowEvent {
  id: string; // Snowflake ID
  workflowUnit: string; // Unit ID
  eventName: string;
  eventSourceType: EventSourceType;
  eventSourceParams: EventSourceParams;
  eventActive: boolean;
  yaml: string; // YAML content
  responseId: string; // UUID for WebSocket
  createdAt: string;
  updatedAt: string;
}

export type EventSourceParams = ScheduleParams | WebhookParams | OptinFormParams | ActiveTableParams;

export interface ScheduleParams {
  expression: string; // Cron expression
}

export interface WebhookParams {
  webhookId: string; // UUID
}

export interface OptinFormParams {
  formId: string; // Snowflake ID
  webhookId: string; // UUID
  actionId?: string; // UUID (optional)
}

export interface ActiveTableParams {
  tableId: string; // Snowflake ID
  actionId: string; // UUID
  webhookId: string; // UUID (same as actionId)
}

export interface CreateWorkflowEventRequest {
  workflowUnit: string;
  eventName: string;
  eventSourceType: EventSourceType;
  eventSourceParams: EventSourceParams;
  eventActive?: boolean;
  yaml?: string;
}

export interface UpdateWorkflowEventRequest {
  eventName?: string;
  eventSourceType?: EventSourceType;
  eventSourceParams?: EventSourceParams;
  eventActive?: boolean;
  yaml?: string;
}

// Helper types
export interface WorkflowForm {
  id: string;
  name: string;
}

export interface ActiveTable {
  id: string;
  name: string;
  actions?: TableAction[];
}

export interface TableAction {
  id: string;
  name: string;
  type: string;
}
```

### Step 4: Create API Client Skeleton (1.5 hours)

Create `apps/web/src/features/workflow-units/api/workflow-units-api.ts`:

```typescript
import { httpClient } from '@/shared/api/http-client';
import type { WorkflowUnit, CreateWorkflowUnitRequest, UpdateWorkflowUnitRequest } from './types';

const getBasePath = (workspaceId: string) => `/api/workspace/${workspaceId}/workflow`;

export const workflowUnitsApi = {
  /**
   * Get list of workflow units
   */
  async getWorkflowUnits(workspaceId: string): Promise<WorkflowUnit[]> {
    const response = await httpClient.post<WorkflowUnit[]>(`${getBasePath(workspaceId)}/get/workflow_units`);
    return response.data;
  },

  /**
   * Get single workflow unit by ID
   */
  async getWorkflowUnit(workspaceId: string, unitId: string): Promise<WorkflowUnit> {
    const response = await httpClient.post<WorkflowUnit>(`${getBasePath(workspaceId)}/get/workflow_units/${unitId}`);
    return response.data;
  },

  /**
   * Create new workflow unit
   */
  async createWorkflowUnit(workspaceId: string, data: CreateWorkflowUnitRequest): Promise<WorkflowUnit> {
    const response = await httpClient.post<WorkflowUnit>(`${getBasePath(workspaceId)}/post/workflow_units`, data);
    return response.data;
  },

  /**
   * Update existing workflow unit
   */
  async updateWorkflowUnit(
    workspaceId: string,
    unitId: string,
    data: UpdateWorkflowUnitRequest,
  ): Promise<WorkflowUnit> {
    const response = await httpClient.post<WorkflowUnit>(
      `${getBasePath(workspaceId)}/patch/workflow_units/${unitId}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete workflow unit
   */
  async deleteWorkflowUnit(workspaceId: string, unitId: string): Promise<void> {
    await httpClient.post(`${getBasePath(workspaceId)}/delete/workflow_units/${unitId}`);
  },
};
```

Create `apps/web/src/features/workflow-units/api/workflow-events-api.ts` (similar pattern).

### Step 5: Create Zustand Store (1 hour)

Create `apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`:

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Node, Edge } from '@xyflow/react';

export type EditorMode = 'visual' | 'yaml';

interface WorkflowEditorState {
  // Editor mode
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;

  // React Flow state
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;

  // Selection
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;

  // Canvas state
  zoom: number;
  setZoom: (zoom: number) => void;

  // Current editing event
  currentEventId: string | null;
  setCurrentEventId: (id: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  mode: 'visual' as EditorMode,
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  zoom: 1,
  currentEventId: null,
};

export const useWorkflowEditorStore = create<WorkflowEditorState>()(
  devtools(
    (set) => ({
      ...initialState,

      setMode: (mode) => set({ mode }),

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      updateNodes: (nodes) => set({ nodes }),
      updateEdges: (edges) => set({ edges }),

      setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),

      setZoom: (zoom) => set({ zoom }),

      setCurrentEventId: (currentEventId) => set({ currentEventId }),

      reset: () => set(initialState),
    }),
    { name: 'WorkflowEditor' },
  ),
);
```

### Step 6: Add Route Constants (30 min)

Update `/apps/web/src/shared/route-paths.ts`:

```typescript
export const ROUTES = {
  // ... existing routes

  WORKFLOW_UNITS: {
    LIST: '/$locale/workspaces/$workspaceId/workflow-units' as const,
    DETAIL: '/$locale/workspaces/$workspaceId/workflow-units/$unitId' as const,
    EVENT_EDITOR: '/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit' as const,
    EVENT_CONSOLE: '/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/console' as const,
  },
};
```

### Step 7: Create Route Files (2 hours)

Create 4 route files with placeholder content:

**1. List route** (`workflow-units/index.tsx`):

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const WorkflowUnitsListPage = lazy(
  () => import('@/features/workflow-units/pages/workflow-units-list'),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-units/')({
  component: WorkflowUnitsListRoute,
});

function WorkflowUnitsListRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowUnitsListPage />
    </Suspense>
  );
}
```

**2-4. Similar pattern for detail, event editor, console routes**

### Step 8: Create Placeholder Pages (1 hour)

Create 4 page components with basic layout using design system:

```typescript
// workflow-units-list.tsx
import { Container, Stack } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';

export default function WorkflowUnitsListPage() {
  return (
    <Container maxWidth="xl" padding="margin">
      <Stack space="space-400">
        <Heading level={1}>Workflow Units</Heading>
        <Text color="muted">List page - Phase 2</Text>
      </Stack>
    </Container>
  );
}
```

### Step 9: Verify Build & Routes (30 min)

```bash
# Type check
pnpm --filter web check-types

# Build
pnpm build

# Start dev server
pnpm --filter web dev

# Test routes (manual browser check):
# - http://localhost:4173/vi/workspaces/{workspaceId}/workflow-units
# - http://localhost:4173/vi/workspaces/{workspaceId}/workflow-units/{unitId}
# - http://localhost:4173/vi/workspaces/{workspaceId}/workflow-units/{unitId}/events/{eventId}/edit
# - http://localhost:4173/vi/workspaces/{workspaceId}/workflow-units/{unitId}/events/{eventId}/console
```

---

## Todo List

- [ ] Install dependencies (@xyflow/react, @monaco-editor/react, js-yaml, dagre)
- [ ] Create folder structure (feature + routes)
- [ ] Define API types (WorkflowUnit, WorkflowEvent, params)
- [ ] Create workflow-units-api.ts (5 methods)
- [ ] Create workflow-events-api.ts (8 methods)
- [ ] Create workflow-editor-store.ts (Zustand)
- [ ] Add route constants to shared/route-paths.ts
- [ ] Create 4 route files (index, detail, edit, console)
- [ ] Create 4 placeholder page components
- [ ] Verify type checking passes
- [ ] Verify build succeeds
- [ ] Verify routes work in browser

---

## Success Criteria

**Testable**:

- ✅ `pnpm build` completes without errors
- ✅ `pnpm --filter web check-types` passes
- ✅ All 4 routes render placeholder content
- ✅ Zustand store accepts state updates
- ✅ API client methods have correct types
- ✅ No hardcoded colors (design tokens only)

**Measurable**:

- 12 files created
- 4 routes functional
- 0 TypeScript errors
- 0 ESLint errors
- Dependencies installed: 5 packages

---

## Risk Assessment

| Risk                          | Impact | Probability | Mitigation                                     |
| ----------------------------- | ------ | ----------- | ---------------------------------------------- |
| Dependency version conflicts  | Medium | Low         | Use exact versions, test build immediately     |
| Route naming conflicts        | Low    | Low         | Follow TanStack Router conventions             |
| Type definition errors        | Medium | Medium      | Reference existing API patterns, run tsc often |
| Store structure inadequate    | Medium | Medium      | Keep simple initially, refactor in Phase 3     |
| Folder structure non-scalable | Low    | Low         | Follow existing feature patterns               |

---

## Security Considerations

- **API Client**: Reuse existing httpClient with auth headers
- **Route Guards**: Implement in Phase 2 with `beforeLoad` hooks
- **Type Safety**: Zod schemas in Phase 4 for runtime validation
- **No Secrets**: API keys managed server-side only

---

## Next Steps

**Dependencies**:

- Phase 2 requires: API client skeleton, route structure, types

**Blockers**: None

**Handoff**:

- Once routes render placeholder content, Phase 2 can implement CRUD operations
- Share route constants with team for navigation consistency

---

**Phase 1 Completion**: When all routes render and type checking passes
