import type { ActiveTable, ActiveTableRecord } from "../types";

export interface RecordKanbanViewProps {
  table: ActiveTable;
  records: ActiveTableRecord[];
  onRecordSelect?: (record: ActiveTableRecord) => void;
  onEdit?: (record: ActiveTableRecord) => void;
  onDelete?: (record: ActiveTableRecord) => void;
}

/**
 * Kanban view component (stub - will be implemented in Phase 4)
 */
export function RecordKanbanView(_props: RecordKanbanViewProps) {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
      <div className="text-center">
        <p className="text-lg font-medium">Kanban View</p>
        <p className="text-sm text-muted-foreground">Coming soon in Phase 4</p>
      </div>
    </div>
  );
}
