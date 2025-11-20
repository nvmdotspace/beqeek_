/**
 * useConsoleWebSocket Hook
 *
 * Manages WebSocket connection to workflow execution console.
 * Handles auto-reconnect, message parsing, and log state management.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ConsoleLog, ConsoleState, WebSocketMessage } from '../types/console-types';

interface UseConsoleWebSocketOptions {
  workspaceId: string;
  eventId?: string;
  enabled?: boolean;
  maxLogs?: number;
  onLog?: (log: ConsoleLog) => void;
  onError?: (error: Error) => void;
}

const WS_URL = 'ws://connect.o1erp.com';
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff
const MAX_LOGS = 10000; // Default max logs to prevent memory issues
const PING_INTERVAL = 30000; // 30s heartbeat

export function useConsoleWebSocket(options: UseConsoleWebSocketOptions) {
  const { workspaceId, eventId, enabled = true, maxLogs = MAX_LOGS, onLog, onError } = options;

  const [state, setState] = useState<ConsoleState>({
    logs: [],
    isConnected: false,
    isConnecting: false,
    error: null,
    filters: {
      levels: ['debug', 'info', 'warn', 'error'],
      search: '',
    },
    autoScroll: true,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);

  // Add log to state with deduplication
  const addLog = useCallback(
    (log: ConsoleLog) => {
      setState((prev) => {
        // Deduplicate by log ID
        const exists = prev.logs.some((l) => l.id === log.id);
        if (exists) return prev;

        // Add new log
        const newLogs = [...prev.logs, log];

        // Trim if exceeds max
        if (newLogs.length > maxLogs) {
          newLogs.splice(0, newLogs.length - maxLogs);
        }

        return {
          ...prev,
          logs: newLogs,
        };
      });

      // Call callback if provided
      if (onLog) {
        onLog(log);
      }
    },
    [maxLogs, onLog],
  );

  // Parse incoming WebSocket message
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === 'log' && message.data) {
          const log = message.data as ConsoleLog;
          // Convert timestamp string to Date object
          log.timestamp = new Date(log.timestamp);
          addLog(log);
        } else if (message.type === 'ping') {
          // Respond to ping with pong
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'pong' }));
          }
        }
      } catch (error) {
        console.error('[ConsoleWebSocket] Failed to parse message:', error);
      }
    },
    [addLog],
  );

  // Setup WebSocket connection
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Construct WebSocket URL with query params
      const url = new URL(WS_URL);
      url.searchParams.set('token', 'nvmteam'); // TODO: Replace with actual auth token
      url.searchParams.set('workspaceId', workspaceId);
      if (eventId) {
        url.searchParams.set('eventId', eventId);
      }

      const ws = new WebSocket(url.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[ConsoleWebSocket] Connected');
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        reconnectAttemptsRef.current = 0;

        // Start heartbeat ping
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('[ConsoleWebSocket] Error:', error);
        const err = new Error('WebSocket connection error');
        setState((prev) => ({ ...prev, error: err }));
        if (onError) {
          onError(err);
        }
      };

      ws.onclose = () => {
        console.log('[ConsoleWebSocket] Disconnected');
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Auto-reconnect with exponential backoff
        if (enabled) {
          const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptsRef.current, RECONNECT_DELAYS.length - 1)];
          console.log(`[ConsoleWebSocket] Reconnecting in ${delay}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('[ConsoleWebSocket] Failed to create connection:', error);
      const err = error instanceof Error ? error : new Error('Failed to create WebSocket');
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err,
      }));
      if (onError) {
        onError(err);
      }
    }
  }, [enabled, workspaceId, eventId, handleMessage, onError]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
  }, []);

  // Clear all logs
  const clearLogs = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [] }));
  }, []);

  // Update filters
  const setFilters = useCallback((filters: Partial<ConsoleState['filters']>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  // Toggle auto-scroll
  const setAutoScroll = useCallback((autoScroll: boolean) => {
    setState((prev) => ({ ...prev, autoScroll }));
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Reconnect when workspaceId or eventId changes
  useEffect(() => {
    if (enabled) {
      disconnect();
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, eventId]);

  // Filter logs based on current filters
  const filteredLogs = state.logs.filter((log) => {
    // Filter by level
    if (!state.filters.levels.includes(log.level)) {
      return false;
    }

    // Filter by search text
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      const matchesMessage = log.message.toLowerCase().includes(search);
      const matchesEventName = log.eventName.toLowerCase().includes(search);
      const matchesStepName = log.stepName?.toLowerCase().includes(search);

      if (!matchesMessage && !matchesEventName && !matchesStepName) {
        return false;
      }
    }

    // Filter by eventId if specified
    if (state.filters.eventId && log.eventId !== state.filters.eventId) {
      return false;
    }

    // Filter by executionId if specified
    if (state.filters.executionId && log.executionId !== state.filters.executionId) {
      return false;
    }

    return true;
  });

  return {
    ...state,
    logs: filteredLogs,
    totalLogs: state.logs.length,
    connect,
    disconnect,
    clearLogs,
    setFilters,
    setAutoScroll,
  };
}
