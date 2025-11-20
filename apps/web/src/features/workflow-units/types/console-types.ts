/**
 * Console Monitoring Types
 *
 * Type definitions for workflow execution console logs
 * and WebSocket communication.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ConsoleLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  eventId: string;
  eventName: string;
  executionId: string;
  stepId?: string;
  stepName?: string;
  metadata?: Record<string, unknown>;
}

export interface WebSocketMessage {
  type: 'log' | 'status' | 'ping' | 'pong';
  data: ConsoleLog | StatusUpdate | null;
}

export interface StatusUpdate {
  eventId: string;
  executionId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  timestamp: Date;
}

export interface ConsoleFilters {
  levels: LogLevel[];
  search: string;
  eventId?: string;
  executionId?: string;
}

export interface ConsoleState {
  logs: ConsoleLog[];
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  filters: ConsoleFilters;
  autoScroll: boolean;
}
