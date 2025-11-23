/**
 * ConsoleViewer Component
 *
 * Displays workflow execution logs with virtual scrolling,
 * filtering, search, and export capabilities.
 */

import { useRef, useEffect, useState } from 'react';
import { List, type ListImperativeAPI } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { format } from 'date-fns';
import { Search, Download, Trash2, AlertCircle, Info, AlertTriangle, XCircle, Bug } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';
import type { ConsoleLog, LogLevel, ConsoleFilters } from '../types/console-types';

interface ConsoleViewerProps {
  logs: ConsoleLog[];
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  filters: ConsoleFilters;
  autoScroll: boolean;
  totalLogs: number;
  onClearLogs: () => void;
  onSetFilters: (filters: Partial<ConsoleFilters>) => void;
  onSetAutoScroll: (autoScroll: boolean) => void;
}

const LOG_LEVEL_ICONS: Record<LogLevel, React.ElementType> = {
  debug: Bug,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: 'text-muted-foreground',
  info: 'text-primary',
  warn: 'text-warning', // Uses --warning design token
  error: 'text-destructive',
};

const ROW_HEIGHT = 80; // Height of each log row

export function ConsoleViewer({
  logs,
  isConnected,
  isConnecting,
  error,
  filters,
  autoScroll,
  totalLogs,
  onClearLogs,
  onSetFilters,
  onSetAutoScroll,
}: ConsoleViewerProps) {
  const listRef = useRef<ListImperativeAPI>(null);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logs.length > 0 && listRef.current) {
      listRef.current.scrollToRow({ index: logs.length - 1, align: 'end' });
    }
  }, [logs.length, autoScroll]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSetFilters({ search: searchInput });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput, onSetFilters]);

  // Export logs to clipboard
  const handleExport = () => {
    const text = logs
      .map(
        (log) =>
          `[${format(log.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}] [${log.level.toUpperCase()}] ${log.eventName}${
            log.stepName ? ` > ${log.stepName}` : ''
          }: ${log.message}`,
      )
      .join('\n');

    navigator.clipboard.writeText(text);
  };

  // Toggle log level filter
  const toggleLevel = (level: LogLevel) => {
    const levels = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    onSetFilters({ levels });
  };

  // Render individual log row
  const LogRow = ({
    index,
    style,
    ariaAttributes,
  }: {
    index: number;
    style: React.CSSProperties;
    ariaAttributes: {
      'aria-posinset': number;
      'aria-setsize': number;
      role: 'listitem';
    };
  }) => {
    const log = logs[index];
    if (!log) {
      return (
        <div style={style} {...ariaAttributes}>
          {/* Empty row for invalid index */}
        </div>
      );
    }

    const Icon = LOG_LEVEL_ICONS[log.level];
    const colorClass = LOG_LEVEL_COLORS[log.level];

    return (
      <div
        style={style}
        {...ariaAttributes}
        className={cn(
          'flex items-start gap-3 px-4 py-2 border-b border-border',
          'hover:bg-muted/50 transition-colors',
          'font-mono text-sm',
        )}
      >
        {/* Timestamp */}
        <span className="text-muted-foreground whitespace-nowrap">{format(log.timestamp, 'HH:mm:ss.SSS')}</span>

        {/* Level Icon + Badge */}
        <div className="flex items-center gap-2 min-w-[80px]">
          <Icon className={cn('h-4 w-4', colorClass)} aria-hidden="true" />
          <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'} className="text-xs">
            {log.level.toUpperCase()}
          </Badge>
        </div>

        {/* Log Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{log.eventName}</span>
            {log.stepName && (
              <>
                <span className="text-muted-foreground">›</span>
                <span className="text-muted-foreground">{log.stepName}</span>
              </>
            )}
          </div>
          <p className="text-foreground break-words">{log.message}</p>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-muted-foreground text-xs hover:text-foreground">
                Show metadata
              </summary>
              <pre className="mt-1 text-xs text-muted-foreground overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isConnected ? 'bg-success' : isConnecting ? 'bg-warning animate-pulse' : 'bg-destructive',
              )}
              aria-label={isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
            />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
            <Badge variant="secondary" className="ml-2">
              {totalLogs} total • {logs.length} shown
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={logs.length === 0}
              aria-label="Export logs to clipboard"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearLogs}
              disabled={totalLogs === 0}
              aria-label="Clear all logs"
            >
              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search logs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            aria-label="Search logs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-6">
          {/* Log Level Filters */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Levels:</Label>
            {(['debug', 'info', 'warn', 'error'] as LogLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={filters.levels.includes(level)}
                  onCheckedChange={() => toggleLevel(level)}
                  aria-label={`Filter ${level} logs`}
                />
                <Label htmlFor={`level-${level}`} className="text-sm capitalize cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </div>

          {/* Auto-scroll Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={onSetAutoScroll}
              aria-label="Auto-scroll to latest log"
            />
            <Label htmlFor="auto-scroll" className="text-sm cursor-pointer">
              Auto-scroll
            </Label>
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="flex-1 relative">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
              <p className="text-lg font-medium">No logs to display</p>
              <p className="text-sm mt-1">
                {isConnected ? 'Logs will appear here when workflow executes' : 'Waiting for connection...'}
              </p>
            </div>
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                listRef={listRef}
                rowCount={logs.length}
                rowHeight={ROW_HEIGHT}
                rowComponent={LogRow}
                rowProps={
                  {
                    /* LogRow only uses index, style, and ariaAttributes which are provided by List */
                  } as Record<string, never>
                }
                defaultHeight={height}
                overscanCount={5}
                className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                style={{ width }}
              />
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
}
