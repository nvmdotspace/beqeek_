import type { Announcements, DndContextProps, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createContext, type HTMLAttributes, type ReactNode, useContext, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import tunnel from 'tunnel-rat';
import { Card } from '../../../card.js';
import { ScrollArea, ScrollBar } from '../../../scroll-area.js';
import { cn } from '../../../../lib/utils.js';

const t = tunnel();

export type { DragEndEvent } from '@dnd-kit/core';

type KanbanItemProps = {
  id: string;
  name: string;
  column: string;
} & Record<string, unknown>;

type KanbanColumnProps = {
  id: string;
  name: string;
} & Record<string, unknown>;

type KanbanContextProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
> = {
  columns: C[];
  data: T[];
  activeCardId: string | null;
};

const KanbanContext = createContext<KanbanContextProps>({
  columns: [],
  data: [],
  activeCardId: null,
});

export type KanbanBoardProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        'flex size-full min-h-40 flex-col divide-y overflow-hidden rounded-md border bg-secondary text-xs shadow-sm ring-2 transition-all',
        isOver ? 'ring-primary' : 'ring-transparent',
        className,
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export type KanbanCardProps<T extends KanbanItemProps = KanbanItemProps> = T & {
  children?: ReactNode;
  className?: string;
};

export const KanbanCard = <T extends KanbanItemProps = KanbanItemProps>({
  id,
  name,
  children,
  className,
}: KanbanCardProps<T>) => {
  const { attributes, listeners, setNodeRef, transition, transform, isDragging } = useSortable({
    id,
  });
  const { activeCardId } = useContext(KanbanContext) as KanbanContextProps;

  const style = useMemo(
    () => ({
      transition,
      transform: CSS.Transform.toString(transform),
    }),
    [transition, transform],
  );

  return (
    <>
      <div style={style} {...listeners} {...attributes} ref={setNodeRef}>
        <Card
          className={cn(
            'cursor-grab gap-4 rounded-md p-3 shadow-sm',
            isDragging && 'pointer-events-none cursor-grabbing opacity-30',
            className,
          )}
        >
          {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
        </Card>
      </div>
      {activeCardId === id && (
        <t.In>
          <Card
            className={cn(
              'cursor-grab gap-4 rounded-md p-3 shadow-sm ring-2 ring-primary',
              isDragging && 'cursor-grabbing',
              className,
            )}
          >
            {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
          </Card>
        </t.In>
      )}
    </>
  );
};

export type KanbanCardsProps<T extends KanbanItemProps = KanbanItemProps> = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'id'
> & {
  children: (item: T) => ReactNode;
  id: string;
};

export const KanbanCards = <T extends KanbanItemProps = KanbanItemProps>({
  children,
  className,
  ...props
}: KanbanCardsProps<T>) => {
  const { data } = useContext(KanbanContext) as KanbanContextProps<T>;
  const filteredData = useMemo(() => data.filter((item) => item.column === props.id), [data, props.id]);
  const items = useMemo(() => filteredData.map((item) => item.id), [filteredData]);

  return (
    <ScrollArea className="overflow-hidden">
      <SortableContext items={items}>
        <div className={cn('flex flex-grow flex-col gap-2 p-2', className)} {...props}>
          {filteredData.map(children)}
        </div>
      </SortableContext>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export type KanbanHeaderProps = HTMLAttributes<HTMLDivElement>;

export const KanbanHeader = ({ className, ...props }: KanbanHeaderProps) => (
  <div className={cn('m-0 p-2 font-semibold text-sm', className)} {...props} />
);

export type KanbanProviderProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
> = Omit<DndContextProps, 'children'> & {
  children: (column: C) => ReactNode;
  className?: string;
  columns: C[];
  data: T[];
  onDataChange?: (data: T[]) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
};

export const KanbanProvider = <
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
>({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  onDataChange,
  ...props
}: KanbanProviderProps<T, C>) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));

  const handleDragStart = (event: DragStartEvent) => {
    const card = data.find((item) => item.id === event.active.id);
    if (card) {
      setActiveCardId(event.active.id as string);
    }
    onDragStart?.(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    // Performance optimization: only process if columns actually different
    const activeItem = data.find((item) => item.id === active.id);
    if (!activeItem) return;

    const activeColumn = activeItem.column;
    const overItem = data.find((item) => item.id === over.id);
    const overColumn = overItem?.column || columns.find((col) => col.id === over.id)?.id || columns[0]?.id;

    // BUSINESS RULE: Disable in-column reordering
    // Only allow cross-column moves (cards always go to bottom of target column)
    if (activeColumn === overColumn) {
      return; // No change needed - same column
    }

    let newData = data;
    const activeIndex = newData.findIndex((item) => item.id === active.id);

    // For cross-column moves, move card to bottom of target column
    if (activeIndex !== -1 && activeColumn !== overColumn) {
      // Only create new array if we need to change columns
      newData = [...data];
      if (newData[activeIndex]) {
        newData[activeIndex].column = overColumn || '';
      }

      // Find the last index of the target column to insert at bottom
      const targetColumnItems = newData.filter((item) => item.column === overColumn);
      const lastItem = targetColumnItems[targetColumnItems.length - 1];
      const lastTargetIndex = lastItem ? newData.lastIndexOf(lastItem) : newData.length - 1;

      // Move to bottom of target column
      const itemToMove = newData[activeIndex];
      if (itemToMove) {
        newData.splice(activeIndex, 1);
        newData.splice(lastTargetIndex + 1, 0, itemToMove);
      }

      onDataChange?.(newData);
    }

    onDragOver?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);

    // Call parent's onDragEnd FIRST (for API calls)
    onDragEnd?.(event);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeItem = data.find((item) => item.id === active.id);
    const overItem = data.find((item) => item.id === over.id);
    const activeColumn = activeItem?.column;
    const overColumn = overItem?.column || columns.find((col) => col.id === over.id)?.id || columns[0]?.id;

    // BUSINESS RULE: Disable in-column reordering
    // Only allow cross-column moves
    if (activeColumn === overColumn) {
      return; // Same column - do nothing
    }

    // Cross-column move already handled in handleDragOver
    // This is just a final sync in case onDragOver didn't fire
    const newData = [...data];
    const oldIndex = newData.findIndex((item) => item.id === active.id);

    if (oldIndex !== -1 && newData[oldIndex]) {
      const targetColumn = overItem?.column || columns.find((col) => col.id === over.id)?.id || columns[0]?.id;

      // Only update if column actually changed
      if (newData[oldIndex].column !== targetColumn) {
        newData[oldIndex].column = targetColumn || '';

        // Find the last index of the target column to insert at bottom
        const targetColumnItems = newData.filter((item) => item.column === targetColumn);
        const lastItem = targetColumnItems[targetColumnItems.length - 1];
        const lastTargetIndex = lastItem ? newData.lastIndexOf(lastItem) : newData.length - 1;

        // Move to bottom of target column
        const itemToMove = newData[oldIndex];
        if (itemToMove) {
          newData.splice(oldIndex, 1);
          newData.splice(lastTargetIndex + 1, 0, itemToMove);
        }

        onDataChange?.(newData);
      }
    }
  };

  const announcements: Announcements = {
    onDragStart({ active }) {
      const { name, column } = data.find((item) => item.id === active.id) ?? {};

      return `Picked up the card "${name}" from the "${column}" column`;
    },
    onDragOver({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;

      return `Dragged the card "${name}" over the "${newColumn}" column`;
    },
    onDragEnd({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;

      return `Dropped the card "${name}" into the "${newColumn}" column`;
    },
    onDragCancel({ active }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};

      return `Cancelled dragging the card "${name}"`;
    },
  };

  return (
    <KanbanContext.Provider value={{ columns, data, activeCardId }}>
      <DndContext
        accessibility={{ announcements }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <div className={cn('grid size-full auto-cols-fr grid-flow-col gap-4', className)}>
          {columns.map((column) => children(column))}
        </div>
        {typeof window !== 'undefined' &&
          createPortal(
            <DragOverlay>
              <t.Out />
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </KanbanContext.Provider>
  );
};
