import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';
import { KanbanCard } from './kanban-card';
import type { ActiveTableRecord, ActiveFieldConfig } from '../../types';

/**
 * Kanban column component
 * Represents a single status column in the kanban board
 */

export interface KanbanColumnProps {
  /** Unique column identifier (status value) */
  id: string;

  /** Column display label */
  label: string;

  /** Column header color */
  color?: string;

  /** Records in this column */
  records: ActiveTableRecord[];

  /** Field to use as card headline */
  headlineField: string;

  /** Additional fields to display in cards */
  displayFields: string[];

  /** All table field configurations */
  fields: ActiveFieldConfig[];

  /** Whether the column is currently being dragged over */
  isOver?: boolean;

  /** Callback when a card is clicked */
  onCardClick?: (record: ActiveTableRecord) => void;
}

/**
 * Empty state component for columns with no records
 */
function EmptyColumnState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20 p-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          No items in {label}
        </p>
      </div>
    </div>
  );
}

/**
 * Kanban column with droppable area and sortable cards
 * Uses @dnd-kit/core for drop functionality and @dnd-kit/sortable for card sorting
 */
export function KanbanColumn({
  id,
  label,
  color = '#e2e8f0',
  records,
  headlineField,
  displayFields,
  fields,
  isOver = false,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  // Extract record IDs for SortableContext
  const recordIds = records.map((record) => record.id);

  return (
    <Card
      className={cn(
        'flex min-w-[280px] max-w-[320px] flex-1 flex-col',
        'border border-border/70 bg-muted/30 transition-colors',
        isOver && 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
      )}
      style={{
        borderTop: `4px solid ${color}`,
      }}
    >
      {/* Column header */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex-1 text-sm font-semibold text-foreground">
            {label}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'text-xs font-medium',
              records.length > 0 && 'bg-primary/10 text-primary'
            )}
          >
            {records.length}
          </Badge>
        </div>
      </CardHeader>

      {/* Droppable area with cards */}
      <CardContent className="flex-1 overflow-hidden px-2 py-0 pb-3">
        <ScrollArea className="h-[calc(100vh-280px)] min-h-[320px] pr-2">
          <div ref={setNodeRef} className="space-y-2">
            {records.length === 0 ? (
              <EmptyColumnState label={label} />
            ) : (
              <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
                {records.map((record) => (
                  <KanbanCard
                    key={record.id}
                    record={record}
                    headlineField={headlineField}
                    displayFields={displayFields}
                    fields={fields}
                    onClick={onCardClick}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
