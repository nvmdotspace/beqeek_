/**
 * Workflow Console Page
 *
 * Real-time console monitoring for workflow event execution.
 * Displays live logs from WebSocket connection.
 */

import { getRouteApi } from '@tanstack/react-router';
import { ConsoleViewer } from '../components/console-viewer';
import { useConsoleWebSocket } from '../hooks/use-console-websocket';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/console');

export default function WorkflowConsolePage() {
  const { workspaceId, eventId } = route.useParams();

  const {
    logs,
    isConnected,
    isConnecting,
    error,
    filters,
    autoScroll,
    totalLogs,
    clearLogs,
    setFilters,
    setAutoScroll,
  } = useConsoleWebSocket({
    workspaceId,
    eventId,
    enabled: true,
  });

  return (
    <div className="h-screen">
      <ConsoleViewer
        logs={logs}
        isConnected={isConnected}
        isConnecting={isConnecting}
        error={error}
        filters={filters}
        autoScroll={autoScroll}
        totalLogs={totalLogs}
        onClearLogs={clearLogs}
        onSetFilters={setFilters}
        onSetAutoScroll={setAutoScroll}
      />
    </div>
  );
}
