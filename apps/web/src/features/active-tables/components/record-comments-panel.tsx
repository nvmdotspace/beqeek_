import type { ActiveTable, ActiveTableRecord } from "../types";

export interface RecordCommentsPanelProps {
  table: ActiveTable;
  record: ActiveTableRecord | null;
  onClose?: () => void;
}

/**
 * Comments panel component (stub - will be implemented in Phase 5)
 */
export function RecordCommentsPanel(props: RecordCommentsPanelProps) {
  if (!props.record) {
    return null;
  }

  return (
    <div className="flex h-full flex-col rounded-md border">
      <div className="border-b p-4">
        <h3 className="text-lg font-medium">Comments</h3>
        <p className="text-sm text-muted-foreground">Record ID: {props.record.id}</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium">Comments Panel</p>
          <p className="text-sm text-muted-foreground">Coming soon in Phase 5</p>
        </div>
      </div>
    </div>
  );
}
