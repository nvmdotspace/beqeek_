import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Loader2, Settings2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { KanbanSettings } from './kanban-settings';
import type {
  ActiveTable,
  ActiveTableRecord,
  KanbanConfig,
} from '../../types';
import { useDecryptedRecords } from '../../hooks/use-decrypted-records';

/**
 * Kanban board component
 * Full-featured kanban board with drag-and-drop, encryption, and settings
 */

export interface KanbanBoardProps {
  /** Workspace ID */
  workspaceId: string;

  /** Active table configuration */
  table: ActiveTable;

  /** Records to display */
  records: ActiveTableRecord[];

  /** Encryption key (if E2EE enabled) */
  encryptionKey: string | null;

  /** Kanban configuration to use */
  config: KanbanConfig;

  /** Whether records are loading */
  isLoading?: boolean;

  /** Callback to update table configuration */
  onUpdateConfig: (config: KanbanConfig) => Promise<void>;

  /** Callback to update record */
  onUpdateRecord: (recordId: string, data: Record<string, unknown>) => Promise<void>;

  /** Callback when a card is clicked */
  onCardClick?: (record: ActiveTableRecord) => void;
}

/**
 * Main Kanban board with drag-and-drop functionality
 */
export function KanbanBoard({
  workspaceId,
  table,
  records,
  encryptionKey,
  config,
  isLoading = false,
  onUpdateConfig,
  onUpdateRecord,
  onCardClick,
}: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Decrypt records if encryption is enabled
  const { records: decryptedRecords, isDecrypting, hasError } = useDecryptedRecords({
    records,
    fields: table.config.fields,
    encryptionKey,
    isE2EEEnabled: table.config.e2eeEncryption,
  });

  // Get field definitions
  const statusField = config.statusField;
  const headlineField = config.kanbanHeadlineField;
  const displayFields = config.displayFields || [];

  const statusFieldDef = useMemo(
    () => table.config.fields.find((field) => field.name === statusField),
    [table.config.fields, statusField]
  );

  const statusOptions = statusFieldDef?.options || [];

  // Build column colors map
  const columnColors = useMemo(() => {
    const colors: Record<string, string> = {};
    config.columnStyles?.forEach((style) => {
      colors[style.value] = style.color;
    });
    return colors;
  }, [config.columnStyles]);

  // Group records by status
  const columns = useMemo(() => {
    if (!statusField) return [];

    return statusOptions.map((option) => ({
      id: option.value,
      label: option.text,
      color: columnColors[option.value] || option.background_color || '#e2e8f0',
      records: decryptedRecords.filter(
        (record) => String(record.record[statusField] || '') === option.value
      ),
    }));
  }, [statusOptions, statusField, decryptedRecords, columnColors]);

  // Find active record for drag overlay
  const activeRecord = useMemo(
    () => decryptedRecords.find((record) => record.id === activeId),
    [activeId, decryptedRecords]
  );

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize mutation function to prevent recreation on every render
  const updateRecordMutation = useMutation({
    mutationFn: useCallback(async ({
      recordId,
      newStatus,
    }: {
      recordId: string;
      newStatus: string;
    }) => {
      await onUpdateRecord(recordId, {
        [statusField]: newStatus,
      });
    }, [onUpdateRecord, statusField]),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['active-tables', workspaceId] });
      toast.success('Record moved successfully');
    }, [queryClient, workspaceId]),
    onError: useCallback((error: Error) => {
      console.error('Failed to update record:', error);
      toast.error('Failed to move record');
    }, []),
  });

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  // Handle drag over (visual feedback)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  }, []);

  // Handle drag end (update record)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setOverId(null);

      if (!over) return;

      const activeRecordId = String(active.id);
      const overColumnId = String(over.id);

      // Find the record being dragged
      const draggedRecord = decryptedRecords.find((r) => r.id === activeRecordId);
      if (!draggedRecord) return;

      const currentStatus = String(draggedRecord.record[statusField] || '');

      // If dropped on a different column, update the record
      if (overColumnId !== currentStatus && statusOptions.some((opt) => opt.value === overColumnId)) {
        updateRecordMutation.mutate({
          recordId: activeRecordId,
          newStatus: overColumnId,
        });
      }
    },
    [decryptedRecords, statusField, statusOptions, updateRecordMutation]
  );

  // Handle cancel drag
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  // Loading state
  if (isLoading || isDecrypting) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading kanban board...
            </span>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Error state
  if (hasError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Decryption Error</CardTitle>
          <CardDescription>
            Failed to decrypt records. Please check your encryption key.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // No status field configured
  if (!statusFieldDef || statusOptions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Kanban Board</CardTitle>
          <CardDescription>
            No status field configured. Please configure a SELECT_ONE field as the status field.
          </CardDescription>
          <div className="pt-4">
            <KanbanSettings
              fields={table.config.fields}
              config={config}
              onSave={onUpdateConfig}
              trigger={
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Configure Kanban
                </Button>
              }
            />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with settings */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {config.screenName || 'Kanban Board'}
          </h2>
          {config.screenDescription && (
            <p className="text-sm text-muted-foreground">
              {config.screenDescription}
            </p>
          )}
        </div>
        <KanbanSettings
          fields={table.config.fields}
          config={config}
          onSave={onUpdateConfig}
        />
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              label={column.label}
              color={column.color}
              records={column.records}
              headlineField={headlineField}
              displayFields={displayFields}
              fields={table.config.fields}
              isOver={overId === column.id}
              onCardClick={onCardClick}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeId && activeRecord ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard
                record={activeRecord}
                headlineField={headlineField}
                displayFields={displayFields}
                fields={table.config.fields}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {decryptedRecords.length === 0 && (
        <Card className="border-dashed">
          <CardHeader className="py-12">
            <div className="text-center">
              <CardTitle className="text-base">No Records</CardTitle>
              <CardDescription>
                Create your first record to see it on the kanban board
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
