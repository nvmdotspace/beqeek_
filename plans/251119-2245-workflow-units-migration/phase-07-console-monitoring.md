# Phase 7: Console Monitoring

**Date**: 2025-11-19 22:45
**Duration**: Week 8 (5 days)
**Status**: ⚪ Not Started

---

## Overview

Implement real-time console monitoring via WebSocket. Display workflow execution logs with filtering, search, auto-scroll.

---

## Key Requirements

**WebSocket Connection**:

- Endpoint: `ws://connect.o1erp.com`
- Params: `?sys={workspaceId}&token=nvmteam&response_id={responseId}`
- Auto-reconnect on disconnect
- Connection status indicator

**Console Viewer**:

- Real-time log streaming
- Log levels: info, warn, error
- Filter by level
- Search logs
- Auto-scroll to latest
- Copy log to clipboard
- Clear logs button

---

## Implementation Steps

### Step 1: WebSocket Hook (3 hours)

```typescript
// hooks/use-console-websocket.ts
import { useEffect, useState } from 'react';

interface LogMessage {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

export const useConsoleWebSocket = (workspaceId: string, responseId: string) => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://connect.o1erp.com?sys=${workspaceId}&token=nvmteam&response_id=${responseId}`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const log: LogMessage = JSON.parse(event.data);
      setLogs((prev) => [...prev, log]);
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);

    wsRef.current = ws;

    return () => ws.close();
  }, [workspaceId, responseId]);

  const clearLogs = () => setLogs([]);

  return { logs, connected, clearLogs };
};
```

### Step 2: Console Viewer Component (3 hours)

```typescript
// components/console-viewer.tsx
import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Code } from '@workspace/ui/components/typography';

export const ConsoleViewer = ({ responseId }: { responseId: string }) => {
  const { logs, connected, clearLogs } = useConsoleWebSocket(workspaceId, responseId);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (levelFilter && log.level !== levelFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box padding="space-300" className="h-screen flex flex-col">
      <Stack space="space-200" className="flex-1 overflow-hidden">
        {/* Header */}
        <Inline space="space-200" justify="between" align="center">
          <Inline space="space-100" align="center">
            <Badge variant={connected ? 'success' : 'destructive'}>
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Text size="small" color="muted">{logs.length} logs</Text>
          </Inline>

          <Inline space="space-150">
            <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Clear
            </Button>
          </Inline>
        </Inline>

        {/* Filters */}
        <Inline space="space-100">
          <Button size="sm" variant={levelFilter === null ? 'default' : 'outline'} onClick={() => setLevelFilter(null)}>
            All
          </Button>
          <Button size="sm" variant={levelFilter === 'info' ? 'default' : 'outline'} onClick={() => setLevelFilter('info')}>
            Info
          </Button>
          <Button size="sm" variant={levelFilter === 'warn' ? 'default' : 'outline'} onClick={() => setLevelFilter('warn')}>
            Warn
          </Button>
          <Button size="sm" variant={levelFilter === 'error' ? 'default' : 'outline'} onClick={() => setLevelFilter('error')}>
            Error
          </Button>
        </Inline>

        {/* Logs */}
        <Box className="flex-1 overflow-y-auto font-mono text-sm">
          {filteredLogs.map((log, idx) => (
            <div key={idx} className="mb-1">
              <span className="text-muted-foreground">{log.timestamp}</span>{' '}
              <Badge variant={log.level === 'error' ? 'destructive' : log.level === 'warn' ? 'warning' : 'default'}>
                {log.level}
              </Badge>{' '}
              {log.message}
            </div>
          ))}
          <div ref={bottomRef} />
        </Box>
      </Stack>
    </Box>
  );
};
```

### Step 3: Console Page (1 hour)

```typescript
// pages/workflow-console.tsx
export default function WorkflowConsolePage() {
  const { eventId } = useParams();
  const { data: event } = useWorkflowEvent(workspaceId, eventId);

  return (
    <Container maxWidth="full" padding="space-0">
      <ConsoleViewer responseId={event?.responseId} />
    </Container>
  );
}
```

---

## Success Criteria

- ✅ WebSocket connects successfully
- ✅ Logs stream in real-time
- ✅ Filter by level works
- ✅ Search filters logs
- ✅ Auto-scroll to latest log
- ✅ Connection status visible
- ✅ Auto-reconnect on disconnect

---

**Phase 7 Completion**: When real-time logs display correctly
