import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { memo, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import type { ActiveTableRecord, ActiveFieldConfig } from '../../types';

/**
 * Kanban card component
 * Displays a single record as a draggable card in a kanban column
 *
 * Performance optimizations:
 * - React.memo to prevent unnecessary re-renders
 * - useMemo for expensive computations (field filtering, formatting)
 * - useCallback for stable onClick handler
 */

export interface KanbanCardProps {
  /** Record data to display */
  record: ActiveTableRecord;

  /** Field to use as card headline */
  headlineField: string;

  /** Additional fields to display in card body */
  displayFields: string[];

  /** All table field configurations */
  fields: ActiveFieldConfig[];

  /** Whether the card is in drag mode */
  isDragging?: boolean;

  /** Callback when card is clicked */
  onClick?: (record: ActiveTableRecord) => void;
}

/**
 * Format field value for display
 * Handles different field types and null/undefined values
 */
function formatFieldValue(value: unknown, fieldType: string): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  switch (fieldType) {
    case 'DATE':
      if (typeof value === 'string') {
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return String(value);
        }
      }
      return String(value);

    case 'DATETIME':
      if (typeof value === 'string') {
        try {
          return new Date(value).toLocaleString();
        } catch {
          return String(value);
        }
      }
      return String(value);

    case 'SELECT_LIST':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);

    case 'NUMERIC':
    case 'INTEGER':
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return String(value);

    case 'BOOLEAN':
      return value ? 'Yes' : 'No';

    default:
      return String(value);
  }
}

/**
 * Kanban card component with drag-and-drop support
 * Uses @dnd-kit/sortable for drag functionality
 *
 * Optimized with React.memo - only re-renders when:
 * - record data changes
 * - field configuration changes
 * - drag state changes
 */
const KanbanCardComponent = ({
  record,
  headlineField,
  displayFields,
  fields,
  isDragging = false,
  onClick,
}: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: record.id,
  });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition]);

  // Memoize headline value computation
  const headline = useMemo(() => {
    const headlineValue = record.record[headlineField];
    return headlineValue !== null && headlineValue !== undefined
      ? String(headlineValue)
      : record.id;
  }, [record.record, record.id, headlineField]);

  // Memoize visible fields computation (expensive: filtering + mapping + formatting)
  const visibleFields = useMemo(() => {
    return displayFields
      .filter((fieldName) => fieldName !== headlineField)
      .map((fieldName) => {
        const field = fields.find((f) => f.name === fieldName);
        const value = record.record[fieldName];
        return {
          name: fieldName,
          label: field?.label || fieldName,
          value,
          type: field?.type || 'SHORT_TEXT',
        };
      })
      .filter((field) => field.value !== undefined);
  }, [displayFields, headlineField, fields, record.record]);

  const isCurrentlyDragging = isDragging || isSortableDragging;

  // Stable onClick handler to prevent child re-renders
  const handleClick = useCallback(() => {
    onClick?.(record);
  }, [onClick, record]);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          'group cursor-pointer border-border/60 bg-background shadow-sm transition-all',
          'hover:border-border hover:shadow-md',
          isCurrentlyDragging && 'opacity-50 shadow-lg ring-2 ring-primary/20'
        )}
        onClick={handleClick}
      >
        <CardContent className="p-3">
          {/* Drag handle + Headline */}
          <div className="mb-2 flex items-start gap-2">
            <button
              type="button"
              className={cn(
                'mt-0.5 cursor-grab touch-none text-muted-foreground/40',
                'transition-colors hover:text-muted-foreground',
                'focus:outline-none focus-visible:text-muted-foreground',
                isCurrentlyDragging && 'cursor-grabbing'
              )}
              aria-label="Drag card"
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <h4 className="flex-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
              {headline}
            </h4>
          </div>

          {/* Display fields */}
          {visibleFields.length > 0 && (
            <ul className="space-y-1 border-t border-border/30 pt-2 text-xs">
              {visibleFields.map((field) => (
                <li key={field.name} className="flex items-baseline gap-2">
                  <span className="min-w-0 flex-shrink-0 font-medium text-muted-foreground">
                    {field.label}:
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {formatFieldValue(field.value, field.type)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Record metadata (optional - show on hover) */}
          <div className="mt-2 flex items-center justify-between border-t border-border/20 pt-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {record.createdAt && (
              <span>
                {new Date(record.createdAt).toLocaleDateString()}
              </span>
            )}
            {record.createdBy && (
              <span className="truncate">{record.createdBy}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Memoized KanbanCard component
 *
 * Custom equality function prevents re-renders when:
 * - Record content hasn't changed (deep comparison)
 * - Display configuration is the same
 * - Drag state is the same
 */
export const KanbanCard = memo(KanbanCardComponent, (prevProps, nextProps) => {
  // Check if record data has changed (shallow comparison of record.record object)
  if (prevProps.record.id !== nextProps.record.id) {
    return false; // Record changed, re-render
  }

  // Check if record content has changed
  const prevRecord = prevProps.record.record;
  const nextRecord = nextProps.record.record;
  if (JSON.stringify(prevRecord) !== JSON.stringify(nextRecord)) {
    return false; // Record content changed, re-render
  }

  // Check if display configuration changed
  if (
    prevProps.headlineField !== nextProps.headlineField ||
    prevProps.displayFields.length !== nextProps.displayFields.length ||
    prevProps.displayFields.some((field, i) => field !== nextProps.displayFields[i])
  ) {
    return false; // Display config changed, re-render
  }

  // Check if drag state changed
  if (prevProps.isDragging !== nextProps.isDragging) {
    return false; // Drag state changed, re-render
  }

  // No relevant changes, skip re-render
  return true;
});
