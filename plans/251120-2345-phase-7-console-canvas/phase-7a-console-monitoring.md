# Phase 7A: Console Monitoring Implementation

**Duration**: 4 days (32 hours)
**Effort**: 40% of Phase 7
**Status**: 🟡 Planning

---

## Context & Dependencies

**Current State**:

- Workflow execution happens on backend
- No client-side visibility into runtime logs
- Users cannot debug failed workflows

**Goal**: Real-time log streaming via WebSocket with filtering, search, and persistence.

**Dependencies**:

- WebSocket endpoint: `ws://connect.o1erp.com`
- Query params: `?sys={workspaceId}&token=nvmteam&response_id={responseId}`
- Workflow execution must send logs to WebSocket server

---

## Architecture Decisions

### 1. State Management Strategy

**Console State** (Zustand store):

```typescript
interface ConsoleState {
  logs: LogMessage[];
  connected: boolean;
  levelFilter: LogLevel | null;
  searchQuery: string;
  autoScroll: boolean;

  // Actions
  addLog: (log: LogMessage) => void;
  clearLogs: () => void;
  setLevelFilter: (level: LogLevel | null) => void;
  setSearchQuery: (query: string) => void;
  toggleAutoScroll: () => void;
}
```

**Why Zustand?** Console state is feature-scoped, not global. Avoids React Query (server state) and useState (local only).

### 2. Virtual Scrolling

**Problem**: 10k+ logs cause render lag.
**Solution**: `react-window` FixedSizeList.

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={filteredLogs.length}
  itemSize={24} // 24px per log line
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>{renderLog(filteredLogs[index])}</div>
  )}
</FixedSizeList>
```

### 3. WebSocket Lifecycle

**Connection Flow**:

1. Component mount → establish WebSocket
2. `onopen` → set `connected = true`
3. `onmessage` → parse JSON → add to store
4. `onerror` / `onclose` → trigger reconnect
5. Component unmount → close WebSocket

**Reconnect Strategy** (exponential backoff):

- Retry 1: 1s delay
- Retry 2: 2s delay
- Retry 3: 4s delay
- Retry 4: 8s delay
- Retry 5: 16s delay (max)
- After 5 failures: show manual reconnect button

### 4. Log Persistence

**IndexedDB** for offline replay:

- Store logs by `responseId`
- 7-day retention (auto-prune)
- Enables "view past run" without backend

**Schema**:

```typescript
interface StoredLog {
  responseId: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}
```

---

## Component Specifications

### 1. WebSocket Hook (`useConsoleWebSocket`)

**File**: `apps/web/src/features/workflows/hooks/use-console-websocket.ts`

**Interface**:

```typescript
interface UseConsoleWebSocketReturn {
  logs: LogMessage[];
  connected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnect: () => void;
  clearLogs: () => void;
}

function useConsoleWebSocket(
  workspaceId: string,
  responseId: string,
  options?: {
    autoReconnect?: boolean;
    maxRetries?: number;
    persistLogs?: boolean;
  },
): UseConsoleWebSocketReturn;
```

**Responsibilities**:

- Establish WebSocket connection
- Parse incoming JSON messages
- Handle reconnection logic
- Integrate with Zustand store
- Persist to IndexedDB (if enabled)

**Error Handling**:

- Invalid JSON → log warning, skip message
- Connection timeout (30s) → trigger reconnect
- Max retries exceeded → show manual reconnect UI

---

### 2. Console Viewer Component

**File**: `apps/web/src/features/workflows/components/console-viewer.tsx`

**Props**:

```typescript
interface ConsoleViewerProps {
  workspaceId: string;
  responseId: string;
  height?: string; // Default: '600px'
  showToolbar?: boolean; // Default: true
}
```

**Layout** (Mobile-First):

```
┌─────────────────────────────────────┐
│ [●] Connected  [Search...] [Clear] │ ← Toolbar
├─────────────────────────────────────┤
│ [All] [Info] [Warn] [Error] [Debug]│ ← Level Filters
├─────────────────────────────────────┤
│ 12:34:56 INFO  Workflow started    │ ← Virtual List
│ 12:34:57 DEBUG Fetching table data │
│ 12:34:58 WARN  Slow query (2.3s)   │
│ 12:34:59 ERROR Connection failed   │
│ ...                                 │
│ [Auto-scroll ✓]      [Copy] [Export│ ← Footer
└─────────────────────────────────────┘
```

**Features**:

1. **Connection Badge**: Green (connected) / Red (disconnected) / Yellow (reconnecting)
2. **Search Input**: Filters logs by message content (case-insensitive, debounced 300ms)
3. **Level Filters**: Buttons to filter by log level (multi-select)
4. **Virtual List**: Renders visible logs only (react-window)
5. **Auto-Scroll Toggle**: Checkbox to enable/disable auto-scroll to bottom
6. **Copy Button**: Copy all filtered logs to clipboard
7. **Export Button**: Download logs as `.txt` file

**Accessibility**:

- `role="log"` on list container
- `aria-live="polite"` for new logs
- Keyboard nav: Tab through filters, Enter to toggle
- Screen reader announces connection status changes

---

### 3. Console Store (Zustand)

**File**: `apps/web/src/features/workflows/stores/console-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LogMessage {
  id: string;
  timestamp: string; // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

interface ConsoleStore {
  // State
  logs: LogMessage[];
  connected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  levelFilter: Set<string>; // {'info', 'error'}
  searchQuery: string;
  autoScroll: boolean;
  retryCount: number;

  // Actions
  addLog: (log: LogMessage) => void;
  addLogs: (logs: LogMessage[]) => void;
  clearLogs: () => void;
  setConnected: (connected: boolean) => void;
  setConnectionState: (state: ConnectionState) => void;
  toggleLevelFilter: (level: string) => void;
  setSearchQuery: (query: string) => void;
  toggleAutoScroll: () => void;
  incrementRetry: () => void;
  resetRetry: () => void;

  // Selectors
  filteredLogs: () => LogMessage[];
}

export const useConsoleStore = create<ConsoleStore>()(
  persist(
    (set, get) => ({
      logs: [],
      connected: false,
      connectionState: 'disconnected',
      levelFilter: new Set(),
      searchQuery: '',
      autoScroll: true,
      retryCount: 0,

      addLog: (log) =>
        set((state) => ({
          logs: [...state.logs, log].slice(-10000), // Keep last 10k logs
        })),

      addLogs: (newLogs) =>
        set((state) => ({
          logs: [...state.logs, ...newLogs].slice(-10000),
        })),

      clearLogs: () => set({ logs: [] }),

      setConnected: (connected) => set({ connected }),

      setConnectionState: (connectionState) => set({ connectionState }),

      toggleLevelFilter: (level) =>
        set((state) => {
          const newFilter = new Set(state.levelFilter);
          if (newFilter.has(level)) {
            newFilter.delete(level);
          } else {
            newFilter.add(level);
          }
          return { levelFilter: newFilter };
        }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      toggleAutoScroll: () => set((state) => ({ autoScroll: !state.autoScroll })),

      incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),

      resetRetry: () => set({ retryCount: 0 }),

      filteredLogs: () => {
        const { logs, levelFilter, searchQuery } = get();
        return logs.filter((log) => {
          if (levelFilter.size > 0 && !levelFilter.has(log.level)) return false;
          if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }
          return true;
        });
      },
    }),
    {
      name: 'workflow-console-storage',
      partialize: (state) => ({ autoScroll: state.autoScroll }), // Only persist preferences
    },
  ),
);
```

---

### 4. IndexedDB Persistence

**File**: `apps/web/src/features/workflows/utils/console-storage.ts`

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ConsoleDB extends DBSchema {
  logs: {
    key: string; // `${responseId}:${timestamp}`
    value: {
      responseId: string;
      timestamp: number;
      level: string;
      message: string;
      context?: Record<string, unknown>;
    };
    indexes: { 'by-response': string; 'by-timestamp': number };
  };
}

class ConsoleStorage {
  private db: IDBPDatabase<ConsoleDB> | null = null;

  async init() {
    this.db = await openDB<ConsoleDB>('workflow-console', 1, {
      upgrade(db) {
        const store = db.createObjectStore('logs', { keyPath: 'id' });
        store.createIndex('by-response', 'responseId');
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  async saveLogs(logs: LogMessage[], responseId: string) {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('logs', 'readwrite');
    await Promise.all(
      logs.map((log) =>
        tx.store.put({
          id: `${responseId}:${log.timestamp}`,
          responseId,
          timestamp: Date.parse(log.timestamp),
          level: log.level,
          message: log.message,
          context: log.context,
        }),
      ),
    );
    await tx.done;
  }

  async loadLogs(responseId: string): Promise<LogMessage[]> {
    if (!this.db) await this.init();
    const logs = await this.db!.getAllFromIndex('logs', 'by-response', responseId);
    return logs.map((log) => ({
      id: log.id,
      timestamp: new Date(log.timestamp).toISOString(),
      level: log.level as LogLevel,
      message: log.message,
      context: log.context,
    }));
  }

  async pruneOldLogs(daysToKeep = 7) {
    if (!this.db) await this.init();
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const tx = this.db!.transaction('logs', 'readwrite');
    const index = tx.store.index('by-timestamp');
    const range = IDBKeyRange.upperBound(cutoff);
    let cursor = await index.openCursor(range);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}

export const consoleStorage = new ConsoleStorage();
```

---

## Implementation Steps

### Day 1: Foundation (8 hours)

**Tasks**:

1. Install dependencies: `pnpm add react-window @types/react-window date-fns idb`
2. Create Zustand console store (`console-store.ts`)
3. Implement IndexedDB storage (`console-storage.ts`)
4. Write unit tests for store and storage

**Acceptance Criteria**:

- Store manages 10k logs without memory leak
- IndexedDB saves/loads logs correctly
- Tests cover edge cases (empty logs, invalid data)

---

### Day 2: WebSocket Hook (8 hours)

**Tasks**:

1. Implement `useConsoleWebSocket` hook
2. Add exponential backoff reconnect logic
3. Integrate with console store
4. Add heartbeat ping/pong (every 30s)
5. Write unit tests with mock WebSocket

**Acceptance Criteria**:

- WebSocket connects to `ws://connect.o1erp.com`
- Auto-reconnect after disconnect (max 5 retries)
- Logs appear in store within 100ms of message
- Heartbeat prevents idle disconnect

---

### Day 3: Console Viewer UI (8 hours)

**Tasks**:

1. Build `ConsoleViewer` component with virtual scrolling
2. Implement toolbar (connection status, search, clear)
3. Add level filter buttons
4. Implement auto-scroll with bottom detection
5. Add copy/export functionality
6. Style with design system tokens

**Acceptance Criteria**:

- Renders 10k logs without lag (< 500ms)
- Search filters logs in real-time
- Auto-scroll stops when user scrolls up
- Copy button copies filtered logs to clipboard
- Export downloads `.txt` file with timestamp

---

### Day 4: Integration & Testing (8 hours)

**Tasks**:

1. Create console route page (`workflow-console-page.tsx`)
2. Add route to TanStack Router (`$locale/workflows/$workflowId/console.tsx`)
3. Integrate with workflow detail page (add "Console" tab)
4. Write integration tests (WebSocket → Store → UI)
5. Test on mobile (responsive breakpoints)
6. Accessibility audit (keyboard nav, screen readers)

**Acceptance Criteria**:

- Console accessible from workflow detail page
- Logs display in real-time during workflow execution
- Mobile layout works on 375px width
- ARIA labels present, keyboard navigation functional
- No console errors or warnings

---

## Success Criteria

**Functional**:

- ✅ WebSocket connects to correct endpoint
- ✅ Logs stream in real-time (< 100ms latency)
- ✅ 10k logs render without lag (virtual scrolling)
- ✅ Filter by level works (multi-select)
- ✅ Search filters logs correctly
- ✅ Auto-reconnect on disconnect (exponential backoff)
- ✅ Copy/export actions work
- ✅ Logs persist to IndexedDB

**Non-Functional**:

- ✅ Mobile-responsive (375px - 1920px)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ No memory leaks (10k log rotation)
- ✅ Connection status updates within 100ms
- ✅ Design system compliant (no hardcoded colors)

---

## Risk Assessment

**High Risks**:

1. **WebSocket reliability in production**
   - Mitigation: Exponential backoff + heartbeat + manual reconnect
2. **Memory leak with large log volumes**
   - Mitigation: 10k log limit + rotation + IndexedDB offload

**Medium Risks**:

1. **Virtual scrolling performance on slow devices**
   - Mitigation: Test on low-end devices, adjust item size
2. **IndexedDB quota exceeded**
   - Mitigation: 7-day auto-prune, show quota warning

---

## Testing Strategy

**Unit Tests**:

- `console-store.ts`: Log addition, filtering, rotation
- `console-storage.ts`: Save/load/prune operations
- `use-console-websocket.ts`: Reconnect logic, heartbeat

**Integration Tests**:

- WebSocket → Store → UI data flow
- Search + filter combination
- Auto-scroll behavior

**E2E Tests** (Playwright):

- User opens console → sees real-time logs
- User filters by error level → only errors show
- User disconnects network → sees reconnect indicator

---

## Files Created

```
apps/web/src/features/workflows/
├── hooks/
│   └── use-console-websocket.ts       (NEW - 150 lines)
├── components/
│   ├── console-viewer.tsx             (NEW - 200 lines)
│   └── console-toolbar.tsx            (NEW - 80 lines)
├── stores/
│   └── console-store.ts               (NEW - 120 lines)
├── utils/
│   └── console-storage.ts             (NEW - 100 lines)
└── pages/
    └── workflow-console-page.tsx      (NEW - 50 lines)

apps/web/src/routes/
└── $locale/workflows/$workflowId/
    └── console.tsx                    (NEW - 40 lines)
```

**Total**: ~740 lines of new code

---

## Unresolved Questions

1. **Backend WebSocket format**: Confirm exact JSON schema for log messages
2. **Authentication**: Does WebSocket require JWT token or is `token=nvmteam` sufficient?
3. **Log retention**: Should we keep logs indefinitely or implement server-side cleanup?
4. **Pagination**: If logs exceed 10k, should we load older logs on-demand?

---

**Next**: Proceed to [Phase 7B: Canvas Polish](./phase-7b-canvas-polish.md)
